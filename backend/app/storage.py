import json
import os
from typing import Dict, List, Optional
from app.models import ProjectModel

STORAGE_FILE = os.path.join(os.path.dirname(__file__), "data", "projects_db.json")

class ProjectStore:
    def __init__(self):
        os.makedirs(os.path.dirname(STORAGE_FILE), exist_ok=True)
        if not os.path.exists(STORAGE_FILE):
            with open(STORAGE_FILE, "w", encoding="utf-8") as f:
                json.dump({}, f)

    def _read_all(self) -> Dict[str, dict]:
        try:
            with open(STORAGE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _write_all(self, data: Dict[str, dict]):
        with open(STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def get_all(self) -> List[dict]:
        data = self._read_all()
        return list(data.values())

    def get(self, project_id: str) -> Optional[dict]:
        data = self._read_all()
        return data.get(project_id)

    def save(self, project: ProjectModel):
        data = self._read_all()
        data[project.id] = project.model_dump()
        self._write_all(data)

    def delete(self, project_id: str) -> bool:
        data = self._read_all()
        if project_id in data:
            del data[project_id]
            self._write_all(data)
            return True
        return False

project_store = ProjectStore()
