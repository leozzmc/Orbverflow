from typing import List
from pydantic import BaseModel
import time


class SwitchPlan(BaseModel):
    failed_sat: str
    candidates: List[str]
    window: List[str]
    reason: str
    created_at: float = time.time()


class MissionContinuityRecommendation(BaseModel):
    # match API contract event type
    type: str = "mission_continuity_proposed"
    plan: SwitchPlan
