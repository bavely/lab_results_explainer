from src.modules.lab_analysis.normalizer import normalize_test_name
from src.modules.lab_analysis.schemas import (
    ClassifiedLabResult,
    CombinationFlag,
    LabInput,
    LabSeverity,
    LabStatus,
)


def classify_lab_value(value: float, low: float | None = None, high: float | None = None) -> LabStatus:
    if low is None and high is None:
        return "unknown"
    if low is not None and value < low:
        return "low"
    if high is not None and value > high:
        return "high"
    return "normal"


def estimate_severity(value: float, low: float | None, high: float | None, status: LabStatus) -> LabSeverity:
    if status == "normal":
        return "none"
    if status == "unknown":
        return "unknown"

    # Starter heuristic only. Real severity should use clinician-reviewed reference data.
    if status == "low" and low and low != 0:
        delta = (low - value) / abs(low)
    elif status == "high" and high and high != 0:
        delta = (value - high) / abs(high)
    else:
        return "mild"

    if delta >= 0.50:
        return "critical"
    if delta >= 0.20:
        return "moderate"
    return "mild"


def classify_results(results: list[LabInput]) -> list[ClassifiedLabResult]:
    classified: list[ClassifiedLabResult] = []

    for item in results:
        low = item.referenceRange.low if item.referenceRange else None
        high = item.referenceRange.high if item.referenceRange else None
        status = classify_lab_value(item.value, low, high)
        severity = estimate_severity(item.value, low, high, status)
        classified.append(
            ClassifiedLabResult(
                testName=item.testName,
                normalizedName=normalize_test_name(item.testName),
                value=item.value,
                unit=item.unit,
                referenceRange=item.referenceRange,
                status=status,
                severity=severity,
                source=item.source or "manual",
            )
        )

    return classified


def _find(results: list[ClassifiedLabResult], normalized_name: str) -> ClassifiedLabResult | None:
    return next((result for result in results if result.normalizedName == normalized_name), None)


def _is_high(result: ClassifiedLabResult | None) -> bool:
    return result is not None and result.status == "high"


def _is_low(result: ClassifiedLabResult | None) -> bool:
    return result is not None and result.status == "low"


def detect_combination_flags(results: list[ClassifiedLabResult]) -> list[CombinationFlag]:
    flags: list[CombinationFlag] = []

    a1c = _find(results, "a1c")
    glucose = _find(results, "glucose")
    ldl = _find(results, "ldl")
    total_cholesterol = _find(results, "total_cholesterol")
    hemoglobin = _find(results, "hemoglobin")
    mcv = _find(results, "mcv")
    tsh = _find(results, "tsh")
    free_t4 = _find(results, "free_t4")
    creatinine = _find(results, "creatinine")
    egfr = _find(results, "egfr")

    if _is_high(a1c) and _is_high(glucose):
        flags.append(
            CombinationFlag(
                code="glucose_a1c_followup",
                title="Blood sugar follow-up may be useful",
                explanation="Both A1C and glucose appear above the provided reference ranges. This pattern can be worth discussing with a clinician, especially if fasting status is known.",
            )
        )

    if _is_high(ldl) and _is_high(total_cholesterol):
        flags.append(
            CombinationFlag(
                code="cholesterol_followup",
                title="Cholesterol follow-up may be useful",
                explanation="LDL and total cholesterol appear elevated. A clinician can interpret this with age, blood pressure, family history, and other risk factors.",
            )
        )

    if _is_low(hemoglobin) and _is_low(mcv):
        flags.append(
            CombinationFlag(
                code="low_hgb_low_mcv_followup",
                title="Possible anemia pattern to discuss",
                explanation="Low hemoglobin with low MCV can be seen in several situations. This does not identify the cause, but it may be worth asking whether iron studies are appropriate.",
            )
        )

    if _is_high(tsh) and _is_low(free_t4):
        flags.append(
            CombinationFlag(
                code="thyroid_followup",
                title="Thyroid follow-up may be useful",
                explanation="TSH and free T4 together provide thyroid function context. This pattern should be reviewed by a healthcare professional.",
            )
        )

    if _is_high(creatinine) and _is_low(egfr):
        flags.append(
            CombinationFlag(
                code="kidney_function_followup",
                title="Kidney function follow-up may be useful",
                explanation="Creatinine and eGFR are commonly reviewed together for kidney function context. This pattern should be discussed with a clinician.",
            )
        )

    return flags
