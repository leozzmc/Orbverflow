from dataclasses import dataclass

@dataclass
class SatelliteState:
    sat_id: str
    lat: float
    lon: float
    alt: float = 550.0

    snr_db: float = 15.0
    rssi_dbm: float = -70.0
    packet_loss_pct: float = 0.5
    modem_reset_count: int = 0
    link_state: str = "OK"
    spoofing_flag: bool = False

    def move(self):
        # 簡單線性漂移（假裝在台灣上空飛）
        self.lon += 0.05
        self.lat += 0.01
