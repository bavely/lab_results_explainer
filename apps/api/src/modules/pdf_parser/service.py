from io import BytesIO

from pypdf import PdfReader

from src.modules.pdf_parser.extract_lab_values import extract_lab_values_from_text
from src.utils.privacy import clean_phi_text


def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    pages: list[str] = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    return "\n".join(pages)


def parse_lab_pdf(file_bytes: bytes) -> dict:
    raw_text = extract_text_from_pdf_bytes(file_bytes)
    cleaned_text = clean_phi_text(raw_text)
    extracted = extract_lab_values_from_text(cleaned_text)
    preview = "\n".join(cleaned_text.splitlines()[:40])

    return {
        "extractedResults": extracted,
        "needsReview": True,
        "message": "We extracted possible lab values from your report. Please review before generating explanations.",
        "textPreview": preview,
    }
