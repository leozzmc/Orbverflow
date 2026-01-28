# src/orbverflow/scenario_overlay.py
from __future__ import annotations
from typing import List
from orbverflow.models import TelemetryRecord

def apply_overlay(records: List[TelemetryRecord], scenario: str) -> List[TelemetryRecord]:
    sc = (scenario or "NORMAL").upper()
    if sc == "NORMAL":
        return records

    # Demo: JAMMING -> degrade everyone except maybe SatA (你也可以改成挑某幾顆)
    if sc == "JAMMING":
        out = []
        for r in records:
            rr = r.model_copy(deep=True) if hasattr(r, "model_copy") else r
            if getattr(rr, "sat_id", "") != "SatA":
                rr.link_state = "DEGRADED"
                rr.snr_db = max(0.0, float(rr.snr_db) - 8.0)
                rr.packet_loss_pct = min(100.0, float(rr.packet_loss_pct) + 60.0)
            out.append(rr)
        return out

    # SATB_DOWN -> SatB link DOWN
    if sc == "SATB_DOWN":
        out = []
        for r in records:
            rr = r.model_copy(deep=True) if hasattr(r, "model_copy") else r
            if getattr(rr, "sat_id", "") == "SatB":
                rr.link_state = "DOWN"
                rr.snr_db = 0.0
                rr.packet_loss_pct = 100.0
            out.append(rr)
        return out

    return records
