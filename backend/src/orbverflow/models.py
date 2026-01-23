from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

class Provenance(BaseModel):
    source_vendor: str
    source_dataset_id: str
    source_file: str
    source_fields: List[str]

class TelemetryRecord(BaseModel):
    timestamp: datetime
    sat_id: str
    lat: float
    lon: float
    alt: float

    snr_db: float
    rssi_dbm: float
    packet_loss_pct: float
    modem_reset_count: int
    link_state: str

    spoofing_flag: bool = False
    provenance: Provenance
