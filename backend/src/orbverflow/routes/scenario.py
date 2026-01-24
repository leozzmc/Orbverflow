from fastapi import APIRouter
from pydantic import BaseModel

from orbverflow.models import Scenario
from orbverflow.app_state import engine

router = APIRouter(prefix="/scenario", tags=["scenario"])


class TriggerRequest(BaseModel):
    scenario: Scenario
    duration_sec: int = 30


@router.post("/trigger")
def trigger(req: TriggerRequest):
    engine.trigger_scenario(req.scenario, duration_sec=req.duration_sec)
    return {"ok": True, "scenario": engine.current_scenario, "duration_sec": req.duration_sec}
