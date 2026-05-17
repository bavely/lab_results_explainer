from src.app import create_app
from src.config import Settings

settings = Settings()
app = create_app(settings)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=settings.port, debug=settings.flask_env == "development")
