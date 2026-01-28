# src/orbverflow/audit_store.py
from __future__ import annotations

import time
import hashlib
from dataclasses import dataclass, asdict
from typing import Deque, Dict, Any, List
from collections import deque
import asyncio


@dataclass
class AuditEvent:
    ts: float
    event: str
    dataset: str
    engine: str
    payload: Dict[str, Any]
    prev_hash: str
    hash: str


class AuditStore:
    """
    In-memory audit log with simple hash chaining (demo-friendly).
    """
    def __init__(self, maxlen: int = 200) -> None:
        self._events: Deque[AuditEvent] = deque(maxlen=maxlen)
        self._lock = asyncio.Lock()

    def _calc_hash(self, prev_hash: str, ts: float, event: str, dataset: str, engine: str, payload: Dict[str, Any]) -> str:
        m = hashlib.sha256()
        m.update(prev_hash.encode("utf-8"))
        m.update(str(ts).encode("utf-8"))
        m.update(event.encode("utf-8"))
        m.update(dataset.encode("utf-8"))
        m.update(engine.encode("utf-8"))
        m.update(repr(payload).encode("utf-8"))
        return m.hexdigest()

    async def append(self, event: str, dataset: str, engine: str, payload: Dict[str, Any]) -> AuditEvent:
        async with self._lock:
            prev = self._events[-1].hash if self._events else "GENESIS"
            ts = time.time()
            h = self._calc_hash(prev, ts, event, dataset, engine, payload)
            ae = AuditEvent(
                ts=ts,
                event=event,
                dataset=dataset,
                engine=engine,
                payload=payload,
                prev_hash=prev,
                hash=h,
            )
            self._events.append(ae)
            return ae

    async def latest(self, limit: int = 50) -> List[Dict[str, Any]]:
        async with self._lock:
            items = list(self._events)[-limit:]
            return [asdict(x) for x in items]
