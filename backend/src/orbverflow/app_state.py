from orbverflow.ws import WebSocketHub
from orbverflow.simulator.engine import SimulatorEngine
from orbverflow.state_store import TelemetryStateStore
from orbverflow.provenance_registry import ProvenanceRegistry
from orbverflow.engines.cluster_engine import ClusterEngine, ClusterConfig

hub = WebSocketHub()
engine = SimulatorEngine()

store = TelemetryStateStore(window_seconds=600)  # 10 min
prov_registry = ProvenanceRegistry()
cluster_engine = ClusterEngine(
    ClusterConfig(
        distance_km_max=1500.0,
        cluster_intensity_threshold=0.55,
        suspicious_threshold=0.35,
        confirmed_threshold=0.55,
        high_conf_threshold=0.75,
        snr_ok_floor=12.0,
    )
)