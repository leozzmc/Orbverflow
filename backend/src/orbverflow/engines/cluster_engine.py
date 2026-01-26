from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple, Set
from collections import Counter
import math

from orbverflow.cluster_models import (
    ConsistencyResult,
    ClusterOut,
    ClusterSummary,
    ClusterSuggestResponse,
    Thresholds,
)
from orbverflow.models import TelemetryRecord  # 你既有 models.py


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # no deps
    R = 6371.0
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@dataclass
class ClusterConfig:
    distance_km_max: float = 1500.0
    cluster_intensity_threshold: float = 0.55  # which sats are "affected enough" to cluster
    suspicious_threshold: float = 0.35
    confirmed_threshold: float = 0.55
    high_conf_threshold: float = 0.75
    snr_ok_floor: float = 12.0  # below this starts becoming "bad"
    loss_high_floor: float = 50.0  # for debug-friendly threshold exposure


class ClusterEngine:
    def __init__(self, config: ClusterConfig | None = None):
        self.cfg = config or ClusterConfig()

    def _intensity(self, r: TelemetryRecord) -> Tuple[float, List[str]]:
        # packet_loss_pct: 0..100
        loss = float(getattr(r, "packet_loss_pct", 0.0) or 0.0)
        snr = float(getattr(r, "snr_db", 0.0) or 0.0)

        loss_norm = _clamp(loss / 100.0, 0.0, 1.0)
        snr_bad_norm = _clamp((self.cfg.snr_ok_floor - snr) / self.cfg.snr_ok_floor, 0.0, 1.0)

        intensity = _clamp(0.7 * loss_norm + 0.3 * snr_bad_norm, 0.0, 1.0)

        reasons: List[str] = []
        if loss >= self.cfg.loss_high_floor:
            reasons.append(f"packet_loss_pct high ({loss:.1f}%)")
        if snr < self.cfg.snr_ok_floor:
            reasons.append(f"snr_db low ({snr:.1f} < {self.cfg.snr_ok_floor})")
        if not reasons:
            reasons.append("metrics within expected range")

        return intensity, reasons

    def consistency(self, latest: Dict[str, TelemetryRecord]) -> Dict[str, ConsistencyResult]:
        out: Dict[str, ConsistencyResult] = {}
        for sat_id, r in latest.items():
            intensity, reasons = self._intensity(r)

            if intensity >= self.cfg.high_conf_threshold:
                level = "high_confidence"
            elif intensity >= self.cfg.confirmed_threshold:
                level = "confirmed"
            elif intensity >= self.cfg.suspicious_threshold:
                level = "suspicious"
            else:
                level = "ok"

            out[sat_id] = ConsistencyResult(
                sat_id=sat_id,
                level=level,
                score=round(float(intensity), 4),
                reasons=reasons,
            )
        return out

    def _calc_cluster_summary(
        self, member_results: Dict[str, ConsistencyResult]
    ) -> Tuple[float, float, Dict[str, int]]:
        scores = [r.score for r in member_results.values()]
        avg_score = round(sum(scores) / max(len(scores), 1), 4)
        max_score = round(max(scores) if scores else 0.0, 4)

        cnt = Counter([r.level for r in member_results.values()])
        levels_breakdown = {
            "ok": int(cnt.get("ok", 0)),
            "suspicious": int(cnt.get("suspicious", 0)),
            "confirmed": int(cnt.get("confirmed", 0)),
            "high_confidence": int(cnt.get("high_confidence", 0)),
        }
        return avg_score, max_score, levels_breakdown

    def _infer_triggered_by(self, member_results: Dict[str, ConsistencyResult]) -> List[str]:
        triggers: Set[str] = set()
        for r in member_results.values():
            for s in r.reasons:
                s_l = s.lower()
                if "packet_loss" in s_l or "loss" in s_l:
                    triggers.add("packet_loss")
                if "snr" in s_l:
                    triggers.add("snr_drop")
                if "reset" in s_l or "modem" in s_l:
                    triggers.add("modem_reset")

        order = ["packet_loss", "snr_drop", "modem_reset"]
        return [t for t in order if t in triggers]

    def suggest_clusters(self, latest: Dict[str, TelemetryRecord]) -> ClusterSuggestResponse:
        per_sat = self.consistency(latest)

        # only cluster sats above threshold
        affected = [sid for sid, c in per_sat.items() if c.score >= self.cfg.cluster_intensity_threshold]

        # build adjacency by distance constraint
        adj: Dict[str, List[str]] = {sid: [] for sid in affected}
        for i in range(len(affected)):
            a = affected[i]
            ra = latest[a]
            for j in range(i + 1, len(affected)):
                b = affected[j]
                rb = latest[b]
                d = haversine_km(ra.lat, ra.lon, rb.lat, rb.lon)
                if d <= self.cfg.distance_km_max:
                    adj[a].append(b)
                    adj[b].append(a)

        # connected components (BFS)
        clusters_members: List[List[str]] = []
        seen: Set[str] = set()
        for sid in affected:
            if sid in seen:
                continue
            q = [sid]
            seen.add(sid)
            comp: List[str] = []
            while q:
                x = q.pop()
                comp.append(x)
                for y in adj.get(x, []):
                    if y not in seen:
                        seen.add(y)
                        q.append(y)
            clusters_members.append(sorted(comp))

        # ✅ (1) filter out singleton clusters for demo clarity
        clusters_members = [c for c in clusters_members if len(c) >= 2]

        # build cluster output
        clusters: List[ClusterOut] = []
        for idx, members in enumerate(clusters_members, start=1):
            # center
            lats = [latest[s].lat for s in members]
            lons = [latest[s].lon for s in members]
            center_lat = sum(lats) / len(lats)
            center_lon = sum(lons) / len(lons)

            # radius
            radius = 0.0
            for s in members:
                r = latest[s]
                radius = max(radius, haversine_km(center_lat, center_lon, r.lat, r.lon))

            member_results = {s: per_sat[s] for s in members}
            avg_intensity = sum(member_results[s].score for s in members) / len(members)

            avg_score, max_score, levels_breakdown = self._calc_cluster_summary(member_results)
            triggered_by = self._infer_triggered_by(member_results)

            # ✅ (2) append triggered_by to reason for explainable demo
            reason = (
                f"Grouped by distance <= {self.cfg.distance_km_max:.0f}km and anomaly intensity >= "
                f"{self.cfg.cluster_intensity_threshold:.2f} (avg={avg_intensity:.2f}); "
                f"triggered_by={triggered_by}."
            )

            clusters.append(
                ClusterOut(
                    cluster_id=f"CL-{idx:03d}",
                    members=members,
                    center={"lat": round(center_lat, 6), "lon": round(center_lon, 6)},
                    radius_km=round(radius, 3),
                    reason=reason,
                    consistency=member_results,
                    summary=ClusterSummary(
                        avg_score=avg_score,
                        max_score=max_score,
                        levels_breakdown=levels_breakdown,
                    ),
                    triggered_by=triggered_by,
                )
            )

        # sort: biggest first
        clusters.sort(key=lambda c: len(c.members), reverse=True)

        return ClusterSuggestResponse(
            engine="baseline_rule_v1",
            thresholds=Thresholds(
                distance_km=self.cfg.distance_km_max,
                intensity=self.cfg.cluster_intensity_threshold,
                snr_low=self.cfg.snr_ok_floor,
                loss_high=self.cfg.loss_high_floor,
            ),
            clusters=clusters,
            per_sat=per_sat,
        )
