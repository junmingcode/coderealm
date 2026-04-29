from pydantic_settings import BaseSettings
from functools import lru_cache


from typing import List


class Settings(BaseSettings):
    database_url: str = "mysql+pymysql://blog_user:blog_password@localhost:3306/blog_db"
    secret_key: str = "your-super-secret-key-change-this-in-production"
    access_token_expire_minutes: int = 60
    admin_username: str = "admin"
    admin_password: str = "admin123"
    app_name: str = "CJM Blog"
    app_description: str = "A personal blog built with FastAPI and React"
    app_version: str = "1.0.0"
    max_upload_size: int = 5242880
    upload_dir: str = "uploads"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
