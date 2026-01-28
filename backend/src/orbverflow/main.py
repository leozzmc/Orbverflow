import asyncio
import os
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from orbverflow.app_state import hub, engine, store
from orbverflow.models import TelemetryBatch

from orbverflow.routes.health import router as health_router
from orbverflow.routes.telemetry import router as telemetry_router
from orbverflow.routes.scenario import router as scenario_router
from orbverflow.routes.ingest import router as ingest_router, _maybe_trigger_mission_continuity
from orbverflow.routes.state import router as state_router
from orbverflow.routes.meta import router as meta_router
from orbverflow.routes.airbus import router as airbus_router
from orbverflow.routes.clusters import router as clusters_router
from orbverflow.routes.incidents import router as incidents_router, maybe_emit_jamming_events
from orbverflow.routes.playbooks import router as playbooks_router
from orbverflow.routes.mission import router as mission_router
from orbverflow.routes.audit import router as audit_router
from orbverflow.routes.ws_main import router as ws_router
from orbverflow.scenario_state import scenario_state
from orbverflow.scenario_overlay import apply_overlay

app = FastAPI(title="Orbverflow Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(telemetry_router)
app.include_router(scenario_router)
app.include_router(ingest_router)
app.include_router(state_router)
app.include_router(meta_router)
app.include_router(airbus_router)
app.include_router(clusters_router)
app.include_router(incidents_router)
app.include_router(playbooks_router)
app.include_router(mission_router)
app.include_router(audit_router)
app.include_router(ws_router)


def _to_fleet_snapshot(records):
    sats = []
    for r in records:
        sats.append(
            {
                "sat_id": r.sat_id,
                "link_state": r.link_state,
                "snr_db": r.snr_db,
                "packet_loss_pct": r.packet_loss_pct,
                "position": {"lat": r.lat, "lon": r.lon},
                "source_vendor": getattr(r.provenance, "source_vendor", "SIM"),
            }
        )
    return {
        "type": "fleet_snapshot",
        "timestamp": time.time(),
        "satellites": sats,
    }


async def replay_loop():
    """
    For DISABLE_SIM=1 (Airbus / ingest-only mode):
    - periodically broadcast fleet_snapshot from store.latest_all()
    - periodically run maybe_emit_jamming_events so incident/playbooks/audit can still appear via WS
    """
    await asyncio.sleep(0.2)

    while True:
        try:
            latest_snapshot = await store.latest_all()

            # Make a fleet_snapshot from latest_snapshot values
            records = list(latest_snapshot.values()) if latest_snapshot else []
            sc = scenario_state.get()
            records = apply_overlay(records, sc)
            if records:
                await hub.broadcast_json(_to_fleet_snapshot(records))

            # WS-first: emit incident/playbook/audit even without simulator
            await maybe_emit_jamming_events(latest_snapshot, now_ts=time.time())

        except Exception as e:
            print(f"[replay_loop] failed: {e}")

        await asyncio.sleep(1.0)


async def simulator_loop():
    tick = 0
    await asyncio.sleep(0.2)

    while True:
        tick += 1

        # IMPORTANT: your SimulatorEngine.generate_batch() returns List[TelemetryRecord]
        records = engine.generate_batch()

        # store rolling telemetry window
        await store.add_records(records)

        # Issue-7 mission continuity hook (writes store + WS inside that module)
        await _maybe_trigger_mission_continuity(records)

        # WS-first: emit incident/playbook/audit (instead of relying on REST polling)
        # Demo hooks should never kill the simulator loop.
        try:
            latest_snapshot = await store.latest_all()
            await maybe_emit_jamming_events(latest_snapshot, now_ts=time.time())
        except Exception as e:
            print(f"[simulator] maybe_emit_jamming_events failed: {e}")

        # WS: telemetry batch
        payload = TelemetryBatch(
            scenario=engine.current_scenario,
            tick=tick,
            records=records,
        ).model_dump()

        await hub.broadcast_json({"type": "telemetry_batch", **payload})

        # WS: fleet snapshot (uses records => will reflect JAMMING degraded immediately)
        await hub.broadcast_json(_to_fleet_snapshot(records))

        await asyncio.sleep(1.0)


@app.on_event("startup")
async def on_startup():
    if os.getenv("DISABLE_SIM", "0") != "1":
        print("[startup] simulator enabled; running simulator_loop()")
        asyncio.create_task(simulator_loop())
    else:
        print("[startup] simulator disabled; running replay_loop()")
        asyncio.create_task(replay_loop())


@app.get("/")
def root():
    return {"ok": True, "service": "orbverflow-backend", "time": time.time()}
