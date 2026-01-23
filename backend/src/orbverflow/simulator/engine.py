import asyncio
import random
from datetime import datetime
from typing import Dict, List

from orbverflow.simulator.state import SatelliteState
from orbverflow.simulator.scenarios import Scenario
from orbverflow.models import TelemetryRecord, Provenance


class SimulatorEngine:
    def __init__(self):
        self.satellites: Dict[str, SatelliteState] = {}
        self.current_scenario = Scenario.NORMAL
        self.scenario_end_time: float | None = None

        self._init_sats()

    def _init_sats(self):
        base_lat = 23.5
        base_lon = 121.0

        for i, sat_id in enumerate(["SatA", "SatB", "SatC", "SatD", "SatE"]):
            self.satellites[sat_id] = SatelliteState(
                sat_id=sat_id,
                lat=base_lat + i * 0.2,
                lon=base_lon + i * 0.3,
            )

    def trigger_scenario(self, scenario: Scenario, duration_sec: int = 30):
        print(f"[Simulator] Scenario triggered: {scenario}")
        self.current_scenario = scenario
        self.scenario_end_time = asyncio.get_event_loop().time() + duration_sec

    def _apply_scenario(self, sat: SatelliteState):
        # reset
        sat.spoofing_flag = False

        if self.current_scenario == Scenario.NORMAL:
            sat.packet_loss_pct = random.uniform(0, 3)
            sat.snr_db = random.uniform(12, 18)
            sat.link_state = "OK"

        elif self.current_scenario == Scenario.JAMMING:
            sat.packet_loss_pct = random.uniform(40, 90)
            sat.snr_db = random.uniform(0, 8)
            sat.link_state = "DEGRADED"

        elif self.current_scenario == Scenario.SATB_DOWN:
            if sat.sat_id == "SatB":
                sat.packet_loss_pct = 100.0
                sat.snr_db = -20.0
                sat.link_state = "DOWN"
            else:
                sat.packet_loss_pct = random.uniform(0, 3)
                sat.snr_db = random.uniform(12, 18)
                sat.link_state = "OK"

        elif self.current_scenario == Scenario.SPOOFING:
            sat.packet_loss_pct = random.uniform(0, 5)
            sat.snr_db = random.uniform(10, 16)
            sat.link_state = "OK"
            if sat.sat_id == "SatC":
                sat.spoofing_flag = True

    def _check_scenario_timeout(self):
        if self.scenario_end_time is None:
            return

        if asyncio.get_event_loop().time() > self.scenario_end_time:
            print("[Simulator] Scenario ended, reverting to NORMAL")
            self.current_scenario = Scenario.NORMAL
            self.scenario_end_time = None

    def generate_batch(self) -> List[TelemetryRecord]:
        self._check_scenario_timeout()

        records: List[TelemetryRecord] = []

        for sat in self.satellites.values():
            sat.move()
            self._apply_scenario(sat)

            record = TelemetryRecord(
                timestamp=datetime.utcnow(),
                sat_id=sat.sat_id,
                lat=sat.lat,
                lon=sat.lon,
                alt=sat.alt,
                snr_db=sat.snr_db,
                rssi_dbm=sat.rssi_dbm,
                packet_loss_pct=sat.packet_loss_pct,
                modem_reset_count=sat.modem_reset_count,
                link_state=sat.link_state,
                spoofing_flag=sat.spoofing_flag,
                provenance=Provenance(
                    source_vendor="SIM",
                    source_dataset_id="SIM_DEMO_2026_01",
                    source_file="simulator",
                    source_fields=[
                        "snr_db",
                        "packet_loss_pct",
                        "lat",
                        "lon",
                        "link_state",
                    ],
                ),
            )

            records.append(record)

        return records

    async def run_console_demo(self):
        while True:
            batch = self.generate_batch()
            print("=" * 60)
            for r in batch:
                print(
                    f"{r.sat_id:4} | loss={r.packet_loss_pct:5.1f}% | snr={r.snr_db:5.1f} | {r.link_state} | spoof={r.spoofing_flag}"
                )
            await asyncio.sleep(1)
