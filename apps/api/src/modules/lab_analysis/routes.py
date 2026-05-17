from flask import Blueprint, current_app, jsonify, request
from pydantic import ValidationError

from src.config import Settings
from src.modules.lab_analysis.schemas import AnalyzeRequest
from src.modules.lab_analysis.service import analyze_labs
from src.modules.pdf_parser.service import parse_lab_image, parse_lab_pdf

lab_bp = Blueprint("labs", __name__)


@lab_bp.post("/analyze")
def analyze():
    payload = request.get_json(silent=True) or {}
    parsed = AnalyzeRequest.model_validate(payload)
    settings = Settings()
    response = analyze_labs(parsed, settings)
    return jsonify(response.model_dump(mode="json"))


@lab_bp.post("/upload")
def upload_pdf():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "Missing file field named 'file'."}), 400

    filename = file.filename.lower()
    is_pdf = filename.endswith(".pdf")
    is_image = filename.endswith(".png") or filename.endswith(".jpg") or filename.endswith(".jpeg")

    if not is_pdf and not is_image:
        return jsonify({"error": "Only PDF, PNG, and JPG files are supported."}), 400

    try:
        file_bytes = file.read()
        parsed = parse_lab_pdf(file_bytes) if is_pdf else parse_lab_image(file_bytes)
        return jsonify(parsed)
    except Exception as error:
        current_app.logger.exception("Failed to parse uploaded lab file")
        return jsonify({"error": "Could not parse this file. Try a clearer PDF or image.", "message": str(error)}), 422
