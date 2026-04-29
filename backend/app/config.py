import os
from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache


ENV = os.getenv("APP_ENV", "development")

ENV_FILES = {
    "development": ".env.development",
    "production": ".env.production",
}


class Settings(BaseSettings):
    database_url: str = "sqlite:///./app.db"
    secret_key: str = "dev-secret-key"
    access_token_expire_minutes: int = 60
    admin_username: str = "admin"
    admin_password: str = "admin123"
    app_name: str = "码境 CodeRealm"
    app_description: str = "A personal blog built with FastAPI and React"
    app_version: str = "1.0.0"
    max_upload_size: int = 5242880
    upload_dir: str = "uploads"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ENV_FILES.get(ENV, ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
