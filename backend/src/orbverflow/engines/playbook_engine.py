import time
from typing import List
from orbverflow.playbook_models import Playbook, SafetyImpact
from orbverflow.playbook_store import PlaybookStore

class PlaybookEngine:

    def __init__(self, store: PlaybookStore):
        self.store = store
        self.counter = 0

    def _next_id(self) -> str:
        self.counter += 1
        return f"PB-{self.counter:02d}"

    def propose_for_incident(self, incident) -> List[Playbook]:
        playbooks = []

        # Playbook-04: Availability Degrade
        pb1 = self._build_availability_degrade(incident)
        playbooks.append(pb1)
        self.store.add(pb1)

        # Playbook-07: Mission Continuity
        pb2 = self._build_mission_continuity(incident)
        playbooks.append(pb2)
        self.store.add(pb2)

        return playbooks

    def approve(self, playbook_id: str) -> Playbook:
        pb = self.store.get(playbook_id)
        if not pb:
            raise ValueError("Playbook not found")

        pb.state = "APPROVED"
        self.store.update(pb)
        return pb

    # Playbook-4
    def _build_availability_degrade(self, incident) -> Playbook:
        return Playbook(
            id=self._next_id(),
            name="Availability Degrade (Jamming)",
            incident_id=incident.incident_id,
            actions=[
                "enable_out_of_band_relay",
                "prioritize_telemetry",
                "reduce_payload_tx"
            ],
            safety_impact=SafetyImpact(
                fuel="low",
                attitude="low",
                thermal="low",
                power_pct=10,
                mission="payload_degraded",
                risk_level="medium"
            ),
            command_snippets=[
                "SET LINK_MODE DEGRADED",
                "ENABLE OOB_RELAY",
                "SET PAYLOAD_TX LOW"
            ],
            state="PROPOSED",
            created_at=time.time()
        )

    # Playbook-7
    def _build_mission_continuity(self, incident) -> Playbook:
        return Playbook(
            id=self._next_id(),
            name="Mission Continuity / Task Reassignment",
            incident_id=incident.incident_id,
            actions=[
                "replicate_mission_state",
                "select_backup_satellite",
                "schedule_task_switch"
            ],
            safety_impact=SafetyImpact(
                fuel="medium",
                attitude="medium",
                thermal="low",
                power_pct=15,
                mission="partial_interruption",
                risk_level="medium"
            ),
            command_snippets=[
                "EXPORT MISSION_STATE SIGNED",
                "SELECT BACKUP_SAT AUTO",
                "SCHEDULE TASK_WINDOW"
            ],
            state="PROPOSED",
            created_at=time.time()
        )
