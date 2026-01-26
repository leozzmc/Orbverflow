
基本repo架構圖

```
Orbverflow/
├─ README.md
├─ docs/
│  ├─ HLD_v0.2.2.md
│  ├─ api_contract.md
│  └─ ...
├─ backend/
│  ├─ README.md
│  ├─ pyproject.toml            # (或 requirements.txt)
│  ├─ src/
│  │  ├─ orbverflow/
│  │  │  ├─ __init__.py
│  │  │  ├─ main.py             # FastAPI app entry
│  │  │  ├─ models.py           # Pydantic schema: TelemetryRecord, etc.
│  │  │  ├─ ws.py               # websocket hub / pubsub
│  │  │  ├─ simulator/
│  │  │  │  ├─ __init__.py
│  │  │  │  ├─ engine.py        # generate ticks + apply scenarios
│  │  │  │  ├─ scenarios.py     # NORMAL/JAMMING/SATB_DOWN/SPOOFING
│  │  │  │  └─ state.py         # per-sat state (pos, metrics, etc.)
│  │  │  └─ routes/
│  │  │     ├─ health.py
│  │  │     ├─ telemetry.py     # ws endpoint + optional http endpoints
│  │  │     └─ scenario.py      # trigger scenario endpoints
│  ├─ tests/
│  └─ .env.example
└─ frontend/ (先可不建，Issue-1 不需要)

```

## Telemetry Ingestion Service and State Store.

Features:
- In-memory time-window telemetry store (10 minutes per satellite).
- HTTP ingestion endpoint: POST /ingest/telemetry
- Query APIs:
  - GET /state/latest
  - GET /state/sat/{sat_id}?minutes=N
- Simulator batches are persisted automatically.
- Scenario injection (JAMMING) affects stored & queried telemetry and auto-reverts to NORMAL.

Verified via curl:
- /state/latest returns 5 satellites.
- /state/sat/SatB returns recent telemetry records.
- JAMMING scenario shows snr drop + packet loss spike, then recovers.

Example output
```
curl http://127.0.0.1:8000/state/latest | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2257  100  2257    0     0  1102k      0 --:--:-- --:--:-- --:--:-- 2204k
{
  "ok": true,
  "count": 5,
  "latest": {
    "SatA": {
      "timestamp": 1769412641.4754493,
      "sat_id": "SatA",
      "lat": 32.48000000000123,
      "lon": 165.90000000000822,
      "alt": 550,
      "snr_db": 17.297346551459356,
      "rssi_dbm": -70,
      "packet_loss_pct": 0.8630174434738136,
      "modem_reset_count": 0,
      "power_watt": null,
      "link_state": "OK",
      "spoofing": false,
      "provenance": {
        "source_vendor": "SIM",
        "source_dataset_id": "SIM_DEMO_2026_01",
        "source_file": "simulator",
        "source_fields": [
          "snr_db",
          "packet_loss_pct",
          "lat",
          "lon",
          "link_state"
        ]
      }
    },
    "SatB": {
      "timestamp": 1769412641.475535,
      "sat_id": "SatB",
      "lat": 32.68000000000116,
      "lon": 166.2000000000083,
      "alt": 550,
      "snr_db": 15.717999587043952,
      "rssi_dbm": -70,
      "packet_loss_pct": 2.905781022661099,
      "modem_reset_count": 0,
      "power_watt": null,
      "link_state": "OK",
      "spoofing": false,
      "provenance": {
        "source_vendor": "SIM",
        "source_dataset_id": "SIM_DEMO_2026_01",
        "source_file": "simulator",
        "source_fields": [
          "snr_db",
          "packet_loss_pct",
          "lat",
          "lon",
          "link_state"
        ]
      }
    },
    "SatC": {
      "timestamp": 1769412641.4755414,
      "sat_id": "SatC",
      "lat": 32.88000000000109,
      "lon": 166.50000000000838,
      "alt": 550,
      "snr_db": 14.165625677390967,
      "rssi_dbm": -70,
      "packet_loss_pct": 2.825360911325789,
      "modem_reset_count": 0,
      "power_watt": null,
      "link_state": "OK",
      "spoofing": false,
      "provenance": {
        "source_vendor": "SIM",
        "source_dataset_id": "SIM_DEMO_2026_01",
        "source_file": "simulator",
        "source_fields": [
          "snr_db",
          "packet_loss_pct",
          "lat",
          "lon",
          "link_state"
        ]
      }
    },
    "SatD": {
      "timestamp": 1769412641.475547,
      "sat_id": "SatD",
      "lat": 33.08000000000102,
      "lon": 166.80000000000848,
      "alt": 550,
      "snr_db": 12.313867318534276,
      "rssi_dbm": -70,
      "packet_loss_pct": 2.653880167559865,
      "modem_reset_count": 0,
      "power_watt": null,
      "link_state": "OK",
      "spoofing": false,
      "provenance": {
        "source_vendor": "SIM",
        "source_dataset_id": "SIM_DEMO_2026_01",
        "source_file": "simulator",
        "source_fields": [
          "snr_db",
          "packet_loss_pct",
          "lat",
          "lon",
          "link_state"
        ]
      }
    },
    "SatE": {
      "timestamp": 1769412641.4755518,
      "sat_id": "SatE",
      "lat": 33.280000000000946,
      "lon": 167.10000000000855,
      "alt": 550,
      "snr_db": 14.987816033499346,
      "rssi_dbm": -70,
      "packet_loss_pct": 1.1485748905837014,
      "modem_reset_count": 0,
      "power_watt": null,
      "link_state": "OK",
      "spoofing": false,
      "provenance": {
        "source_vendor": "SIM",
        "source_dataset_id": "SIM_DEMO_2026_01",
        "source_file": "simulator",
        "source_fields": [
          "snr_db",
          "packet_loss_pct",
          "lat",
          "lon",
          "link_state"
        ]
      }
    }
  }
}
```

```
"http://127.0.0.1:8000/state/sat/SatB?minutes=5"
{"ok":true,"sat_id":"SatB","minutes":5,"count":300,"records":[{"timestamp":1769412518.4056258,"sat_id":"SatB","lat":31.45000000000121,"lon":160.0500000000069,"alt":550.0,"snr_db":13.926087901892256,"rssi_dbm":-70.0,"packet_loss_pct":1.010697695965745,"modem_reset_count":0,"power_watt":null,"link_state":"OK","spoofing":false,"provenance":{"source_vendor":"SIM","source_dataset_id":"SIM_DEMO_2026_01","source_file":"simulator","source_fields":["snr_db","packet_loss_pct","lat","lon","link_state"]}},{"timestamp":1769412519.4065118,"sat_id":"SatB","lat":31.460000000001212,"lon":160.1000000000069,"alt":550.0,"snr_db":16.751649325504154,"rssi_dbm":-70.0,"packet_loss_pct":2.1469290706401525,"modem_reset_count":0,"power_watt":null,"link_state":"OK","spoofing":false,"provenance":{"source_vendor":"SIM","source_dataset_id":"SIM_DEMO_2026_01","source_file":"simulator","source_fields":["snr_db","packet_loss_pct","lat","lon","link_state"]}},{"timestamp":1769412520.4070203,"sat_id":"SatB","lat":31.470000000001214,"lon":160.1500000000069,"alt":550.0,"snr_db":17.452949087315822,"rssi_dbm":-70.0,"packet_loss_pct":0.8426308970622415,"modem_reset_count":0,"power_watt":null,"link_state":"OK","spoofing":false,"provenance":{"source_vendor":"SIM","source_dataset_id":"SIM_DEMO_2026_01","source_file":"simulator","source_fields":["snr_db","packet_loss_pct","lat","lon","link_state"]}},{"timestamp":1769412521.407445,"sat_id":"SatB","lat":31.48000000000121 ......
}}
```

## Airbus Data Pack Ingestion

# Airbus Data Pack Ingestion

Orbverflow supports loading external telemetry datasets (e.g. Airbus data packs) via a unified ingestion API with schema mapping and provenance tracking.

This enables vendor-agnostic fleet intelligence while preserving data lineage.

---

## Overview

**Data flow**

```
Airbus CSV / JSON pack
        ↓
Schema mapping (JSON)
        ↓
Canonical TelemetryRecord
        ↓
State Store + Provenance Registry
        ↓
Query / Analytics / UI
```

---

## Supported Formats

* `telemetry.json`
* `telemetry.csv`

Each pack directory may contain one or both files.

---

## Mapping File

Vendor-specific fields are mapped into the canonical schema using a JSON mapping file.

Example:

```json
{
  "satelliteId": "sat_id",
  "timestamp": "timestamp",
  "lat": "lat",
  "lon": "lon",
  "alt": "alt",
  "snr": "snr_db",
  "rssi": "rssi_dbm",
  "loss": "packet_loss_pct",
  "modemReset": "modem_reset_count",
  "linkState": "link_state"
}
```

---

## API Usage

### 1. Load Data Pack

```
POST /airbus/load
```

Example:

```bash
curl -X POST http://127.0.0.1:8000/airbus/load \
  -H "Content-Type: application/json" \
  -d '{
    "pack_dir": "tests/airbus_pack_demo",
    "mapping_path": "data/mapping_airbus_v0.1.json",
    "source_vendor": "AIRBUS",
    "source_dataset_id": "AIRBUS_PACK_2026_TW_01",
    "mapping_version": "v0.1",
    "meta_only": false
  }'
```

Response:

```json
{
  "ok": true,
  "ingested": 1,
  "files": ["telemetry.json"]
}
```

---

### 2. Register Dataset Metadata Only (optional)

If you want to register dataset metadata without ingesting telemetry:

```json
{
  "meta_only": true
}
```

---

### 3. Query Dataset Metadata

```
GET /meta/dataset
```

Example:

```bash
curl http://127.0.0.1:8000/meta/dataset
```

Response:

```json
{
  "ok": true,
  "has_dataset": true,
  "dataset": {
    "source_vendor": "AIRBUS",
    "source_dataset_id": "AIRBUS_PACK_2026_TW_01",
    "mapping_version": "v0.1",
    "files": ["telemetry.json"]
  }
}
```

---

### 4. Query Latest State

```
GET /state/latest
```

Each telemetry record contains provenance:

```json
"provenance": {
  "source_vendor": "AIRBUS",
  "source_dataset_id": "AIRBUS_PACK_2026_TW_01",
  "source_file": "telemetry.json",
  "source_fields": ["snr", "loss", "lat", "lon"],
  "mapping_version": "v0.1"
}
```

---

## Simulator vs Airbus Playback Mode

By default, Orbverflow runs the built-in telemetry simulator.

To disable the simulator and run in pure playback mode:

Create `.env`:

```env
DISABLE_SIM=1
```

Start server:

```bash
uvicorn src.orbverflow.main:app --reload
```

---

## Directory Structure Example

```
backend/
├── data/
│   └── mapping_airbus_v0.1.json
├── tests/
│   └── airbus_pack_demo/
│       └── telemetry.json
```

---

## Design Notes

* Canonical schema validated via Pydantic
* Provenance attached per record
* Dataset registry stored in-memory
* Redis optional for production deployment

---

## Demo Narrative (for judges)

* Vendor-agnostic ingestion
* Schema-mapped telemetry normalization
* Provenance-aware analytics
* Control-plane survivability under heterogeneous data sources


