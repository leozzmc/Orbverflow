from orbverflow.ws import WebSocketHub
from orbverflow.simulator.engine import SimulatorEngine
from orbverflow.state_store import TelemetryStateStore
from orbverflow.provenance_registry import ProvenanceRegistry

hub = WebSocketHub()
engine = SimulatorEngine()

store = TelemetryStateStore(window_seconds=600)  # 10 min
prov_registry = ProvenanceRegistry()