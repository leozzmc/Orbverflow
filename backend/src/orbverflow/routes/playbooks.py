from __future__ import annotations

import asyncio
from dataclasses import asdict, is_dataclass

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from orbverflow.app_state import audit_store, hub, playbook_engine

router = APIRouter(tags=["playbooks"])


class ApprovalReq(BaseModel):
    operator: str


def _audit_to_dict(evt):
    if is_dataclass(evt):
        return asdict(evt)
    if hasattr(evt, "model_dump"):
        return evt.model_dump()
    if isinstance(evt, dict):
        return evt
    return dict(getattr(evt, "__dict__", {}))


@router.post("/playbooks/{playbook_id}/approve")
async def approve_playbook(playbook_id: str, req: ApprovalReq):
    try:
        pb = playbook_engine.approve(playbook_id)
    except ValueError:
        raise HTTPException(404, "Playbook not found")

    # WS: notify front-end
    await hub.broadcast_json(
        {
            "type": "playbook_approved",
            "playbook_id": pb.id,
            "delivery_status": "approved",
            "operator": req.operator,
        }
    )

    # Audit
    evt = audit_store.append(
        event="PLAYBOOK_APPROVED",
        dataset="SIM_DEMO",
        engine="operator_console",
        payload={"playbook_id": pb.id, "operator": req.operator, "state": pb.state},
    )
    if asyncio.iscoroutine(evt):
        evt = await evt
    await hub.broadcast_json({"type": "audit_log", **_audit_to_dict(evt)})

    return {"ok": True, "playbook_id": pb.id, "state": pb.state, "operator": req.operator}

# @router.get("/latest")
# def playbooks_latest(limit: int = 50):
#     pbs = playbook_store.list_latest(limit=limit)
#     return {
#         "ok": True,
#         "count": len(pbs),
#         "playbooks": [p.model_dump() if hasattr(p, "model_dump") else p.dict() for p in pbs],
#     }

@router.get("/latest")
def get_playbooks_latest(limit: int = Query(50, ge=1, le=200)):
    pbs = playbook_store.list_latest(limit=limit)
    # pydantic v1/v2 compatible dump
    out = []
    for pb in pbs:
        out.append(pb.model_dump() if hasattr(pb, "model_dump") else pb.dict())
    return {"ok": True, "playbooks": out, "limit": limit}