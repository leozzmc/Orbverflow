# Orbverflow – Technical Stack (Hackathon Edition)

Version: v0.2.2  
Scope: ActInSpace 2026 Demo (Airbus-ready, single-developer optimized)

---

## 1. Design Principles

- Demo-first, end-to-end functional
- Deterministic & explainable (rule-based baseline)
- Airbus-proof (schema mapping + provenance)
- Human-in-the-loop
- Control plane ≠ data plane
- In-memory first (low ops overhead)

---

## 2. System Layer Mapping

### 2.1 Satellite Layer (Simulator / Agent / Playback)

#### Telemetry Simulator
- Language: Python 3.11+
- Libraries:
  - numpy (noise & trends)
  - pydantic (schema validation)
  - typer (CLI scenario control)

#### Position & Orbit (Demo strategy)
- Linear kinematic mock:
  - lat += v_lat * dt
  - lon += v_lon * dt
- Distance constraint:
  - `distance(satA, satB) < 1500km` required for:
    - cluster grouping
    - ISL / out-of-band logical link
- Optional libs:
  - geopy (distance)
  - skyfield / sgp4 (optional, not required)

#### Onboard Agent (logical)
- Implemented as simulator module
- Responsibilities:
  - generate telemetry
  - generate mission state summary
  - receive playbook delivery events
  - publish via HTTP/WebSocket

#### Airbus Playback Mode
- pandas (CSV)
- json (JSON logs)
- mapping json → canonical schema

#### Out-of-band Channel (simulated)
- Logical flags:
  - oob_available
  - delivery_status: PENDING / SENT / ACKED

---

### 2.2 Fleet Intelligence Layer (Orbverflow Core)

#### API / Ingestion
- FastAPI
- REST + WebSocket

#### State Store
- In-memory:
  - dict for latest states
  - deque for last 5–10 minutes history
- Optional: Redis (not required for hackathon)

#### Airbus Integration Layer
- pandas
- pydantic
- mapping json files:
  - mapping_airbus_v0.1.json
  - mapping_sim_v0.1.json
- Provenance Registry:
  - in-memory dict or Redis hash

#### Analytics Engines (baseline)

| Engine | Implementation |
|--------|----------------|
| Cluster Suggestion | Rule-based + distance constraint |
| Consistency Check | Rule-based thresholds |
| Jamming Detection | packet_loss + SNR drop + multi-satellite |
| Triangulation | Weighted center + spread |
| Resiliency Score | Simple scoring formula |
| Playbook Engine | Python state machine |
| Continuity Orchestrator | Rule-based candidate selection |

Optional:
- scikit-learn (DBSCAN/KMeans)

#### Audit & Timeline
- in-memory event list
- hashlib.sha256 (hash chaining)

#### Reporting
- JSON incident report export (mandatory)
- PDF optional (not required)

---

### 2.3 Operator / UI Layer

#### Frontend
- React + Vite
- WebSocket client (native)

#### Visualization
- Charts: Recharts
- Map: Leaflet + react-leaflet

#### Required UI Components
- Dataset Badge
- Engine Badge
- Provenance Side Panel
- Fleet Overview
- Cluster View
- Incident & Triangulation View
- Playbooks & Approval
- Audit Log

---

## 3. Airbus-proof Data Integration Strategy

### Data Sources
- SIM telemetry
- Airbus pack telemetry/logs

### Schema Mapping
- Canonical schema via pydantic
- Mapping file example:

```json
{
  "snr": "metrics.snr_db",
  "loss": "metrics.packet_loss_pct",
  "satelliteId": "sat_id"
}
```

### Provenance Tracking Fields
- source_vendor
- source_dataset_id
- source_file
- source_fields
- mapping_version

## 4. Triangulation Strategy (Demo)

Backend:
- intensity = 0.7 * loss_norm + 0.3 * snr_drop_norm
- center = weighted average of positions
- radius = max distance from center
- confidence = affected_count + consistency_score
Frontend:
- draw circle(center, radius)
- show satellite markers
- confidence bar

No TDOA/FDOA required.

## 5. WebSocket Performance Strategy

- Simulator:
    - telemetry rate: 1–2 Hz

- Backend:
    -  batch fleet snapshot every 500–1000ms
    - incidents/playbooks pushed immediately

Avoid pushing raw telemetry to UI.

## 6. Recommended Final Stack Summary

| Area             | Technology                     |
| ---------------- | ------------------------------ |
| Simulator        | Python, typer, numpy, pydantic |
| Backend          | FastAPI, WebSocket             |
| Data Integration | pandas, pydantic               |
| Analytics        | rule-based Python              |
| Store            | in-memory                      |
| Audit            | hashlib                        |
| Frontend         | React + Vite                   |
| Charts           | Recharts                       |
| Map              | Leaflet                        |
| Report           | JSON                           |


## 7. Demo Narrative Keywords (for judges)

- Resilient Ingestion via schema mapping
- Deterministic security logic
- Human-centric playbooks
- Vendor-agnostic fleet intelligence
- Provenance-aware decision making
- Control-plane survivability

