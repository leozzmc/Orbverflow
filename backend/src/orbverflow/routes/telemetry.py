import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from orbverflow.app_state import hub, engine

router = APIRouter(tags=["telemetry"])


@router.get("/telemetry/latest")
def get_latest():
    latest = engine.latest()
    if not latest:
        return {"ok": True, "has_data": False, "scenario": engine.current_scenario, "records": []}

    return {
        "ok": True,
        "has_data": True,
        "scenario": engine.current_scenario,
        "records": [r.model_dump() for r in latest],
    }


@router.websocket("/ws/telemetry")
async def ws_telemetry(ws: WebSocket):
    """
    Backwards-compatible WS endpoint.
    For Issue-8 dashboard contract, prefer /ws (see routes/ws_main.py).
    """
    await hub.connect(ws)
    try:
        while True:
            await asyncio.sleep(3600)
    except WebSocketDisconnect:
        await hub.disconnect(ws)
