from __future__ import annotations

import asyncio
import time
from dataclasses import asdict, is_dataclass
from typing import Any, Dict, Optional, Tuple

from fastapi import APIRouter

from orbverflow.app_state import (
    audit_store,
    hub,
    incident_store,
    jamming_engine,
    playbook_engine,
    store,
    engine
)

router = APIRouter(prefix="/incidents", tags=["incidents"])
_JAMMING_EMITTED_THIS_RUN = False
_last_jamming_incident_id: Optional[str] = None

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
        return {
            "ok": True,
            "has_incident": True,
            "incident": existing.model_dump(),
            "playbooks": [p.dict() for p in playbooks],
            "reason": reason,
        }

    return {
        "ok": True,
        "has_incident": True,
        "incident": incident.model_dump(),
        "playbooks": [p.dict() for p in playbooks],
        "reason": reason,
    }


def _audit_to_dict(evt: Any) -> Dict[str, Any]:
    """Normalize AuditStore.append() return into a plain dict."""
    if is_dataclass(evt):
        return asdict(evt)
    if hasattr(evt, "model_dump"):
        return evt.model_dump()  # type: ignore[attr-defined]
    if isinstance(evt, dict):
        return evt
    return dict(getattr(evt, "__dict__", {}))


async def maybe_emit_jamming_events(latest_snapshot, now_ts: Optional[float] = None) -> None:
    """
    WS-first:
    - detect jamming every tick
    - BUT only create/broadcast incident + playbooks when incident is CREATED
      (avoid duplicate PB spam during the same scenario window)
    """
    incident, reason = jamming_engine.detect_and_triangulate(latest_snapshot, now_ts=now_ts)

    if not incident:
        return

    # detect store action string from IncidentStore
    # typically: "jamming incident created" / "jamming incident updated"
    action = str(reason).lower()

    # ✅ IMPORTANT: only emit playbooks on CREATE
    is_created = "created" in action

    global _last_jamming_incident_id
    inc_id = getattr(incident, "incident_id", None)

    # extra guard: if created but same id as last (rare), don't spam
    if is_created and inc_id is not None and inc_id == _last_jamming_incident_id:
        is_created = False

    # Always broadcast incident (optional)
    await hub.broadcast_json({
        "type": "incident_created" if is_created else "incident_updated",
        "incident": incident.model_dump() if hasattr(incident, "model_dump") else incident,
    })

    # ✅ Only propose/broadcast playbooks when created
    if is_created:
        playbooks = playbook_engine.propose_for_incident(incident)

        for pb in playbooks:
            await hub.broadcast_json({
                "type": "playbook_proposed",
                "playbook": pb.model_dump() if hasattr(pb, "model_dump") else pb.dict(),
            })

        # audit (append returns AuditEvent or dict depending on your implementation)
        try:
            evt = audit_store.append(
                event="INCIDENT_CREATED",
                dataset="SIM_DEMO",
                engine="baseline_rule_v1",
                payload=(incident.model_dump() if hasattr(incident, "model_dump") else incident),
            )
            # evt may be pydantic model
            if hasattr(evt, "model_dump"):
                evt = evt.model_dump()
            await hub.broadcast_json({"type": "audit_log", **evt})
        except Exception:
            # don't crash simulator loop
            pass

        _last_jamming_incident_id = inc_id