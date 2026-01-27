from typing import List, Dict, Any
import time

from orbverflow.mission_store import get_all_summaries
from orbverflow.mission_continuity_models import SwitchPlan


class MissionContinuityOrchestrator:
    def __init__(self, cooldown_sec: int = 10) -> None:
        self.cooldown_sec = cooldown_sec
        self._last_trigger: Dict[str, float] = {}

    def should_trigger(self, sat_id: str, link_state: str) -> bool:
        # trigger only when DOWN
        if link_state != "DOWN":
            return False

        now = time.time()
        last = self._last_trigger.get(sat_id, 0.0)

        if now - last < self.cooldown_sec:
            return False

        self._last_trigger[sat_id] = now
        return True

    def select_candidates(self, failed_sat: str) -> List[str]:
        summaries: Dict[str, Dict[str, Any]] = get_all_summaries()

        candidates: List[str] = []
        for sat_id, summary in summaries.items():
            if sat_id == failed_sat:
                continue

            tags = summary.get("capability_tags", []) or []
            if ("relay" in tags) or ("imaging" in tags):
                candidates.append(sat_id)

        # stable ordering for demo determinism
        candidates.sort()
        return candidates

    def generate_switch_plan(self, failed_sat: str) -> SwitchPlan:
        candidates = self.select_candidates(failed_sat)

        return SwitchPlan(
            failed_sat=failed_sat,
            candidates=candidates,
            window=["+5min", "+20min"],
            reason="Primary satellite link down. Recommend task reassignment (recommendation only; execution by MCS).",
            created_at=time.time(),
        )
