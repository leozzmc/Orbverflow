from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Scenario(str, Enum):
    NORMAL = "NORMAL"
    JAMMING = "JAMMING"
    SATB_DOWN = "SATB_DOWN"
    SPOOFING = "SPOOFING"


class Provenance(BaseModel):
    source_vendor: str = "SIM"
    source_dataset_id: str = "SIM_DEMO"
    source_file: str = "simulator"
    source_fields: List[str] = Field(default_factory=list)
    mapping_version: Optional[str] = None


class TelemetryRecord(BaseModel):
    timestamp: float
    sat_id: str
    lat: float
    lon: float
    alt: float

    snr_db: float
    rssi_dbm: float
    packet_loss_pct: float
    modem_reset_count: int = 0
    power_watt: Optional[float] = None

    link_state: str  # OK / DEGRADED / DOWN
    spoofing: bool = False

    provenance: Provenance = Field(default_factory=Provenance)


class TelemetryBatch(BaseModel):
    scenario: Scenario
    tick: int
    records: List[TelemetryRecord]
