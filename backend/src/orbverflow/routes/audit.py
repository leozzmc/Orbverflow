from __future__ import annotations

from fastapi import APIRouter, Query
from typing import Any, Dict

from orbverflow.app_state import audit_store

router = APIRouter(tags=["audit"])


@router.get("/audit/latest")
async def get_audit_latest(limit: int = Query(default=50, ge=1, le=200)) -> Dict[str, Any]:
    events = await audit_store.latest(limit=limit)
    return {"ok": True, "events": events}
