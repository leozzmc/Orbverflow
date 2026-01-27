from __future__ import annotations

import asyncio
from typing import Any, Dict, Optional


class MissionContinuityStore:
    """
    In-memory store for the latest mission continuity recommendation.
    Shared singleton via app_state.py
    """

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._latest: Optional[Dict[str, Any]] = None

    async def set_latest(self, rec: Dict[str, Any]) -> None:
        async with self._lock:
            self._latest = rec

    async def get_latest(self) -> Optional[Dict[str, Any]]:
        async with self._lock:
            return self._latest
