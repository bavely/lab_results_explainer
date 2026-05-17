import re
from typing import Any

from src.modules.lab_analysis.normalizer import normalize_test_name

# Conservative starter regex for common text-PDF lines:
# Hemoglobin 11.2 g/dL 12.0 - 16.0 L
# A1C 6.1 % 4.0-5.6 H
LAB_LINE_PATTERN = re.compile(
    r"(?P<name>[A-Za-z][A-Za-z0-9()/%\-\s]{1,45}?)\s+"
    r"(?P<value>[<>]?\d+(?:\.\d+)?)\s*"
    r"(?P<unit>%|mg/dL|g/dL|mmol/L|mIU/L|uIU/mL|ng/mL|pg/mL|fL|x10\^?3/uL|x10\^?6/uL|U/L)?\s+"
    r"(?P<low>\d+(?:\.\d+)?)\s*[-–—]\s*(?P<high>\d+(?:\.\d+)?)"
    r"(?:\s*(?P<flag>H|L|High|Low|Out of Range))?",
    re.IGNORECASE,
)

# Alternative layout found in some CBC reports where measured value appears near the end:
# Hemoglobin g/dL 13.0 - 16.5 Colorimetric 14.5
LAB_LINE_VALUE_AT_END_PATTERN = re.compile(
    r"(?P<name>[A-Za-z][A-Za-z0-9()/%\-\s]{1,45}?)\s+"
    r"(?P<unit>%|mg/dL|g/dL|mmol/L|mIU/L|uIU/mL|ng/mL|pg/mL|fL|million/cmm|/cmm|mm/1hr)?\s*"
    r"(?P<low>\d+(?:\.\d+)?)\s*[-–—]\s*(?P<high>\d+(?:\.\d+)?)"
    r"(?:\s+[A-Za-z][A-Za-z\s/.-]{1,40})?\s+"
    r"(?P<value>[<>]?\d+(?:\.\d+)?)\s*"
    r"(?P<flag>H|L)?$",
    re.IGNORECASE,
)

# OCR/image-friendly fallback layout where reference ranges are often absent:
# Hemoglobin 13.5 g/dL
# WBC 12.4 x10^3/uL H
LAB_SIMPLE_VALUE_PATTERN = re.compile(
    r"(?P<name>[A-Za-z][A-Za-z0-9()/%\-\s]{1,45}?)\s+"
    r"(?P<value>[<>]?\d+(?:\.\d+)?)\s*"
    r"(?P<unit>%|mg/dL|g/dL|mmol/L|mIU/L|uIU/mL|ng/mL|pg/mL|fL|x10\^?3/uL|x10\^?6/uL|U/L|K/uL|M/uL)?"
    r"(?:\s*(?P<flag>H|L|High|Low|Out of Range))?$",
    re.IGNORECASE,
)


def _candidate_from_match(match: re.Match[str], line: str) -> dict[str, Any]:
    value_text = match.group("value").replace("<", "").replace(">", "")
    name = match.group("name").strip(" :-")
    unit = match.groupdict().get("unit")
    return {
        "testName": name,
        "normalizedName": normalize_test_name(name),
        "value": float(value_text),
        "unit": unit,
        "referenceRange": {
            "low": float(match.group("low")),
            "high": float(match.group("high")),
        },
        "flag": match.groupdict().get("flag"),
        "source": "pdf",
        "rawLine": line,
    }


def _simple_candidate_from_match(match: re.Match[str], line: str) -> dict[str, Any]:
    value_text = match.group("value").replace("<", "").replace(">", "")
    name = match.group("name").strip(" :-")
    return {
        "testName": name,
        "normalizedName": normalize_test_name(name),
        "value": float(value_text),
        "unit": match.groupdict().get("unit"),
        "referenceRange": None,
        "flag": match.groupdict().get("flag"),
        "source": "pdf",
        "rawLine": line,
    }


def extract_lab_values_from_text(text: str) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    seen: set[tuple[str, float, str | None]] = set()

    for raw_line in text.splitlines():
        line = re.sub(r"\s+", " ", raw_line).strip()
        if not line or len(line) < 6:
            continue

        match = LAB_LINE_PATTERN.search(line) or LAB_LINE_VALUE_AT_END_PATTERN.search(line)
        candidate = _candidate_from_match(match, line) if match else None
        if candidate is None:
            simple_match = LAB_SIMPLE_VALUE_PATTERN.search(line)
            if not simple_match:
                continue
            candidate = _simple_candidate_from_match(simple_match, line)

        key = (candidate["normalizedName"], candidate["value"], candidate["unit"])
        if key in seen:
            continue
        seen.add(key)

        candidates.append(candidate)

    return candidates
