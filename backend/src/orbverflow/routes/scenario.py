from fastapi import APIRouter
from pydantic import BaseModel

from orbverflow.models import Scenario
from orbverflow.app_state import engine
from orbverflow.scenario_state import scenario_state

router = APIRouter(prefix="/scenario", tags=["scenario"])


class TriggerRequest(BaseModel):
    scenario: Scenario
    duration_sec: int = 30


# @router.post("/trigger")
# def trigger(req: TriggerRequest):
#     engine.trigger_scenario(req.scenario, duration_sec=req.duration_sec)
#     return {"ok": True, "scenario": engine.current_scenario, "duration_sec": req.duration_sec}

@router.post("/trigger")
async def trigger_scenario(req: TriggerRequest):
    # Always set global scenario state (works for Airbus/static mode too)
    scenario_state.set(req.scenario, req.duration_sec)

    # If simulator engine is running, also tell engine to affect generated telemetry
    try:
        engine.trigger_scenario(req.scenario, duration_sec=req.duration_sec)
        print(f"[Simulator] Scenario triggered: {req.scenario}")
    except Exception:
        # engine may not be used in DISABLE_SIM mode - ignore
        pass

    return {"ok": True, "scenario": req.scenario, "duration_sec": req.duration_sec}
