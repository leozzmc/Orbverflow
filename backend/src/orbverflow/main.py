import asyncio, os
from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()
from orbverflow.app_state import hub, engine, store
from orbverflow.models import TelemetryBatch
from orbverflow.routes.health import router as health_router
from orbverflow.routes.telemetry import router as telemetry_router
from orbverflow.routes.scenario import router as scenario_router
from orbverflow.routes.ingest import router as ingest_router
from orbverflow.routes.state import router as state_router
from orbverflow.routes.meta import router as meta_router
from orbverflow.routes.airbus import router as airbus_router
from orbverflow.routes.clusters import router as clusters_router
from orbverflow.routes.incidents import router as incidents_router


app = FastAPI(title="Orbverflow Backend")

app.include_router(health_router)
app.include_router(telemetry_router)
app.include_router(scenario_router)
app.include_router(ingest_router)
app.include_router(state_router)
app.include_router(meta_router)
app.include_router(airbus_router)
app.include_router(clusters_router)
app.include_router(incidents_router)


async def simulator_loop():
    tick = 0
    while True:
        tick += 1
        records = engine.generate_batch()

        await store.add_records(records)

        payload = TelemetryBatch(
            scenario=engine.current_scenario,
            tick=tick,
            records=records,
        ).model_dump()

        await hub.broadcast_json(payload)
        await asyncio.sleep(1)



@app.on_event("startup")
async def on_startup():
    if os.getenv("DISABLE_SIM", "0") != "1":
        asyncio.create_task(simulator_loop())
    else:
        print("[startup] simulator disabled by env")
