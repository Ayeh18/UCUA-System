from enum import StrEnum

from pydantic import BaseModel

from app.schemas.common import LongText, NonEmptyStr, OptionalStr


class Classification(StrEnum):
    SAFE_OBSERVATION = "Safe Observation"
    UNSAFE_ACTS = "Unsafe Acts"
    UNSAFE_CONDITIONS = "Unsafe Conditions"


class StopWork(StrEnum):
    YES = "Yes"
    NO = "No"


class ObservationDetails(BaseModel):
    location: NonEmptyStr
    specific_location: OptionalStr = ""
    classification: Classification
    stop_work: StopWork
    observation: LongText
    corrective_action: LongText


class StaffReport(ObservationDetails):
    pass


class VisitorReport(ObservationDetails):
    name: NonEmptyStr
    phone: NonEmptyStr
    designation: NonEmptyStr
    company: NonEmptyStr
    other_company: OptionalStr = ""


class ReportCreatedResponse(BaseModel):
    message: str
    image_count: int
