from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
from enum import Enum


class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class JiraTicket(BaseModel):
    ticket_id: str
    summary: str
    description: str = ""
    acceptance_criteria: list[str] = []
    issue_type: str = ""
    priority: str = ""
    component: str = ""
    labels: list[str] = []
    environment: str = ""


class TestCase(BaseModel):
    test_case_id: str
    test_scenario: str
    preconditions: list[str]
    test_steps: list[str]
    test_data: list[str]
    expected_result: str
    priority: Optional[PriorityEnum] = None
    automation_candidate: bool
    tags: list[str]


class GenerateTestCasesResponse(BaseModel):
    ticket_id: str
    summary: str
    generated_test_cases: list[TestCase]

    @model_validator(mode="after")
    def validate_test_case_count(self) -> "GenerateTestCasesResponse":
        count = len(self.generated_test_cases)
        if count < 3 or count > 6:
            raise ValueError(f"Expected between 3 and 6 test cases, got {count}")
        return self


class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None


class HealthStatus(BaseModel):
    status: str
