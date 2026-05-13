import os
import re
import tempfile
from typing import Any

import cv2
import numpy as np
import pytesseract
from dotenv import load_dotenv
from flask import Flask, abort, jsonify, request
from flask_cors import CORS

load_dotenv()

APP_PORT = int(os.getenv("OCR_SERVICE_PORT", "5051"))
MAX_FILE_MB = int(os.getenv("OCR_MAX_FILE_MB", "10"))
UPSCALE_FACTOR = float(os.getenv("OCR_UPSCALE_FACTOR", "1.8"))
TESSERACT_CMD = os.getenv("OCR_TESSERACT_CMD")

if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

app = Flask(__name__)
CORS(app)


def _decode_upload_to_image(upload_bytes: bytes) -> np.ndarray:
    arr = np.frombuffer(upload_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode uploaded file into an image")
    return img


def _deskew(gray: np.ndarray) -> np.ndarray:
    inv = cv2.bitwise_not(gray)
    coords = np.column_stack(np.where(inv > 0))
    if coords.size == 0:
        return gray

    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    if abs(angle) < 0.2:
        return gray

    h, w = gray.shape[:2]
    center = (w // 2, h // 2)
    mat = cv2.getRotationMatrix2D(center, angle, 1.0)
    return cv2.warpAffine(gray, mat, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)


def enhance_for_ocr(img: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    if UPSCALE_FACTOR > 1.0:
        gray = cv2.resize(gray, None, fx=UPSCALE_FACTOR, fy=UPSCALE_FACTOR, interpolation=cv2.INTER_CUBIC)

    # Denoise and improve local contrast
    gray = cv2.bilateralFilter(gray, 7, 40, 40)
    clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    # Remove faint background watermarks common in scanned lab reports
    bg = cv2.medianBlur(gray, 31)
    normalized = cv2.divide(gray, bg, scale=255)

    # Binarize and clean
    binary = cv2.adaptiveThreshold(
        normalized,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        35,
        15,
    )

    open_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    close_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, open_kernel, iterations=1)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, close_kernel, iterations=1)

    return _deskew(cleaned)


def extract_lab_like_lines(text: str) -> list[dict[str, Any]]:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    pattern = re.compile(
        r"^(?P<test>[A-Za-z][A-Za-z0-9/\-\s]{2,40}?)\s+(?P<flag>H|L)?\s*(?P<value>\d+(?:\.\d+)?)\s*(?P<unit>[A-Za-z/%]+)?$"
    )
    out: list[dict[str, Any]] = []

    for ln in lines:
        m = pattern.match(ln)
        if not m:
            continue
        out.append(
            {
                "test": m.group("test").strip(),
                "value": float(m.group("value")),
                "unit": m.group("unit") or None,
                "flag": m.group("flag") or None,
                "raw": ln,
            }
        )
    return out


@app.get("/health")
def health() -> tuple[dict[str, str], int]:
    return {"status": "ok", "service": "ocr-enhancer"}, 200


@app.post("/enhance")
def enhance() -> Any:
    if "file" not in request.files:
        abort(400, description="Missing 'file' upload")

    uploaded = request.files["file"]
    content = uploaded.read()

    if not content:
        abort(400, description="Uploaded file is empty")

    if len(content) > MAX_FILE_MB * 1024 * 1024:
        abort(413, description=f"File exceeds {MAX_FILE_MB} MB limit")

    img = _decode_upload_to_image(content)
    enhanced = enhance_for_ocr(img)

    ok, out = cv2.imencode(".png", enhanced)
    if not ok:
        abort(500, description="Image encoding failed")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
        tmp.write(out.tobytes())
        enhanced_path = tmp.name

    ocr_config = "--oem 3 --psm 6"

    try:
        text = pytesseract.image_to_string(enhanced, config=ocr_config)
    except pytesseract.TesseractNotFoundError:
        return (
            jsonify(
                {
                    "error": "Tesseract OCR executable not found",
                    "hint": "Install Tesseract and add it to PATH, or set OCR_TESSERACT_CMD to the full executable path.",
                    "configuredCommand": TESSERACT_CMD or "tesseract",
                }
            ),
            503,
        )

    return jsonify(
        {
            "text": text,
            "candidateLabs": extract_lab_like_lines(text),
            "debug": {
                "enhancedImagePath": enhanced_path,
                "upscaleFactor": UPSCALE_FACTOR,
                "maxFileMb": MAX_FILE_MB,
            },
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=APP_PORT, debug=True)
