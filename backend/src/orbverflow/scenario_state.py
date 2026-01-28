# src/orbverflow/scenario_state.py
from __future__ import annotations

import time
from typing import Dict, Optional

from orbverflow.models import TelemetryRecord


class ScenarioState:
    def __init__(self) -> None:
        self.current: str = "NORMAL"
        self.until_ts: float = 0.0

    def set(self, scenario: str, duration_sec: int = 10) -> None:
        scenario = (scenario or "NORMAL").upper()
        self.current = scenario
        self.until_ts = time.time() + float(duration_sec)

    def active(self) -> bool:
        return self.current != "NORMAL" and time.time() <= self.until_ts

    def get(self) -> str:
        if self.active():
            return self.current
        return "NORMAL"


scenario_state = ScenarioState()


def apply_scenario_overlay(snapshot: Dict[str, TelemetryRecord]) -> Dict[str, TelemetryRecord]:
    """
    Return a NEW dict with overlay applied based on current scenario.
    Works for Airbus/static data (no simulator).
    """
    scen = scenario_state.get()
    if scen == "NORMAL":
        return snapshot

    out: Dict[str, TelemetryRecord] = {}
    for sat_id, r in snapshot.items():
        rr = r.copy(deep=True)

        if scen == "JAMMING":
            # demo: degrade all sats in snapshot
            rr.link_state = "DEGRADED"
            rr.snr_db = float(min(rr.snr_db, 6.0))
            rr.packet_loss_pct = float(max(rr.packet_loss_pct, 60.0))

        elif scen == "SATB_DOWN":
            if rr.sat_id == "SatB":
                rr.link_state = "DOWN"
                rr.snr_db = float(min(rr.snr_db, 1.0))
                rr.packet_loss_pct = 100.0

        elif scen == "SPOOFING":
            # demo: mark first/any sat as spoofing
            rr.spoofing = True

        out[sat_id] = rr

    return out
