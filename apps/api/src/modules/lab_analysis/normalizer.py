import re

_ALIAS_MAP = {
    "hgb": "hemoglobin",
    "hemoglobin": "hemoglobin",
    "hb": "hemoglobin",
    "mcv": "mcv",
    "a1c": "a1c",
    "hba1c": "a1c",
    "hemoglobin a1c": "a1c",
    "glucose": "glucose",
    "fasting glucose": "glucose",
    "ldl": "ldl",
    "ldl cholesterol": "ldl",
    "hdl": "hdl",
    "hdl cholesterol": "hdl",
    "cholesterol": "total_cholesterol",
    "total cholesterol": "total_cholesterol",
    "triglycerides": "triglycerides",
    "tsh": "tsh",
    "free t4": "free_t4",
    "ft4": "free_t4",
    "creatinine": "creatinine",
    "egfr": "egfr",
    "e gfr": "egfr",
}


def normalize_test_name(test_name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9% ]+", " ", test_name).lower()
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return _ALIAS_MAP.get(cleaned, cleaned.replace(" ", "_"))
