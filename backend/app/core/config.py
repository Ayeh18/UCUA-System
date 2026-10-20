"""Application settings, loaded from environment variables (and an optional `.env` file)."""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_INSECURE_DEFAULT_SECRET = "change-me-in-production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Application ---
    app_name: str = "e-UCUA API"
    environment: Literal["development", "test", "production"] = "development"
    api_prefix: str = "/api/v1"
    log_level: str = "INFO"
    # Dev server address used by `python -m app` (Docker runs uvicorn directly on 8000).
    # 8001 rather than 8000 so it doesn't collide with other local FastAPI projects.
    host: str = "127.0.0.1"
    port: int = 8001
    # Comma-separated list, e.g. "http://localhost:5173,https://ucua.example.com"
    cors_origins: str = "http://localhost:5173"

    # --- Database ---
    database_url: str = "postgresql://postgres:password@localhost:5432/postgres"
    db_pool_min_size: int = Field(default=1, ge=0)
    db_pool_max_size: int = Field(default=10, ge=1)

    # --- Auth ---
    jwt_secret_key: str = _INSECURE_DEFAULT_SECRET
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=30, ge=1)

    # --- Business rules ---
    timezone: str = "Asia/Kuala_Lumpur"
    leaderboard_size: int = Field(default=5, ge=1)

    # --- File storage (paths are relative to the backend working directory) ---
    upload_dir: Path = Path("uploads")
    report_image_dir: Path = Path("uploaded_images")
    max_upload_size_mb: int = Field(default=10, ge=1)
    max_images_per_report: int = Field(default=5, ge=1)

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @model_validator(mode="after")
    def _require_real_secret_in_production(self) -> "Settings":
        if self.environment == "production" and self.jwt_secret_key == _INSECURE_DEFAULT_SECRET:
            raise ValueError("JWT_SECRET_KEY must be set to a strong random value in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
