from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Union
from dataclasses import asdict
import asyncio
import inspect

from orbverflow.models import TelemetryRecord, TelemetryBatch
from orbverflow.app_state import (
    store,
    hub,
    audit_store,
    mission_orchestrator,
    mission_continuity_store,
)
from orbverflow.mission_store import update_summary
from orbverflow.mission_continuity_models import MissionContinuityRecommendation

router = APIRouter(prefix="/ingest", tags=["ingest"])


class IngestResponse(BaseModel):
    ok: bool = True
    ingested: int


async def _safe_broadcast(payload: dict) -> None:
    """
    broadcast helper that works whether hub.broadcast_json is async or sync.
    """
    try:
        result = hub.broadcast_json(payload)
        if inspect.isawaitable(result):
            await result
    except Exception:
        # WS should never break ingestion pipeline in demo
        return


async def _maybe_trigger_mission_continuity(records: List[TelemetryRecord]) -> None:
    """
    Issue-7 hook:
    - update mission summaries store (demo stub derived from telemetry)
    - if SatB DOWN and cooldown allows -> generate switch plan recommendation
    - write to mission_continuity_store (shared singleton)
    - push WS event + write audit log + push audit event (Issue-8 ready)
    """

    # 1) update mission summaries (demo stub)
    for r in records:
        summary = {
            "timestamp": r.timestamp,
            "sat_id": r.sat_id,
            "mission_mode": "IMAGING",            # demo stub
            "queue_depth": 10,                    # demo stub
            "cmd_seq_hash": "demo-hash",          # demo stub
            "time_window": ["+5min", "+20min"],   # demo stub
            "capability_tags": ["relay"],         # demo stub
        }
        update_summary(r.sat_id, summary)

    # 2) trigger condition: SatB DOWN
    for r in records:
        if r.sat_id == "SatB" and r.link_state == "DOWN":
            if mission_orchestrator.should_trigger("SatB", "DOWN"):
                plan = mission_orchestrator.generate_switch_plan("SatB")

                # Mission continuity recommendation payload (already has type="mission_continuity_proposed")
                rec = MissionContinuityRecommendation(plan=plan).model_dump()

                # store latest for REST fetch
                await mission_continuity_store.set_latest(rec)

                # WS: push mission continuity event
                await _safe_broadcast(rec)

                # Audit: append + push audit event
                ae = await audit_store.append(
                    event="MISSION_CONTINUITY_PROPOSED",
                    dataset="SIM_DEMO",          # demo; later can map from provenance
                    engine="baseline_rule_v1",   # demo engine label
                    payload={
                        "failed_sat": plan.failed_sat,
                        "candidates": plan.candidates,
                        "window": plan.window,
                        "created_at": plan.created_at,
                    },
                )

                audit_evt = {"type": "audit_log", **asdict(ae)}
                await _safe_broadcast(audit_evt)
            break


@router.post("/telemetry", response_model=IngestResponse)
async def ingest_telemetry(payload: Union[TelemetryBatch, List[TelemetryRecord]]):
    # allow either batch or list of records
    records = payload.records if isinstance(payload, TelemetryBatch) else payload

    await store.add_records(records)
    await _maybe_trigger_mission_continuity(records)

    return IngestResponse(ingested=len(records))


@router.websocket("/ws/ingest")
async def ws_ingest(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            msg = await ws.receive_json()
            batch = TelemetryBatch(**msg)

            await store.add_records(batch.records)
            await _maybe_trigger_mission_continuity(batch.records)

            await ws.send_json({"ok": True, "ingested": len(batch.records)})
    except WebSocketDisconnect:
        return
