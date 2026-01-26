from __future__ import annotations

import time
import asyncio
from collections import deque
from typing import Deque, Dict, List, Optional

from orbverflow.models import TelemetryRecord


class TelemetryStateStore:
    """
    In-memory time-window store:
    state_store = { "SatA": deque([TelemetryRecord...]), ... }
    Keep last window_seconds per sat.
    """

    def __init__(self, window_seconds: int = 600) -> None:
        self.window_seconds = window_seconds
        self._store: Dict[str, Deque[TelemetryRecord]] = {}
        self._lock = asyncio.Lock()

    async def add_records(self, records: List[TelemetryRecord]) -> None:
        now = time.time()
        cutoff = now - self.window_seconds
        async with self._lock:
            for r in records:
                dq = self._store.setdefault(r.sat_id, deque())
                dq.append(r)
                # prune
                while dq and dq[0].timestamp < cutoff:
                    dq.popleft()
    

    async def latest_all(self) -> Dict[str, TelemetryRecord]:
        async with self._lock:
            out: Dict[str, TelemetryRecord] = {}
            for sat_id, dq in self._store.items():
                if dq:
                    out[sat_id] = dq[-1]
            return out

    async def recent_sat(self, sat_id: str, minutes: int = 5) -> List[TelemetryRecord]:
        now = time.time()
        cutoff = now - minutes * 60
        async with self._lock:
            dq = self._store.get(sat_id)
            if not dq:
                return []
            return [r for r in dq if r.timestamp >= cutoff]
