import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from functools import lru_cache
import warnings


ENV = os.getenv("APP_ENV", "development")

ENV_FILES = {
    "development": ".env.development",
    "production": ".env.production",
}

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_ENV_FILE = os.path.join(_BASE_DIR, ENV_FILES.get(ENV, ".env"))


class Settings(BaseSettings):
    database_url: str = "mysql+pymysql://root:123456@127.0.0.1:3306/coderealm?charset=utf8mb4"
    secret_key: str = "dev-secret-key"
    access_token_expire_minutes: int = 60
    admin_username: str = "admin"
    admin_password: str = "admin123"
    app_name: str = "码境 CodeRealm"
    app_description: str = "A personal blog built with FastAPI and React"
    app_version: str = "1.0.0"
    max_upload_size: int = 5242880
    upload_dir: str = "uploads"
    cookie_secure: bool = False
    cors_origins: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://localhost:80"

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @model_validator(mode='after')
    def check_secrets(self):
        if self.secret_key == "dev-secret-key":
            warnings.warn("SECRET_KEY is using default value. Change it in production!", stacklevel=2)
        if self.admin_password == "admin123":
            warnings.warn("ADMIN_PASSWORD is using default value. Change it in production!", stacklevel=2)
        return self


@lru_cache()
def get_settings() -> Settings:
    return Settings()
