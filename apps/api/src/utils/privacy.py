import re

_DATE_PATTERNS = [
    r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
    r"\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b",
    r"\b\d{1,2}-(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-\d{2,4}\b",
]

_FIELD_PATTERNS = [
    r"(?i)\b(patient\s*name|name|patient|pt|dob|date\s*of\s*birth|phone|email|address|mrn|medical\s*record\s*number|insurance\s*id|member\s*id|ssn)\s*[:#-]?\s*[^\n]{2,80}",
    r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
    r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b",
    r"\b\d{3}-\d{2}-\d{4}\b",
]


def clean_phi_text(text: str) -> str:
    cleaned = text
    for pattern in _FIELD_PATTERNS:
        cleaned = re.sub(pattern, "[REDACTED]", cleaned, flags=re.IGNORECASE)
    for pattern in _DATE_PATTERNS:
        cleaned = re.sub(pattern, "[DATE REDACTED]", cleaned, flags=re.IGNORECASE)
    return cleaned
