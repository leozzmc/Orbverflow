// src/pages/FleetPage.tsx
import React from "react";
import { useAppStore } from "../store";
import { triggerScenario } from "../api";

export default function FleetPage() {
  const { dataset, fleet, mission } = useAppStore();
  const [busy, setBusy] = React.useState(false);

  async function run(scenario: string) {
    setBusy(true);
    try { await triggerScenario(scenario, 10); } finally { setBusy(false); }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Badge label="Dataset" value={dataset?.source_dataset_id ?? dataset?.dataset?.source_dataset_id ?? "unknown"} />
        <Badge label="Vendor" value={dataset?.source_vendor ?? dataset?.dataset?.source_vendor ?? "unknown"} />
        <Badge label="Mapping" value={dataset?.mapping_version ?? dataset?.dataset?.mapping_version ?? "unknown"} />

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button disabled={busy} onClick={() => run("JAMMING")}>Trigger JAMMING</button>
          <button disabled={busy} onClick={() => run("SATB_DOWN")}>Trigger SATB_DOWN</button>
          <button disabled={busy} onClick={() => run("SPOOFING")}>Trigger SPOOFING</button>
        </div>
      </div>

      <h3 style={{ marginTop: 16 }}>Fleet Overview</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {fleet.map((s) => (
          <div key={s.sat_id} style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>{s.sat_id}</div>
            <div>link_state: <b>{s.link_state}</b></div>
            <div>snr_db: {Number(s.snr_db).toFixed?.(1) ?? s.snr_db}</div>
            <div>loss: {Number(s.packet_loss_pct).toFixed?.(0) ?? s.packet_loss_pct}%</div>
            <div>pos: {fmtPos(s.position)}</div>
            <div>vendor: {s.source_vendor ?? "SIM"}</div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 16 }}>Mission Continuity (latest)</h3>
      <pre style={{ border: "1px solid #333", borderRadius: 10, padding: 12, overflow: "auto" }}>
        {mission ? JSON.stringify(mission, null, 2) : "No recommendation"}
      </pre>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid #333", borderRadius: 999, padding: "4px 10px" }}>
      <b>{label}:</b> {value}
    </div>
  );
}

function fmtPos(p: any) {
  if (!p) return "-";
  return `${Number(p.lat).toFixed(2)}, ${Number(p.lon).toFixed(2)}`;
}
