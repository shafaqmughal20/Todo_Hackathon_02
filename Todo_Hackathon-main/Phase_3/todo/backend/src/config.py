"""
Configuration module for the FastAPI backend.
Loads environment variables and provides type-safe configuration.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database Configuration
    database_url: str

    # Authentication Configuration
    better_auth_secret: str
    better_auth_url: str

    # Application Configuration
    environment: str = "development"
    debug: bool = True

    # CORS Configuration
    frontend_url: str

    # JWT Configuration
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60 * 24 * 7  # 7 days

    # Groq API Configuration
    groq_api_key: str

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
