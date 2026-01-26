from orbverflow.ws import WebSocketHub
from orbverflow.simulator.engine import SimulatorEngine
from orbverflow.state_store import TelemetryStateStore

hub = WebSocketHub()
engine = SimulatorEngine()

# issue-2 store
store = TelemetryStateStore(window_seconds=600)  # 10 min