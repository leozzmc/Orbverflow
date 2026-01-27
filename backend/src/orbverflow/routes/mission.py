from fastapi import APIRouter
from typing import Any, Dict

from orbverflow.app_state import (
    mission_orchestrator,
    mission_continuity_store,
)
from orbverflow.mission_continuity_models import MissionContinuityRecommendation

router = APIRouter(tags=["mission"])


@router.get("/mission/continuity/latest")
async def get_latest_continuity() -> Dict[str, Any]:
    rec = await mission_continuity_store.get_latest()

    if not rec:
        return {"ok": True, "has_plan": False, "recommendation": None}

    return {
        "ok": True,
        "has_plan": True,
        "recommendation": rec,
    }


@router.post("/mission/trigger_failure/{sat_id}")
async def trigger_failure(sat_id: str) -> Dict[str, Any]:
    plan = mission_orchestrator.generate_switch_plan(sat_id)
    rec = MissionContinuityRecommendation(plan=plan).model_dump()

    # also store it for consistency with /latest
    await mission_continuity_store.set_latest(rec)

    return {"ok": True, "recommendation": rec}
