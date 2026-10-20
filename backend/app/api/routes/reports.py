from typing import Annotated

from fastapi import APIRouter, File, Form, UploadFile, status

from app.api.deps import CurrentStaffId, DbConnection
from app.schemas.report import (
    Classification,
    ReportCreatedResponse,
    StaffReport,
    StopWork,
    VisitorReport,
)
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])

Images = Annotated[list[UploadFile], File(description="Optional photos or PDF evidence")]


@router.post("/staff", response_model=ReportCreatedResponse, status_code=status.HTTP_201_CREATED)
def submit_staff_report(
    staff_id: CurrentStaffId,
    conn: DbConnection,
    location: Annotated[str, Form()],
    classification: Annotated[Classification, Form()],
    stop_work: Annotated[StopWork, Form()],
    observation: Annotated[str, Form()],
    corrective_action: Annotated[str, Form()],
    specific_location: Annotated[str, Form()] = "",
    images: Images = [],  # noqa: B006 - FastAPI copies defaults per request
) -> ReportCreatedResponse:
    report = StaffReport(
        location=location,
        specific_location=specific_location,
        classification=classification,
        stop_work=stop_work,
        observation=observation,
        corrective_action=corrective_action,
    )
    count = ReportService(conn).submit_staff_report(staff_id, report, images)
    return ReportCreatedResponse(message="Observation submitted successfully", image_count=count)


@router.post("/visitor", response_model=ReportCreatedResponse, status_code=status.HTTP_201_CREATED)
def submit_visitor_report(
    conn: DbConnection,
    name: Annotated[str, Form()],
    phone: Annotated[str, Form()],
    designation: Annotated[str, Form()],
    company: Annotated[str, Form()],
    location: Annotated[str, Form()],
    classification: Annotated[Classification, Form()],
    stop_work: Annotated[StopWork, Form()],
    observation: Annotated[str, Form()],
    corrective_action: Annotated[str, Form()],
    other_company: Annotated[str, Form()] = "",
    specific_location: Annotated[str, Form()] = "",
    images: Images = [],  # noqa: B006
) -> ReportCreatedResponse:
    report = VisitorReport(
        name=name,
        phone=phone,
        designation=designation,
        company=company,
        other_company=other_company,
        location=location,
        specific_location=specific_location,
        classification=classification,
        stop_work=stop_work,
        observation=observation,
        corrective_action=corrective_action,
    )
    count = ReportService(conn).submit_visitor_report(report, images)
    return ReportCreatedResponse(message="Visitor report submitted successfully.", image_count=count)
