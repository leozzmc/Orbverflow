from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple

from orbverflow.models import TelemetryRecord, Provenance

def _parse_timestamp(v: Any) -> float:
    # already epoch
    if isinstance(v, (int, float)):
        return float(v)
    # ISO string
    if isinstance(v, str):
        # accept "2026-01-30T10:00:00Z" or "...+00:00"
        s = v.replace("Z", "+00:00")
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.timestamp()
    raise ValueError(f"Unsupported timestamp: {v!r}")

def _read_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def _read_csv_rows(path: str) -> List[Dict[str, Any]]:
    # 不強制 pandas，hackathon 最小依賴，用 csv module
    import csv
    rows: List[Dict[str, Any]] = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(dict(r))
    return rows

def _coerce_number(x: Any) -> Any:
    if x is None:
        return None
    if isinstance(x, (int, float)):
        return x
    if isinstance(x, str):
        s = x.strip()
        if s == "" or s.lower() == "null":
            return None
        # try int / float
        try:
            if "." in s:
                return float(s)
            return int(s)
        except ValueError:
            return x
    return x

def map_row_to_record(row: Dict[str, Any], mapping: Dict[str, str],
                      provenance_base: Provenance) -> Tuple[TelemetryRecord, List[str]]:
    """
    mapping example:
      {
        "satelliteId": "sat_id",
        "timestamp": "timestamp",
        "lat": "lat",
        "lon": "lon",
        "alt": "alt",
        "snr": "snr_db",
        "loss": "packet_loss_pct",
        "link": "link_state"
      }
    """
    out: Dict[str, Any] = {}
    used_fields: List[str] = []

    for src_field, dst_field in mapping.items():
        if src_field not in row:
            continue
        used_fields.append(src_field)
        out[dst_field] = _coerce_number(row[src_field])

    # required fields normalize
    if "timestamp" in out:
        out["timestamp"] = _parse_timestamp(out["timestamp"])

    # defaults if missing
    out.setdefault("rssi_dbm", -70.0)
    out.setdefault("modem_reset_count", 0)
    out.setdefault("power_watt", None)
    out.setdefault("spoofing", False)

    prov = provenance_base.model_copy(deep=True)
    prov.source_fields = used_fields

    out["provenance"] = prov
    rec = TelemetryRecord(**out)
    return rec, used_fields

def load_airbus_pack(
    pack_dir: str,
    mapping_path: str,
    source_vendor: str,
    source_dataset_id: str,
    mapping_version: str,
) -> Tuple[List[TelemetryRecord], List[str]]:
    """
    pack_dir: 資料包資料夾，裡面放 telemetry.csv 或 telemetry.json 等
    mapping_path: mapping_airbus_v0.1.json
    """
    mapping = _read_json(mapping_path)

    files = []
    records: List[TelemetryRecord] = []

    # demo：優先找 telemetry.csv，找不到就找 telemetry.json
    csv_path = os.path.join(pack_dir, "telemetry.csv")
    json_path = os.path.join(pack_dir, "telemetry.json")

    prov_base = Provenance(
        source_vendor=source_vendor,
        source_dataset_id=source_dataset_id,
        source_file="",
        source_fields=[],
        mapping_version=mapping_version,
    )

    if os.path.exists(csv_path):
        files.append("telemetry.csv")
        prov_base.source_file = "telemetry.csv"
        rows = _read_csv_rows(csv_path)
        for row in rows:
            rec, _ = map_row_to_record(row, mapping, prov_base)
            records.append(rec)

    elif os.path.exists(json_path):
        files.append("telemetry.json")
        prov_base.source_file = "telemetry.json"
        data = _read_json(json_path)
        # 允許 list[dict] 或 {"records":[...]}
        rows = data["records"] if isinstance(data, dict) and "records" in data else data
        for row in rows:
            rec, _ = map_row_to_record(row, mapping, prov_base)
            records.append(rec)

    else:
        raise FileNotFoundError("No telemetry.csv or telemetry.json found in pack_dir")

    return records, files
