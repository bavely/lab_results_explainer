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

try:
    import cv2
    import numpy as np
except ImportError:  # pragma: no cover - optional dependency path
    cv2 = None
    np = None


def _ocr_is_available() -> bool:
    if pytesseract is None or Image is None:
        return False

    try:
        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False


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
            ocr_text = pytesseract.image_to_string(_enhance_image_for_ocr(pil_image))
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
    if not _ocr_is_available():
        return ""

    try:
        image = Image.open(BytesIO(file_bytes))
        return pytesseract.image_to_string(_enhance_image_for_ocr(image))
    except Exception:
        return ""


def _enhance_image_for_ocr(pil_image):
    if cv2 is None or np is None:
        return pil_image

    image_array = np.array(pil_image.convert("RGB"))
    bgr_image = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
    grayscale = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)

    denoised = cv2.fastNlMeansDenoising(grayscale, None, 20, 7, 21)
    thresholded = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11,
    )

    kernel = np.ones((1, 1), np.uint8)
    cleaned = cv2.morphologyEx(thresholded, cv2.MORPH_OPEN, kernel)
    enhanced = cv2.medianBlur(cleaned, 3)

    rgb_enhanced = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2RGB)
    return Image.fromarray(rgb_enhanced)


def parse_lab_image(file_bytes: bytes) -> dict:
    raw_text = extract_text_from_image_bytes(file_bytes)
    cleaned_text = clean_phi_text(raw_text)
    extracted = extract_lab_values_from_text(cleaned_text)
    preview = "\n".join(cleaned_text.splitlines()[:40])

    message = "We extracted possible lab values from your report. Please review before generating explanations."
    if not raw_text.strip():
        message = (
            "We could not read text from this image. "
            "Try a sharper image (higher contrast, no blur) or upload a PDF export from your lab portal."
        )

    return {
        "extractedResults": extracted,
        "needsReview": True,
        "message": message,
        "textPreview": preview,
    }
