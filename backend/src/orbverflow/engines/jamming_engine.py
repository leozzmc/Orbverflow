from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any, Dict, Optional, Tuple

from orbverflow.incident_store import Incident, IncidentStore
from orbverflow.engines.cluster_engine import ClusterEngine
from orbverflow.models import TelemetryRecord


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


@dataclass
class JammingEngineConfig:
    min_affected_sats: int = 2
    incident_type: str = "JAMMING"
    engine_type: str = "baseline_rule_v1"


class JammingEngine:
    """
    Detection + triangulation engine (demo baseline).

    - Reuse ClusterEngine /clusters/suggest result to emit a JAMMING incident.
    - Adds dataset provenance from ProvenanceRegistry if available.
    - Uses IncidentStore cooldown to avoid spamming new incident IDs.
    """

    def __init__(
        self,
        cluster_engine: ClusterEngine,
        incident_store: IncidentStore,
        prov_registry: Any = None,
        cfg: Optional[JammingEngineConfig] = None,
    ):
        self.cluster_engine = cluster_engine
        self.incident_store = incident_store
        self.prov_registry = prov_registry
        self.cfg = cfg or JammingEngineConfig()

    def _get_dataset_meta(self) -> Optional[Dict[str, Any]]:
        pr = self.prov_registry
        if pr is None:
            return None

        # Try common method/property names safely
        candidates = ["get_dataset", "get_dataset_meta", "latest_dataset", "current_dataset", "dataset", "meta"]
        for attr in candidates:
            if hasattr(pr, attr):
                v = getattr(pr, attr)
                try:
                    meta = v() if callable(v) else v
                    if isinstance(meta, dict):
                        return meta
                except Exception:
                    continue
        return None

    def detect_and_triangulate(
        self,
        latest: Dict[str, TelemetryRecord],
        now_ts: Optional[float] = None,
    ) -> Tuple[Optional[Incident], str]:
        if not latest:
            return None, "no telemetry available"

        cluster_resp = self.cluster_engine.suggest_clusters(latest)

        if not cluster_resp.clusters:
            return None, "no clusters above thresholds"

        # Pick largest cluster
        clusters_sorted = sorted(cluster_resp.clusters, key=lambda c: len(c.members), reverse=True)
        top = clusters_sorted[0]

        if len(top.members) < int(self.cfg.min_affected_sats):
            return None, "cluster size < %d" % self.cfg.min_affected_sats

        lat = float(top.center.get("lat", 0.0))
        lon = float(top.center.get("lon", 0.0))
        radius_km = float(top.radius_km)

        # Confidence = cluster avg_score (preferred) else avg of members
        avg_score = None
        try:
            # pydantic model summary
            if hasattr(top, "summary") and top.summary is not None:
                if isinstance(top.summary, dict):
                    avg_score = top.summary.get("avg_score")
                else:
                    avg_score = float(top.summary.avg_score)  # type: ignore
        except Exception:
            avg_score = None

        if avg_score is None:
            scores = []
            for s in top.members:
                if s in top.consistency:
                    scores.append(float(top.consistency[s].score))
            avg_score = sum(scores) / max(len(scores), 1)

        confidence = _clamp(float(avg_score), 0.0, 1.0)

        prov: Dict[str, Any] = {
            "engine": getattr(cluster_resp, "engine", self.cfg.engine_type),
            "triggered_by": getattr(top, "triggered_by", []),
            "thresholds": getattr(cluster_resp, "thresholds", None),
        }

        dataset_meta = self._get_dataset_meta()
        if dataset_meta:
            prov["dataset"] = dataset_meta

        now = float(now_ts or time.time())

        incident, action = self.incident_store.upsert(
            incident_type=self.cfg.incident_type,
            affected_sats=list(top.members),
            location={"lat": round(lat, 6), "lon": round(lon, 6)},
            radius_km=round(radius_km, 3),
            confidence=round(confidence, 4),
            engine_type=self.cfg.engine_type,
            provenance=prov,
            now_ts=now,
        )

        return incident, "%s" % action
