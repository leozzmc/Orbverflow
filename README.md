# Orbverflow (Demo)
**Distributed Space Network Defense Platform**  
Fleet-level cooperative detection + resilience playbooks for satellite constellations.

> Upgrade satellite defense from **standalone mode** to **cooperative mode** — with **Human-in-the-loop** and **Non-intrusive** integration to existing Mission Control Systems (MCS).

<img width="1442" height="890" alt="image" src="https://github.com/user-attachments/assets/91df374a-c193-473e-a1da-3ef3d8df5519" />


---

## What this demo shows

This repository contains a demo prototype for **Orbverflow**, focusing on:

- Fleet dashboard (satellite map + health)
- Dynamic **cluster view** (multi-satellite correlation)
- **Spatial consistency check** (anomaly correlation)
- Optional **threat triangulation** (conceptual module)
- **Playbook recommendations** (YAML DSL)
- Approval workflow (Human-in-the-loop)
- MCS integration stub (no direct satellite control)
- Resiliency Score (0–100)

**Goal:** Demonstrate how a constellation can remain operational under **wideband jamming / link degradation** conditions via **network-level resilience**.

---

## Product positioning (one-liner)

**Orbverflow is a Fleet Security Intelligence + Mission Resilience Orchestration Layer for space networks.**

Not:
- an anti-jam hardware module
- an RF signal processing product
- a satellite controller

Yes:
- a **fleet-level** decision platform that correlates multi-satellite telemetry and produces **auditable playbooks**.

---

## Architecture

### High-level (3 layers)

```mermaid
graph TB

subgraph Space_Segment["Satellite Layer"]
    SatA[Satellite A]
    SatB[Satellite B]
    SatC[Satellite C]

    AgentA[Security Agent]
    AgentB[Security Agent]
    AgentC[Security Agent]

    SatA --> AgentA
    SatB --> AgentB
    SatC --> AgentC

    SatA -. Optical ISL .-> SatB
    SatB -. Optical ISL .-> SatC
end

subgraph Fleet_Layer["Orbverflow Fleet Intelligence Layer"]
    Adapter[Data Adapter Layer]
    Ingest[Telemetry Ingestion]
    Anomaly[Link Anomaly Detection]
    Cluster[Cluster Engine]
    Triangulation[Threat Triangulation]
    Impact[Mission Impact Model]
    Playbook[Playbook Engine]
    Score[Resiliency Score Engine]
end

subgraph Ground_Layer["Mission Control / Operator"]
    Dashboard[Security Dashboard]
    Approval[Human Approval]
    MCS[Mission Control System]
end

AgentA --> Adapter
AgentB --> Adapter
AgentC --> Adapter

Adapter --> Ingest --> Anomaly --> Cluster --> Triangulation --> Impact --> Playbook --> Dashboard

Dashboard --> Approval --> MCS

Score --> Dashboard
```
