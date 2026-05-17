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


def extract_lab_values_from_text(text: str) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    seen: set[tuple[str, float, str | None]] = set()

    for raw_line in text.splitlines():
        line = re.sub(r"\s+", " ", raw_line).strip()
        if not line or len(line) < 6:
            continue

        match = LAB_LINE_PATTERN.search(line)
        if not match:
            continue

        value_text = match.group("value").replace("<", "").replace(">", "")
        name = match.group("name").strip(" :-")
        unit = match.group("unit")
        value = float(value_text)
        key = (normalize_test_name(name), value, unit)
        if key in seen:
            continue
        seen.add(key)

        candidates.append(
            {
                "testName": name,
                "normalizedName": normalize_test_name(name),
                "value": value,
                "unit": unit,
                "referenceRange": {
                    "low": float(match.group("low")),
                    "high": float(match.group("high")),
                },
                "flag": match.group("flag"),
                "source": "pdf",
                "rawLine": line,
            }
        )

    return candidates
