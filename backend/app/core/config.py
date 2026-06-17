from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "Smart Parking System"
    ENV: str = "development"
    DATABASE_URL: str = "sqlite:///./smart_parking.db"
    SECRET_KEY: str = "CHANGE_ME_SUPER_SECRET_KEY"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173"
    FRONTEND_URL: str = "http://localhost:5173"

    @property
    def cors_origins(self) -> List[str]:
        return [x.strip() for x in self.BACKEND_CORS_ORIGINS.split(',') if x.strip()]

    class Config:
        env_file = ".env"

settings = Settings()
