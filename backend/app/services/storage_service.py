"""Local file storage for uploaded images.

Uploaded files are identified by their content (magic bytes), not by the client-supplied
filename or content type, and are saved under a random name so that a crafted filename such
as `../../main.py` cannot escape the upload directory.
"""

import logging
import os
import shutil
import uuid
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import BinaryIO

from fastapi import UploadFile

from app.core.exceptions import ValidationFailedError

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class FileKind:
    mime: str
    extension: str


JPEG = FileKind("image/jpeg", ".jpg")
PNG = FileKind("image/png", ".png")
GIF = FileKind("image/gif", ".gif")
WEBP = FileKind("image/webp", ".webp")
PDF = FileKind("application/pdf", ".pdf")

IMAGE_KINDS = frozenset({JPEG, PNG, GIF, WEBP})
REPORT_ATTACHMENT_KINDS = IMAGE_KINDS | {PDF}
AVATAR_KINDS = frozenset({JPEG, PNG, WEBP})


def detect_file_kind(head: bytes) -> FileKind | None:
    if head.startswith(b"\xff\xd8\xff"):
        return JPEG
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return PNG
    if head.startswith((b"GIF87a", b"GIF89a")):
        return GIF
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return WEBP
    if head.startswith(b"%PDF-"):
        return PDF
    return None


def _stream_size(stream: BinaryIO) -> int:
    stream.seek(0, os.SEEK_END)
    size = stream.tell()
    stream.seek(0)
    return size


def is_empty_upload(upload: UploadFile) -> bool:
    """Browsers send an empty part when a file input is left blank."""
    return not upload.filename and _stream_size(upload.file) == 0


class FileStorage:
    def __init__(
        self,
        directory: Path,
        *,
        allowed_kinds: frozenset[FileKind],
        max_bytes: int,
        filename_prefix: str = "",
    ) -> None:
        self.directory = directory
        self.allowed_kinds = allowed_kinds
        self.max_bytes = max_bytes
        self.filename_prefix = filename_prefix

    def _validate(self, upload: UploadFile) -> FileKind:
        label = upload.filename or "file"
        size = _stream_size(upload.file)
        if size == 0:
            raise ValidationFailedError(f"'{label}' is empty")
        if size > self.max_bytes:
            limit_mb = self.max_bytes // (1024 * 1024)
            raise ValidationFailedError(f"'{label}' is larger than {limit_mb} MB")

        kind = detect_file_kind(upload.file.read(16))
        upload.file.seek(0)
        if kind not in self.allowed_kinds:
            allowed = ", ".join(sorted(k.extension.lstrip(".").upper() for k in self.allowed_kinds))
            raise ValidationFailedError(f"'{label}' is not a supported file type ({allowed})")
        return kind

    def save_all(self, uploads: list[UploadFile]) -> list[str]:
        """Validate every file first, then save them; returns paths relative to the backend root."""
        kinds = [self._validate(upload) for upload in uploads]
        self.directory.mkdir(parents=True, exist_ok=True)

        saved: list[str] = []
        try:
            for upload, kind in zip(uploads, kinds, strict=True):
                filename = f"{self.filename_prefix}{uuid.uuid4().hex}{kind.extension}"
                with open(self.directory / filename, "wb") as buffer:
                    shutil.copyfileobj(upload.file, buffer)
                saved.append((PurePosixPath(self.directory.as_posix()) / filename).as_posix())
        except Exception:
            self.delete_all(saved)
            raise
        return saved

    def save(self, upload: UploadFile) -> str:
        return self.save_all([upload])[0]

    def delete_all(self, stored_paths: list[str]) -> None:
        for stored_path in stored_paths:
            self.delete(stored_path)

    def delete(self, stored_path: str) -> None:
        """Delete a previously stored file, refusing anything outside this storage directory."""
        try:
            target = Path(stored_path).resolve()
            if not target.is_relative_to(self.directory.resolve()):
                logger.warning("Refusing to delete file outside storage dir: %s", stored_path)
                return
            target.unlink(missing_ok=True)
        except OSError:
            logger.warning("Could not delete stored file %s", stored_path, exc_info=True)


def public_upload_url(stored_path: str | None, upload_dir: Path, mount_path: str = "/uploads") -> str | None:
    """Map a stored path (e.g. `uploads/profile_x.png` or legacy `./uploads/profile_pics/x.jpg`)
    to the URL it is served from by the static files mount."""
    if not stored_path:
        return None
    parts = [p for p in PurePosixPath(stored_path.replace("\\", "/")).parts if p not in ("", ".", "/")]
    if upload_dir.name in parts:
        parts = parts[parts.index(upload_dir.name) + 1 :]
    if not parts or ".." in parts:
        return None
    return f"{mount_path}/{'/'.join(parts)}"
