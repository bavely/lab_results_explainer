from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    port: int = Field(default=4000, alias="PORT")
    flask_env: str = Field(default="development", alias="FLASK_ENV")
    cors_origins: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")

    # Supported values: "mock" or "azure_foundry_agent".
    # Keep "mock" as the default so local development works before Azure auth is configured.
    ai_provider: str = Field(default="mock", alias="AI_PROVIDER")

    # Azure AI Foundry Agent settings.
    # Endpoint format usually looks like:
    # https://<resource-name>.services.ai.azure.com/api/projects/<project-name>
    azure_foundry_endpoint: str | None = Field(default=None, alias="AZURE_FOUNDRY_ENDPOINT")
    azure_foundry_agent_name: str | None = Field(default=None, alias="AZURE_FOUNDRY_AGENT_NAME")
    azure_foundry_agent_version: str = Field(default="2", alias="AZURE_FOUNDRY_AGENT_VERSION")

    max_upload_mb: int = Field(default=10, alias="MAX_UPLOAD_MB")
    delete_uploads_after_parse: bool = Field(default=True, alias="DELETE_UPLOADS_AFTER_PARSE")


@lru_cache
def get_settings() -> Settings:
    return Settings()
