from __future__ import annotations

from typing import Dict, List, Literal, Optional
from pydantic import BaseModel


IncidentType = Literal["JAMMING", "UNKNOWN"]


class Incident(BaseModel):
    incident_id: str
    type: IncidentType = "JAMMING"
    affected_sats: List[str]

    location: Dict[str, float]  # {"lat":..., "lon":...}
    radius_km: float
    confidence: float  # 0..1

    engine_type: str = "baseline_rule_v1"
    timestamp: float  # epoch seconds

    provenance: Dict[str, object] = {}  # include dataset + mapping_version + source files


class IncidentResponse(BaseModel):
    ok: bool = True
    incident: Incident


class IncidentLatestResponse(BaseModel):
    ok: bool = True
    has_incident: bool
    incident: Optional[Incident] = None
    reason: Optional[str] = None
