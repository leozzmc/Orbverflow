import asyncio
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from orbverflow.app_state import hub, engine
from orbverflow.models import TelemetryBatch

router = APIRouter(tags=["ws"])


@router.websocket("/ws")
async def ws_main(ws: WebSocket):
    """
    Main dashboard websocket endpoint.

    Design:
    - Fan-out only (server -> client). No client messages expected.
    - Uses the shared hub, so any hub.broadcast_json() reaches this client.
    - On connect: sends a small "hello" + current snapshot for fast UI paint.
    - Periodic ping to reduce idle disconnects (proxy / browser / wifi).
    """
    await hub.connect(ws)

    # ✅ (optional but useful) initial hello + snapshot
    try:
        await ws.send_json({"type": "hello", "ts": time.time()})

        latest = engine.latest() or []
        await ws.send_json(
            {
                "type": "telemetry_batch",
                "scenario": engine.current_scenario,
                "tick": -1,
                "records": [r.model_dump() for r in latest],
            }
        )
    except Exception:
        # If client disconnects immediately, just exit gracefully
        await hub.disconnect(ws)
        return

    try:
        while True:
            # ✅ keepalive ping
            await ws.send_json({"type": "ping", "ts": time.time()})
            await asyncio.sleep(25)
    except WebSocketDisconnect:
        await hub.disconnect(ws)
    except Exception:
        await hub.disconnect(ws)
