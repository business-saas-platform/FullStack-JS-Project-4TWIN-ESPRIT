from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    APP_NAME: str = 'Business AI Service'
    APP_ENV: str = 'development'
    APP_HOST: str = '0.0.0.0'
    APP_PORT: int = 8010
    APP_CORS_ORIGINS: str = 'http://localhost:5173,http://localhost:3000'
    APP_SECRET: str = 'change-me'

    DATABASE_URL: str = 'postgresql+pg8000://postgres:postgres@localhost:5432/saas_db'
    MODEL_DIR: str = './models_store'
    OUTPUT_DIR: str = './output'
    RETAIL_DATASET_PATH: str = './data/online_retail_II.xlsx'
    TIMEZONE: str = 'Africa/Tunis'

    ENABLE_EMAIL_NOTIFICATIONS: bool = False
    SMTP_HOST: str = 'smtp.gmail.com'
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ''
    SMTP_PASSWORD: str = ''
    SMTP_FROM: str = 'ai@bizmanager.local'
    SMTP_TLS: bool = True

    DEFAULT_FORECAST_DAYS: int = 30
    SEGMENTS_K: int = 4
    ANOMALY_CONTAMINATION: float = 0.08

    @property
    def cors_origins(self) -> List[str]:
        return [x.strip() for x in self.APP_CORS_ORIGINS.split(',') if x.strip()]

    @property
    def model_dir(self) -> Path:
        p = Path(self.MODEL_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def output_dir(self) -> Path:
        p = Path(self.OUTPUT_DIR)
        p.mkdir(parents=True, exist_ok=True)
        (p / 'images').mkdir(parents=True, exist_ok=True)
        (p / 'reports').mkdir(parents=True, exist_ok=True)
        return p


@lru_cache
def get_settings() -> Settings:
    return Settings()
