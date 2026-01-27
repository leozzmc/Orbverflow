from __future__ import annotations

from fastapi import APIRouter

from orbverflow.app_state import store, jamming_engine, incident_store, playbook_engine

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.get("/latest")
async def latest_incident():
    latest = await store.latest_all()
    incident, reason = jamming_engine.detect_and_triangulate(latest)
    playbooks = []
    if incident:
        playbooks = playbook_engine.propose_for_incident(incident)

    if incident is None:
        existing = incident_store.latest()
        if existing is None:
            return {"ok": True, "has_incident": False, "incident": None, "playbooks": None, "reason": reason}
        return {"ok": True, "has_incident": True, "incident": existing.model_dump(), "playbooks": [p.dict() for p in playbooks], "reason": reason}

    return {"ok": True, "has_incident": True, "incident": incident.model_dump(),"playbooks": [p.dict() for p in playbooks], "reason": reason}
