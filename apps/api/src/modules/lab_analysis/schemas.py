from typing import Literal
from pydantic import BaseModel, Field, field_validator

LabStatus = Literal["normal", "low", "high", "borderline", "unknown"]
LabSeverity = Literal["none", "mild", "moderate", "critical", "unknown"]


class ReferenceRange(BaseModel):
    low: float | None = None
    high: float | None = None
    text: str | None = None


class PatientContext(BaseModel):
    age: int | None = Field(default=None, ge=0, le=130)
    sex: Literal["male", "female", "other", "unknown"] | None = "unknown"
    pregnant: bool | None = None


class LabInput(BaseModel):
    testName: str = Field(min_length=1, max_length=120)
    value: float
    unit: str | None = Field(default=None, max_length=40)
    referenceRange: ReferenceRange | None = None
    notes: str | None = Field(default=None, max_length=500)
    source: Literal["manual", "pdf"] | None = "manual"

    @field_validator("testName")
    @classmethod
    def strip_test_name(cls, value: str) -> str:
        return value.strip()


class AnalyzeRequest(BaseModel):
    patientContext: PatientContext | None = None
    results: list[LabInput] = Field(min_length=1, max_length=50)


class ClassifiedLabResult(BaseModel):
    testName: str
    normalizedName: str
    value: float
    unit: str | None = None
    referenceRange: ReferenceRange | None = None
    status: LabStatus
    severity: LabSeverity
    source: Literal["manual", "pdf"] | None = "manual"


class CombinationFlag(BaseModel):
    code: str
    title: str
    explanation: str
    severity: Literal["info", "follow_up", "urgent"] = "follow_up"


class LabExplanation(BaseModel):
    testName: str
    normalizedName: str
    value: float
    unit: str | None = None
    referenceRange: ReferenceRange | None = None
    status: LabStatus
    severity: LabSeverity
    plainLanguageExplanation: str
    possibleGeneralCauses: list[str]
    followUpQuestions: list[str]
    shouldDiscussWithClinician: bool
    disclaimer: str = "This explanation is educational and is not a medical diagnosis."


class AnalysisSummary(BaseModel):
    totalResults: int
    normalCount: int
    abnormalCount: int
    followUpRecommended: bool
    overallPlainLanguageSummary: str
    importantNotes: list[str]


class AnalyzeResponse(BaseModel):
    summary: AnalysisSummary
    results: list[LabExplanation]
    combinationFlags: list[CombinationFlag]
