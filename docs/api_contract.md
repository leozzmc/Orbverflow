# Orbverflow – API Contract (Hackathon Demo)

Version: v0.2.2

---

## 1. Transport

- REST: HTTP JSON
- Realtime: WebSocket
- Encoding: UTF-8 JSON


## 2. Canonical Data Models

### TelemetryRecord

```json
{
  "timestamp": "2026-01-30T10:00:00Z",
  "sat_id": "SatA",
  "position": { "lat": 23.5, "lon": 121.0, "alt": 550 },
  "metrics": {
    "snr_db": 12.3,
    "rssi_dbm": -95,
    "packet_loss_pct": 80,
    "modem_reset_count": 1,
    "power_watt": 45
  },
  "link_state": "DEGRADED",
  "provenance": {
    "source_vendor": "AIRBUS",
    "source_dataset_id": "AIRBUS_PACK_2026_TW_01",
    "source_file": "telemetry.csv",
    "source_fields": ["snr", "loss"],
    "mapping_version": "v0.1"
  }
}
```

### MissionStateSummary

```json
{
  "timestamp": "...",
  "sat_id": "SatB",
  "mission_mode": "IMAGING",
  "queue_depth": 12,
  "cmd_seq_hash": "abc123",
  "time_window": ["10:00", "10:15"],
  "capability_tags": ["imaging", "relay"],
  "signature": "hmac_demo",
  "anti_replay": "seq-101",
  "provenance": { "...": "..." }
}

```

### Incident

```json
{
  "incident_id": "INC-001",
  "type": "JAMMING",
  "affected_sats": ["SatA","SatB","SatC"],
  "location": { "lat": 23.7, "lon": 121.2 },
  "radius_km": 500,
  "confidence": 0.87,
  "engine_type": "baseline",
  "provenance": { "...": "..." },
  "timestamp": "..."
}

```

## 3. REST API

### Dataset Metadata

`GET /meta/dataset`

Response:
```json
{
  "source_vendor": "AIRBUS",
  "source_dataset_id": "AIRBUS_PACK_2026_TW_01",
  "mapping_version": "v0.1",
  "files": ["telemetry.csv", "events.json"]
}
```

### Incident Detail

`GET /incidents/{incident_id}`

Response:
```json
{
  "incident": { ... },
  "provenance": { ... },
  "engine_type": "baseline"
}
```

### Playbook Approval

`POST /playbooks/{playbook_id}/approve`

```json
{
  "operator": "demo_user"
}
```

### Export Incident Report

`POST /reports/incidents/{incident_id}`

Response:
```json
{
  "report_id": "RPT-001",
  "format": "json",
  "download_url": "/reports/RPT-001.json"
}
```

## 4. WebSocket Events
Endpoint:

```
ws://backend/ws
```

### Fleet Snapshot (batched)
Event:
```json
{
  "type": "fleet_snapshot",
  "timestamp": "...",
  "satellites": [
    {
      "sat_id": "SatA",
      "link_state": "DEGRADED",
      "snr_db": 12,
      "packet_loss_pct": 80,
      "position": { "lat": 23.5, "lon": 121.0 },
      "source_vendor": "AIRBUS"
    }
  ]
}
```
Rate: every 500–1000 ms

### Incident Event
```json
{
  "type": "incident_created",
  "incident": { ... }
}
```
### Playbook Proposed

```json
{
  "type": "playbook_proposed",
  "playbook": {
    "id": "PB-04",
    "name": "Availability Degrade",
    "actions": ["oob_relay", "reduce_payload_tx"],
    "safety_impact": {
      "fuel": "low",
      "power": "10%",
      "mission": "degraded"
    }
  }
}
```

### Playbook Approved

```json
{
  "type": "playbook_approved",
  "playbook_id": "PB-04",
  "delivery_status": "SENT"
}
```

### Mission Continuity Event
```json
{
  "type": "mission_continuity_proposed",
  "failed_sat": "SatB",
  "candidates": ["SatA", "SatC"],
  "window": ["10:20","10:40"]
}
```

### Audit Event

```json
{
  "type": "audit_log",
  "hash": "abc123",
  "event": "PLAYBOOK_APPROVED",
  "dataset": "AIRBUS_PACK_2026_TW_01",
  "engine": "baseline"
}
```

## 5. Throttling Rules

| Stream          | Rate      |
| --------------- | --------- |
| Fleet snapshot  | 1–2 Hz    |
| Incident events | immediate |
| Playbooks       | immediate |
| Audit           | immediate |

## 6. Error Handling

- REST: standard HTTP status codes
- WebSocket:
    - `{ "type": "error", "message": "..." }`

## 7. Security (Demo-level)

- No auth (or static token)
- No encryption required locally
- HMAC signatures simulated only
- No command execution authority inside Orbverflow

> But will added authentication, authorization features (e.g. OAuth2, JWT, RBAC...etc) in real product 

