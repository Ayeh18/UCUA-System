import io
from pathlib import Path

import pytest
from fastapi import UploadFile

from app.core.exceptions import ValidationFailedError
from app.services.storage_service import (
    AVATAR_KINDS,
    JPEG,
    PDF,
    PNG,
    REPORT_ATTACHMENT_KINDS,
    FileStorage,
    detect_file_kind,
    public_upload_url,
)

PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32
JPEG_BYTES = b"\xff\xd8\xff\xe0" + b"\x00" * 32
PDF_BYTES = b"%PDF-1.7\n" + b"\x00" * 32


def make_upload(content: bytes, filename: str = "photo.png") -> UploadFile:
    return UploadFile(file=io.BytesIO(content), filename=filename)


def test_detect_file_kind():
    assert detect_file_kind(PNG_BYTES) == PNG
    assert detect_file_kind(JPEG_BYTES) == JPEG
    assert detect_file_kind(PDF_BYTES) == PDF
    assert detect_file_kind(b"MZ\x90\x00 executable") is None


def test_save_uses_random_name_and_ignores_client_filename(tmp_path: Path):
    storage = FileStorage(tmp_path / "imgs", allowed_kinds=REPORT_ATTACHMENT_KINDS, max_bytes=1024)
    [stored] = storage.save_all([make_upload(PNG_BYTES, filename="../../evil.py")])

    saved = Path(stored)
    assert saved.parent == tmp_path / "imgs"
    assert saved.suffix == ".png"
    assert "evil" not in saved.name
    assert saved.read_bytes() == PNG_BYTES


def test_rejects_unsupported_type(tmp_path: Path):
    storage = FileStorage(tmp_path, allowed_kinds=AVATAR_KINDS, max_bytes=1024)
    with pytest.raises(ValidationFailedError, match="not a supported file type"):
        storage.save(make_upload(PDF_BYTES, "cv.pdf"))


def test_rejects_oversized_file(tmp_path: Path):
    storage = FileStorage(tmp_path, allowed_kinds=AVATAR_KINDS, max_bytes=10)
    with pytest.raises(ValidationFailedError, match="larger than"):
        storage.save(make_upload(PNG_BYTES))


def test_nothing_is_saved_when_any_file_is_invalid(tmp_path: Path):
    storage = FileStorage(tmp_path / "imgs", allowed_kinds=AVATAR_KINDS, max_bytes=1024)
    with pytest.raises(ValidationFailedError):
        storage.save_all([make_upload(PNG_BYTES), make_upload(b"not an image", "x.txt")])
    assert not (tmp_path / "imgs").exists() or not any((tmp_path / "imgs").iterdir())


def test_delete_refuses_paths_outside_storage(tmp_path: Path):
    outside = tmp_path / "keep.txt"
    outside.write_text("important")
    storage = FileStorage(tmp_path / "imgs", allowed_kinds=AVATAR_KINDS, max_bytes=1024)
    storage.delete(str(outside))
    assert outside.exists()


@pytest.mark.parametrize(
    ("stored", "expected"),
    [
        ("uploads/profile_abc.png", "/uploads/profile_abc.png"),
        ("./uploads/profile_pics/abc.jpg", "/uploads/profile_pics/abc.jpg"),
        ("uploads\\profile_abc.png", "/uploads/profile_abc.png"),
        ("/app/uploads/profile_abc.png", "/uploads/profile_abc.png"),
        (None, None),
        ("", None),
        ("uploads/../secrets.txt", None),
    ],
)
def test_public_upload_url(stored, expected):
    assert public_upload_url(stored, Path("uploads")) == expected
