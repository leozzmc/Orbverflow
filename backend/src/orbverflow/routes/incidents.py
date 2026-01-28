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
_last_jamming_emit_ts: float = 0.0


def _as_dict(x: Any) -> Dict[str, Any]:
    if x is None:
        return {}
    if isinstance(x, dict):
        return x
    if hasattr(x, "model_dump"):
        return x.model_dump()
    if hasattr(x, "dict"):
        return x.dict()
    return {"value": x}

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


# async def maybe_emit_jamming_events(latest_snapshot, now_ts: Optional[float] = None) -> None:
#     """
#     WS-first:
#     - detect jamming every tick
#     - BUT only create/broadcast incident + playbooks when incident is CREATED
#       (avoid duplicate PB spam during the same scenario window)
#     """
#     incident, reason = jamming_engine.detect_and_triangulate(latest_snapshot, now_ts=now_ts)

#     if not incident:
#         return

#     # detect store action string from IncidentStore
#     # typically: "jamming incident created" / "jamming incident updated"
#     action = str(reason).lower()

#     # ✅ IMPORTANT: only emit playbooks on CREATE
#     is_created = "created" in action

#     global _last_jamming_incident_id
#     inc_id = getattr(incident, "incident_id", None)

#     # extra guard: if created but same id as last (rare), don't spam
#     if is_created and inc_id is not None and inc_id == _last_jamming_incident_id:
#         is_created = False

#     # Always broadcast incident (optional)
#     await hub.broadcast_json({
#         "type": "incident_created" if is_created else "incident_updated",
#         "incident": incident.model_dump() if hasattr(incident, "model_dump") else incident,
#     })

#     # ✅ Only propose/broadcast playbooks when created
#     if is_created:
#         playbooks = playbook_engine.propose_for_incident(incident)

#         for pb in playbooks:
#             await hub.broadcast_json({
#                 "type": "playbook_proposed",
#                 "playbook": pb.model_dump() if hasattr(pb, "model_dump") else pb.dict(),
#             })

#         # audit (append returns AuditEvent or dict depending on your implementation)
#         try:
#             evt = audit_store.append(
#                 event="INCIDENT_CREATED",
#                 dataset="SIM_DEMO",
#                 engine="baseline_rule_v1",
#                 payload=(incident.model_dump() if hasattr(incident, "model_dump") else incident),
#             )
#             # evt may be pydantic model
#             if hasattr(evt, "model_dump"):
#                 evt = evt.model_dump()
#             await hub.broadcast_json({"type": "audit_log", **evt})
#         except Exception:
#             # don't crash simulator loop
#             pass

#         _last_jamming_incident_id = inc_id

async def maybe_emit_jamming_events(latest_snapshot, now_ts: Optional[float] = None) -> None:
    """
    WS-first:
    - detect jamming every tick
    - only propose/broadcast playbooks + audit when we see a NEW incident_id
      (prevents duplicate PB spam when incident is "updated" repeatedly)
    """
    global _last_jamming_incident_id, _last_jamming_emit_ts

    incident, detect_reason = jamming_engine.detect_and_triangulate(latest_snapshot, now_ts=now_ts)
    if not incident:
        return

    inc_id = getattr(incident, "incident_id", None)
    if inc_id is None:
        # Shouldn't happen, but don't break the loop
        return

    is_new = (inc_id != _last_jamming_incident_id)

    # Optional: throttle "updated" broadcasts a bit (avoid WS spam)
    # If you want every tick update, remove this block.
    now = float(now_ts or time.time())
    if not is_new:
        if (now - _last_jamming_emit_ts) < 1.0:
            return

    # Broadcast incident event
    await hub.broadcast_json({
        "type": "incident_created" if is_new else "incident_updated",
        "incident": _as_dict(incident),
        "reason": str(detect_reason),
    })

    # Only on NEW incident id -> propose playbooks + audit
    if is_new:
        playbooks = playbook_engine.propose_for_incident(incident)

        for pb in playbooks:
            await hub.broadcast_json({
                "type": "playbook_proposed",
                "playbook": _as_dict(pb),
            })

        # ✅ audit (append is async in your repo)
        try:
            evt = await audit_store.append(
                event="INCIDENT_CREATED",
                dataset="SIM_DEMO",
                engine="baseline_rule_v1",
                # payload=_as_dict(incident),
                payload=incident.model_dump(),
            )
            # await hub.broadcast_json({"type": "audit_log", **_as_dict(evt)})
            await hub.broadcast_json({"type": "audit_log", **evt.model_dump()})
        except Exception as e:
            print(f"[ws] audit append failed: {e}")

        _last_jamming_incident_id = inc_id

    _last_jamming_emit_ts = now