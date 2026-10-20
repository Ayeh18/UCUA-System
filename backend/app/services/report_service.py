from fastapi import UploadFile
from psycopg2.extensions import connection as PgConnection

from app.core.config import get_settings
from app.core.exceptions import NotFoundError, ValidationFailedError
from app.repositories.lookup_repository import LookupRepository
from app.repositories.report_repository import ReportRepository
from app.repositories.user_repository import UserRepository
from app.schemas.report import StaffReport, VisitorReport
from app.services.points_service import PointsService
from app.services.storage_service import REPORT_ATTACHMENT_KINDS, FileStorage, is_empty_upload
from app.utils.time import local_now, to_db_timestamp


def report_storage() -> FileStorage:
    settings = get_settings()
    return FileStorage(
        settings.report_image_dir,
        allowed_kinds=REPORT_ATTACHMENT_KINDS,
        max_bytes=settings.max_upload_size_bytes,
    )


class ReportService:
    def __init__(self, conn: PgConnection, storage: FileStorage | None = None) -> None:
        self.conn = conn
        self.reports = ReportRepository(conn)
        self.users = UserRepository(conn)
        self.lookups = LookupRepository(conn)
        self.storage = storage or report_storage()

    def _prepare_uploads(self, images: list[UploadFile]) -> list[UploadFile]:
        uploads = [image for image in images if not is_empty_upload(image)]
        limit = get_settings().max_images_per_report
        if len(uploads) > limit:
            raise ValidationFailedError(f"You can attach at most {limit} files per report")
        return uploads

    def submit_staff_report(self, staff_id: str, report: StaffReport, images: list[UploadFile]) -> int:
        reporter = self.users.get_reporter_details(staff_id)
        if not reporter:
            raise NotFoundError("Staff not found")

        uploads = self._prepare_uploads(images)
        now = local_now()
        image_paths = self.storage.save_all(uploads)
        try:
            self.reports.create_staff_report(
                staff_id=staff_id,
                name=reporter["name"],
                department=reporter["department"],
                designation=reporter["designation"],
                date_time=to_db_timestamp(now),
                month=now.strftime("%B"),
                location=report.location,
                specific_location=report.specific_location,
                classification=report.classification.value,
                stop_work=report.stop_work.value,
                observation=report.observation,
                corrective_action=report.corrective_action,
                image_paths=image_paths,
            )
            PointsService(self.conn).sync_user_points(staff_id)
            self.conn.commit()
        except Exception:
            self.storage.delete_all(image_paths)
            raise
        return len(image_paths)

    def submit_visitor_report(self, report: VisitorReport, images: list[UploadFile]) -> int:
        if not self.lookups.company_exists(report.company):
            raise ValidationFailedError("Selected company is not registered.")

        uploads = self._prepare_uploads(images)
        now = local_now()
        image_paths = self.storage.save_all(uploads)
        try:
            self.reports.create_visitor_report(
                name=report.name,
                phone=report.phone,
                designation=report.designation,
                company=report.company,
                other_company=report.other_company,
                location=report.location,
                other_location=report.specific_location,
                classification=report.classification.value,
                stop_work=report.stop_work.value,
                observation=report.observation,
                action=report.corrective_action,
                image_paths=image_paths,
                date_time=to_db_timestamp(now),
                month=now.strftime("%B"),
            )
            self.conn.commit()
        except Exception:
            self.storage.delete_all(image_paths)
            raise
        return len(image_paths)
