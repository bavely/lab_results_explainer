from flask import Flask, jsonify
from flask_cors import CORS
from pydantic import ValidationError

from src.config import Settings
from src.modules.lab_analysis.routes import lab_bp


def create_app(settings: Settings | None = None) -> Flask:
    settings = settings or Settings()

    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = settings.max_upload_mb * 1024 * 1024

    CORS(
        app,
        resources={r"/api/*": {"origins": [origin.strip() for origin in settings.cors_origins.split(",")]}},
    )

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "lab-results-explainer-api"})

    @app.errorhandler(ValidationError)
    def handle_validation_error(error: ValidationError):
        return jsonify({"error": "Validation error", "details": error.errors()}), 422

    @app.errorhandler(413)
    def handle_payload_too_large(_error):
        return jsonify({"error": "File is too large for the configured upload limit."}), 413

    @app.errorhandler(Exception)
    def handle_exception(error: Exception):
        app.logger.exception("Unhandled API error")
        return jsonify({"error": "Unexpected server error", "message": str(error)}), 500

    app.register_blueprint(lab_bp, url_prefix="/api/labs")

    return app
