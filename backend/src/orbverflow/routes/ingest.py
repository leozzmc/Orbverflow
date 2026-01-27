from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Union

from orbverflow.models import TelemetryRecord, TelemetryBatch
from orbverflow.app_state import store, mission_orchestrator, mission_continuity_store
from orbverflow.mission_store import update_summary
from orbverflow.mission_continuity_models import MissionContinuityRecommendation

router = APIRouter(prefix="/ingest", tags=["ingest"])


class IngestResponse(BaseModel):
    ok: bool = True
    ingested: int


async def _maybe_trigger_mission_continuity(records: List[TelemetryRecord]) -> None:
    """
    Issue-7 hook:
    - update mission summaries store (demo stub derived from telemetry)
    - if SatB DOWN and cooldown allows -> generate switch plan recommendation
    - write to mission_continuity_store (shared singleton)
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
                rec = MissionContinuityRecommendation(plan=plan).model_dump()
                await mission_continuity_store.set_latest(rec)
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
