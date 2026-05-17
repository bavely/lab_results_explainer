from io import BytesIO
from typing import Optional

from pypdf import PdfReader

from src.modules.pdf_parser.extract_lab_values import extract_lab_values_from_text
from src.utils.privacy import clean_phi_text

try:
    import pytesseract
    from PIL import Image
except ImportError:  # pragma: no cover - optional dependency path
    pytesseract = None
    Image = None


def _extract_text_with_ocr(page) -> str:
    if pytesseract is None or Image is None:
        return ""

    ocr_chunks: list[str] = []
    for page_image in getattr(page, "images", []):
        image_data: Optional[bytes] = getattr(page_image, "data", None)
        if not image_data:
            continue

        try:
            pil_image = Image.open(BytesIO(image_data))
            ocr_text = pytesseract.image_to_string(pil_image)
        except Exception:
            continue

        if ocr_text:
            ocr_chunks.append(ocr_text)

    return "\n".join(ocr_chunks)


def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    pages: list[str] = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        if not page_text.strip():
            page_text = _extract_text_with_ocr(page)
        pages.append(page_text)
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


def extract_text_from_image_bytes(file_bytes: bytes) -> str:
    if pytesseract is None or Image is None:
        return ""

    try:
        image = Image.open(BytesIO(file_bytes))
        return pytesseract.image_to_string(image)
    except Exception:
        return ""


def parse_lab_image(file_bytes: bytes) -> dict:
    raw_text = extract_text_from_image_bytes(file_bytes)
    cleaned_text = clean_phi_text(raw_text)
    extracted = extract_lab_values_from_text(cleaned_text)
    preview = "\n".join(cleaned_text.splitlines()[:40])

    return {
        "extractedResults": extracted,
        "needsReview": True,
        "message": "We extracted possible lab values from your report. Please review before generating explanations.",
        "textPreview": preview,
    }
