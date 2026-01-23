
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

📁 Issues-1

Commit 1 — skeleton + healthcheck
- 建 backend/ + FastAPI app
- GET /healthz 回 {ok:true}

Commit 2 — simulator engine（先不用 WS）

- 每秒生成 5 筆 telemetry（print log 或暫存 list）
- 支援 scenario state machine

Commit 3 — WebSocket + scenario trigger

- WS client 連上後，每秒收到 batch
- POST /scenario/trigger 可切換情境（含 duration 自動回 normal）

做到這裡，Issue-1 就可以關。