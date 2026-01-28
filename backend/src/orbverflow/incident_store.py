from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
import time

from pydantic import BaseModel, Field


@dataclass
class IncidentStoreConfig:
    cooldown_sec: float = 10.0
    geo_bin_deg: float = 0.2  # demo recommended


class IncidentLocation(BaseModel):
    lat: float
    lon: float


class Incident(BaseModel):
    incident_id: str
    type: str  # e.g. "JAMMING"
    affected_sats: List[str]
    location: IncidentLocation
    radius_km: float
    confidence: float
    engine_type: str
    timestamp: float = Field(default_factory=lambda: time.time())
    provenance: Dict[str, Any] = Field(default_factory=dict)


class LatestIncidentResponse(BaseModel):
    ok: bool = True
    has_incident: bool
    incident: Optional[Incident] = None
    reason: str = ""


def _round_bin(value: float, bin_size: float) -> float:
    if bin_size <= 0:
        return float(value)
    idx = int(round(float(value) / float(bin_size)))
    return float(idx) * float(bin_size)


class IncidentStore:
    """
    Demo store:
    - Keeps only latest incident (hackathon-friendly)
    - Cooldown + geo-bin signature avoids new IDs on polling
    - Signature = type + quantized lat/lon
    """

    def __init__(self, cfg: Optional[IncidentStoreConfig] = None):
        self.cfg = cfg or IncidentStoreConfig()
        self._counter: int = 0

        self._latest: Optional[Incident] = None
        self._latest_sig: Optional[str] = None
        self._last_emit_ts: float = 0.0

    def _make_id(self) -> str:
        self._counter += 1
        return "INC-{0:03d}".format(self._counter)

    def _signature(self, incident_type: str, lat: float, lon: float) -> str:
        lat_b = _round_bin(lat, self.cfg.geo_bin_deg)
        lon_b = _round_bin(lon, self.cfg.geo_bin_deg)
        return "{0}|lat={1:.1f}|lon={2:.1f}|bin={3:.1f}".format(
            incident_type, lat_b, lon_b, self.cfg.geo_bin_deg
        )

    def latest(self) -> Optional[Incident]:
        return self._latest

    # --- Compatibility wrapper for existing engines ---
    def upsert(self, **kwargs) -> Tuple[Incident, str]:
        """
        Supports both call styles:

        1) upsert(type="JAMMING", location={"lat":..,"lon":..}, ...)
        2) upsert(type="JAMMING", lat=.., lon=.., ...)

        Returns: (Incident, action_str)
        """
        incident_type = str(kwargs.get("type") or kwargs.get("incident_type") or "").upper()
        if incident_type != "JAMMING":
            raise ValueError("IncidentStore.upsert only supports JAMMING in demo")

        affected_sats = kwargs.get("affected_sats") or []
        radius_km = float(kwargs.get("radius_km") or 0.0)
        confidence = float(kwargs.get("confidence") or 0.0)
        engine_type = str(kwargs.get("engine_type") or kwargs.get("engine") or "baseline_rule_v1")
        provenance = kwargs.get("provenance") or None
        now_ts = kwargs.get("now_ts") or kwargs.get("timestamp") or None

        # accept location dict/object
        lat = None
        lon = None
        if "location" in kwargs and kwargs["location"] is not None:
            loc = kwargs["location"]
            # loc may be dict or pydantic model
            if isinstance(loc, dict):
                lat = loc.get("lat")
                lon = loc.get("lon")
            else:
                lat = getattr(loc, "lat", None)
                lon = getattr(loc, "lon", None)

        # fallback to explicit lat/lon
        if lat is None:
            lat = kwargs.get("lat")
        if lon is None:
            lon = kwargs.get("lon")

        if lat is None or lon is None:
            raise ValueError("upsert requires location{lat,lon} or lat/lon")

        return self.upsert_jamming_incident(
            affected_sats=list(affected_sats),
            lat=float(lat),
            lon=float(lon),
            radius_km=radius_km,
            confidence=confidence,
            engine_type=engine_type,
            provenance=provenance,
            now_ts=now_ts,
        )

    # # --- Actual implementation (geo-bin signature + cooldown) ---
    # def upsert_jamming_incident(
    #     self,
    #     affected_sats: List[str],
    #     lat: float,
    #     lon: float,
    #     radius_km: float,
    #     confidence: float,
    #     engine_type: str,
    #     provenance: Optional[Dict[str, Any]] = None,
    #     now_ts: Optional[float] = None,
    # ) -> Tuple[Incident, str]:
    #     now = float(now_ts if now_ts is not None else time.time())
    #     sig = self._signature("JAMMING", float(lat), float(lon))

    #     within_cooldown = (now - float(self._last_emit_ts)) < float(self.cfg.cooldown_sec)
    #     same_sig = (self._latest_sig is not None and sig == self._latest_sig)

    #     prov: Dict[str, Any] = dict(provenance or {})
    #     prov.setdefault("engine", engine_type)
    #     prov.setdefault("correlation", {})
    #     prov["correlation"]["signature"] = sig
    #     prov["correlation"]["geo_bin_deg"] = float(self.cfg.geo_bin_deg)
    #     prov["correlation"]["cooldown_sec"] = float(self.cfg.cooldown_sec)

    #     if self._latest is not None and within_cooldown and same_sig:
    #         # update existing incident (keep same ID)
    #         self._latest.affected_sats = list(affected_sats)
    #         self._latest.location = IncidentLocation(lat=float(lat), lon=float(lon))
    #         self._latest.radius_km = float(radius_km)
    #         self._latest.confidence = float(confidence)
    #         self._latest.engine_type = str(engine_type)
    #         self._latest.timestamp = now
    #         self._latest.provenance = prov

    #         self._last_emit_ts = now
    #         return self._latest, "jamming incident updated"

    #     # create new incident
    #     inc = Incident(
    #         incident_id=self._make_id(),
    #         type="JAMMING",
    #         affected_sats=list(affected_sats),
    #         location=IncidentLocation(lat=float(lat), lon=float(lon)),
    #         radius_km=float(radius_km),
    #         confidence=float(confidence),
    #         engine_type=str(engine_type),
    #         timestamp=now,
    #         provenance=prov,
    #     )
    #     self._latest = inc
    #     self._latest_sig = sig
    #     self._last_emit_ts = now
    #     return inc, "jamming incident created"
    def upsert_jamming_incident(
        self,
        affected_sats: List[str],
        lat: float,
        lon: float,
        radius_km: float,
        confidence: float,
        engine_type: str,
        provenance: Optional[Dict[str, Any]] = None,
        now_ts: Optional[float] = None,
    ) -> Tuple[Incident, str]:
        now = float(now_ts if now_ts is not None else time.time())
        sig = self._signature("JAMMING", float(lat), float(lon))

        within_cooldown = (now - float(self._last_emit_ts)) < float(self.cfg.cooldown_sec)

        prov: Dict[str, Any] = dict(provenance or {})
        prov.setdefault("engine", engine_type)
        prov.setdefault("correlation", {})
        prov["correlation"]["signature"] = sig
        prov["correlation"]["geo_bin_deg"] = float(self.cfg.geo_bin_deg)
        prov["correlation"]["cooldown_sec"] = float(self.cfg.cooldown_sec)

        # ✅ KEY CHANGE:
        # If we already have an incident and we are still in cooldown window,
        # ALWAYS update the same incident_id, even if signature (geo bin) changes a bit.
        if self._latest is not None and within_cooldown:
            self._latest.affected_sats = list(affected_sats)
            self._latest.location = IncidentLocation(lat=float(lat), lon=float(lon))
            self._latest.radius_km = float(radius_km)
            self._latest.confidence = float(confidence)
            self._latest.engine_type = str(engine_type)
            self._latest.timestamp = now
            self._latest.provenance = prov

            # keep tracking the newest signature for debugging/correlation
            self._latest_sig = sig
            self._last_emit_ts = now
            return self._latest, "jamming incident updated"

        # create new incident (either first time, or cooldown expired)
        inc = Incident(
            incident_id=self._make_id(),
            type="JAMMING",
            affected_sats=list(affected_sats),
            location=IncidentLocation(lat=float(lat), lon=float(lon)),
            radius_km=float(radius_km),
            confidence=float(confidence),
            engine_type=str(engine_type),
            timestamp=now,
            provenance=prov,
        )
        self._latest = inc
        self._latest_sig = sig
        self._last_emit_ts = now
        return inc, "jamming incident created"


    def to_latest_response(self, reason: str = "") -> LatestIncidentResponse:
        return LatestIncidentResponse(
            ok=True,
            has_incident=self._latest is not None,
            incident=self._latest,
            reason=reason,
        )
