import asyncio
from fastapi import FastAPI

from orbverflow.app_state import hub, engine, store
from orbverflow.models import TelemetryBatch
from orbverflow.routes.health import router as health_router
from orbverflow.routes.telemetry import router as telemetry_router
from orbverflow.routes.scenario import router as scenario_router
from orbverflow.routes.ingest import router as ingest_router
from orbverflow.routes.state import router as state_router
from orbverflow.app_state import store as app_store

app = FastAPI(title="Orbverflow Backend")

app.include_router(health_router)
app.include_router(telemetry_router)
app.include_router(scenario_router)
app.include_router(ingest_router)
app.include_router(state_router)


async def simulator_loop():
    tick = 0
    while True:
        tick += 1
        records = engine.generate_batch()

        # For issue-2: store it
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
    asyncio.create_task(simulator_loop())
