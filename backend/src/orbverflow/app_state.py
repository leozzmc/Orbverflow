from orbverflow.ws import WebSocketHub
from orbverflow.simulator.engine import SimulatorEngine
from orbverflow.state_store import TelemetryStateStore
from orbverflow.provenance_registry import ProvenanceRegistry
from orbverflow.engines.cluster_engine import ClusterEngine, ClusterConfig
from orbverflow.incident_store import IncidentStore, IncidentStoreConfig
from orbverflow.engines.jamming_engine import JammingEngine, JammingEngineConfig

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


# incident_store = IncidentStore()
# jamming_engine = JammingDetectionEngine(
#     JammingConfig(
#         distance_km=1500.0,
#         intensity_threshold=0.55,
#         snr_low=12.0,
#         loss_high=50.0,
#         min_members=2,
#         min_confidence_to_emit=0.55,
#     )
# )

incident_store = IncidentStore(IncidentStoreConfig(cooldown_sec=10.0))
jamming_engine = JammingEngine(
    cluster_engine=cluster_engine,
    incident_store=incident_store,
    prov_registry=prov_registry,
    cfg=JammingEngineConfig(min_affected_sats=2),
)