from typing import List, Dict, Literal
from pydantic import BaseModel


ConsistencyLevel = Literal["ok", "suspicious", "confirmed", "high_confidence"]


class ConsistencyResult(BaseModel):
    sat_id: str
    level: ConsistencyLevel
    score: float  # 0..1
    reasons: List[str]


class Thresholds(BaseModel):
    distance_km: float
    intensity: float
    snr_low: float
    loss_high: float


class ClusterSummary(BaseModel):
    avg_score: float
    max_score: float
    levels_breakdown: Dict[str, int]


class ClusterOut(BaseModel):
    cluster_id: str
    members: List[str]
    center: Dict[str, float]
    radius_km: float
    reason: str
    consistency: Dict[str, ConsistencyResult]
    summary: ClusterSummary
    triggered_by: List[str]


class ClusterSuggestResponse(BaseModel):
    ok: bool = True
    engine: str = "baseline_rule_v1"
    thresholds: Thresholds
    clusters: List[ClusterOut]
    per_sat: Dict[str, ConsistencyResult]
