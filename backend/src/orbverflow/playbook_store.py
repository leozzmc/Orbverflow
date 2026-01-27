from typing import Dict, Optional
from orbverflow.playbook_models import Playbook

class PlaybookStore:
    def __init__(self):
        self._store: Dict[str, Playbook] = {}

    def add(self, playbook: Playbook):
        self._store[playbook.id] = playbook

    def get(self, playbook_id: str) -> Optional[Playbook]:
        return self._store.get(playbook_id)

    def update(self, playbook: Playbook):
        self._store[playbook.id] = playbook

    def latest(self):
        if not self._store:
            return None
        return list(self._store.values())[-1]
