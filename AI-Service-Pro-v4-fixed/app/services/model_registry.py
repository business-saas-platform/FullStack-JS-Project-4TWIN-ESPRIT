from pathlib import Path

import joblib

from app.core.config import get_settings


class ModelRegistry:
    def __init__(self):
        self.settings = get_settings()
        self.base = self.settings.model_dir

    def path_for(self, name: str) -> Path:
        return self.base / f'{name}.joblib'

    def save(self, name: str, payload) -> Path:
        path = self.path_for(name)
        joblib.dump(payload, path)
        return path

    def load(self, name: str):
        path = self.path_for(name)
        if not path.exists():
            return None
        return joblib.load(path)
