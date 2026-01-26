from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Union

from orbverflow.models import TelemetryRecord, TelemetryBatch
from orbverflow.app_state import store

router = APIRouter(prefix="/ingest", tags=["ingest"])


class IngestResponse(BaseModel):
    ok: bool = True
    ingested: int


@router.post("/telemetry", response_model=IngestResponse)
async def ingest_telemetry(payload: Union[TelemetryBatch, List[TelemetryRecord]]):
    # allow either batch or list of records
    if isinstance(payload, TelemetryBatch):
        records = payload.records
    else:
        records = payload

    await store.add_records(records)
    return IngestResponse(ingested=len(records))


@router.websocket("/ws/ingest")
async def ws_ingest(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            msg = await ws.receive_json()
            # expect TelemetryBatch shape (recommended)
            batch = TelemetryBatch(**msg)
            await store.add_records(batch.records)
            await ws.send_json({"ok": True, "ingested": len(batch.records)})
    except WebSocketDisconnect:
        return
