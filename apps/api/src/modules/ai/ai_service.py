import json
import re
from typing import Any

from src.config import Settings
from src.modules.ai.prompts import SYSTEM_PROMPT
from src.modules.lab_analysis.schemas import ClassifiedLabResult, CombinationFlag, LabExplanation, PatientContext

_COMMON_TEST_DESCRIPTIONS = {
    "hemoglobin": "Hemoglobin is a protein in red blood cells that carries oxygen through the body.",
    "mcv": "MCV describes the average size of red blood cells.",
    "a1c": "A1C estimates average blood sugar levels over the past few months.",
    "glucose": "Glucose is a type of sugar in the blood and is an important energy source.",
    "ldl": "LDL cholesterol is often called 'bad cholesterol' because higher levels can contribute to plaque buildup in arteries.",
    "hdl": "HDL cholesterol is often called 'good cholesterol' because it helps move cholesterol away from arteries.",
    "total_cholesterol": "Total cholesterol is an overall measure of cholesterol in the blood.",
    "triglycerides": "Triglycerides are a type of fat in the blood used for energy storage.",
    "tsh": "TSH is a hormone that helps regulate thyroid activity.",
    "free_t4": "Free T4 is a thyroid hormone measurement that helps evaluate thyroid function.",
    "creatinine": "Creatinine is a waste product commonly used to help assess kidney function.",
    "egfr": "eGFR estimates how well the kidneys are filtering blood.",
}


def _range_text(result: ClassifiedLabResult) -> str:
    if not result.referenceRange:
        return "No reference range was provided."
    low = result.referenceRange.low
    high = result.referenceRange.high
    if low is not None and high is not None:
        return f"The provided reference range is {low:g} to {high:g}."
    if low is not None:
        return f"The provided reference range has a lower limit of {low:g}."
    if high is not None:
        return f"The provided reference range has an upper limit of {high:g}."
    return result.referenceRange.text or "No numeric reference range was provided."


def _mock_explanation_for_result(result: ClassifiedLabResult) -> LabExplanation:
    description = _COMMON_TEST_DESCRIPTIONS.get(
        result.normalizedName,
        f"{result.testName} is a lab measurement that should be interpreted with your clinical context.",
    )

    if result.status == "normal":
        status_text = "Your value appears within the provided reference range."
        causes = ["No specific abnormal cause is suggested by the provided range alone."]
        questions = ["Should this be monitored again at my next routine visit?"]
        discuss = False
    elif result.status == "low":
        status_text = "Your value appears below the provided reference range."
        causes = [
            "Low values can sometimes be related to nutrition, bleeding, inflammation, medications, or other medical conditions depending on the test.",
            "The meaning depends on symptoms, medical history, and other lab results.",
        ]
        questions = [
            "Should this result be repeated?",
            "Are related tests needed to understand the pattern?",
            "Could medications, diet, or another condition affect this value?",
        ]
        discuss = True
    elif result.status == "high":
        status_text = "Your value appears above the provided reference range."
        causes = [
            "High values can sometimes be related to diet, hydration status, medications, inflammation, hormone changes, or other medical conditions depending on the test.",
            "The meaning depends on symptoms, medical history, and other lab results.",
        ]
        questions = [
            "Should this result be repeated or confirmed?",
            "Which related results should be reviewed together?",
            "What follow-up is appropriate based on my health history?",
        ]
        discuss = True
    else:
        status_text = "There was not enough reference range information to classify this result reliably."
        causes = ["Reference ranges can vary by lab and patient context."]
        questions = ["What reference range should be used for this result?", "Is this value concerning for my situation?"]
        discuss = True

    explanation = (
        f"{description} Your value is {result.value:g} {result.unit or ''}. "
        f"{_range_text(result)} {status_text} This is educational information only and does not diagnose a condition."
    ).replace("  ", " ").strip()

    return LabExplanation(
        testName=result.testName,
        normalizedName=result.normalizedName,
        value=result.value,
        unit=result.unit,
        referenceRange=result.referenceRange,
        status=result.status,
        severity=result.severity,
        plainLanguageExplanation=explanation,
        possibleGeneralCauses=causes,
        followUpQuestions=questions,
        shouldDiscussWithClinician=discuss,
    )


def generate_mock_explanations(
    patient_context: PatientContext | None,
    classified_results: list[ClassifiedLabResult],
    combination_flags: list[CombinationFlag],
) -> list[LabExplanation]:
    return [_mock_explanation_for_result(result) for result in classified_results]


def _json_schema_instruction() -> str:
    return """
Return valid JSON only, with this exact top-level shape:
{
  "results": [
    {
      "testName": "string",
      "normalizedName": "string",
      "value": 0,
      "unit": "string or null",
      "referenceRange": {"low": 0, "high": 0, "text": "string or null"},
      "status": "normal | low | high | borderline | unknown",
      "severity": "none | mild | moderate | critical | unknown",
      "plainLanguageExplanation": "string",
      "possibleGeneralCauses": ["string"],
      "followUpQuestions": ["string"],
      "shouldDiscussWithClinician": true,
      "disclaimer": "This explanation is educational and is not a medical diagnosis."
    }
  ]
}
Do not include markdown, citations, code fences, or hidden reasoning.
""".strip()


def _build_agent_prompt(
    patient_context: PatientContext | None,
    classified_results: list[ClassifiedLabResult],
    combination_flags: list[CombinationFlag],
) -> str:
    payload: dict[str, Any] = {
        "patientContext": patient_context.model_dump() if patient_context else {},
        "classifiedResults": [item.model_dump() for item in classified_results],
        "combinationFlags": [item.model_dump() for item in combination_flags],
    }

    return (
        "You are being called from a patient-facing lab-result explainer app.\n\n"
        "Use these app-level safety rules:\n"
        f"{SYSTEM_PROMPT}\n\n"
        "Important implementation rule: the backend has already classified each result. "
        "Do not override the provided status or severity. Explain the provided backend classification only.\n\n"
        f"{_json_schema_instruction()}\n\n"
        "Input data:\n"
        f"{json.dumps(payload, ensure_ascii=False)}"
    )


def _extract_json_object(text: str) -> dict[str, Any]:
    """Parse agent JSON even if a provider accidentally wraps it in a code fence."""
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start >= 0 and end > start:
        parsed = json.loads(cleaned[start : end + 1])
        if isinstance(parsed, dict):
            return parsed

    raise ValueError("Azure Foundry Agent did not return a JSON object.")


def _coerce_agent_result(
    raw_item: dict[str, Any],
    classified_result: ClassifiedLabResult,
) -> LabExplanation:
    """Preserve deterministic backend fields even if the agent omits or changes them."""
    safe_item = {
        **raw_item,
        "testName": classified_result.testName,
        "normalizedName": classified_result.normalizedName,
        "value": classified_result.value,
        "unit": classified_result.unit,
        "referenceRange": classified_result.referenceRange.model_dump() if classified_result.referenceRange else None,
        "status": classified_result.status,
        "severity": classified_result.severity,
        "disclaimer": raw_item.get("disclaimer") or "This explanation is educational and is not a medical diagnosis.",
    }

    safe_item.setdefault("plainLanguageExplanation", _mock_explanation_for_result(classified_result).plainLanguageExplanation)
    safe_item.setdefault("possibleGeneralCauses", [])
    safe_item.setdefault("followUpQuestions", [])
    safe_item.setdefault("shouldDiscussWithClinician", classified_result.status != "normal")

    return LabExplanation.model_validate(safe_item)


def _parse_agent_explanations(
    output_text: str,
    classified_results: list[ClassifiedLabResult],
) -> list[LabExplanation]:
    parsed = _extract_json_object(output_text)
    raw_results = parsed.get("results", [])
    if not isinstance(raw_results, list):
        raise ValueError("Azure Foundry Agent JSON must include results as a list.")

    explanations: list[LabExplanation] = []
    for index, classified_result in enumerate(classified_results):
        raw_item = raw_results[index] if index < len(raw_results) and isinstance(raw_results[index], dict) else {}
        explanations.append(_coerce_agent_result(raw_item, classified_result))

    return explanations


def generate_azure_foundry_agent_explanations(
    settings: Settings,
    patient_context: PatientContext | None,
    classified_results: list[ClassifiedLabResult],
    combination_flags: list[CombinationFlag],
) -> list[LabExplanation]:
    """Generate explanations through an Azure AI Foundry Agent reference.

    Authentication uses DefaultAzureCredential, so local development can use Azure CLI login,
    Visual Studio Code credentials, managed identity, or service-principal environment variables.
    """
    if not settings.azure_foundry_endpoint or not settings.azure_foundry_agent_name:
        return generate_mock_explanations(patient_context, classified_results, combination_flags)

    try:
        from azure.ai.projects import AIProjectClient
        from azure.identity import DefaultAzureCredential

        project_client = AIProjectClient(
            endpoint=settings.azure_foundry_endpoint,
            credential=DefaultAzureCredential(),
        )
        openai_client = project_client.get_openai_client()

        response = openai_client.responses.create(
            input=[
                {
                    "role": "user",
                    "content": _build_agent_prompt(patient_context, classified_results, combination_flags),
                }
            ],
            extra_body={
                "agent_reference": {
                    "name": settings.azure_foundry_agent_name,
                    "version": settings.azure_foundry_agent_version,
                    "type": "agent_reference",
                }
            },
        )

        return _parse_agent_explanations(response.output_text, classified_results)
    except Exception:
        # Never block the user from seeing deterministic results because the AI provider
        # is unavailable, misconfigured, or returned invalid JSON. Avoid logging PHI here.
        return generate_mock_explanations(patient_context, classified_results, combination_flags)


def generate_explanations(
    settings: Settings,
    patient_context: PatientContext | None,
    classified_results: list[ClassifiedLabResult],
    combination_flags: list[CombinationFlag],
) -> list[LabExplanation]:
    """Generate patient-friendly explanations.

    Rules and range classification are always performed before this function. The AI provider
    explains the backend classification; it is not the source of truth for low/high/normal.
    """
    provider = settings.ai_provider.lower().strip()
    if provider == "azure_foundry_agent":
        return generate_azure_foundry_agent_explanations(
            settings,
            patient_context,
            classified_results,
            combination_flags,
        )

    return generate_mock_explanations(patient_context, classified_results, combination_flags)
