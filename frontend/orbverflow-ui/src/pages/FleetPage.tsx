// frontend/src/pages/FleetPage.tsx
import React from "react";
import { useAppStore } from "../store";
import IncidentMap from "../component/IncidentMap";



export default function FleetPage() {
  const { fleet, latestIncident } = useAppStore();

  return (
    <div>
      <h2 style={{ margin: "6px 0 14px" }}>Fleet Overview</h2>

      <div style={styles.grid}>
        <div style={styles.mapPanel}>
          <IncidentMap satellites={fleet} incident={latestIncident} height={560} />
        </div>

        <div style={styles.cards}>
          {fleet.map((s: any) => (
            <SatCard key={s.sat_id} s={s} />
          ))}
        </div>
      </div>
      
    </div>
  );
}

function SatCard({ s }: { s: any }) {
  const state = String(s.link_state ?? "UNKNOWN");
  const dot =
    state === "OK" ? "rgba(80,220,140,0.95)" :
    state === "DEGRADED" ? "rgba(255,200,90,0.95)" :
    state === "DOWN" ? "rgba(255,90,90,0.95)" :
    "rgba(200,200,200,0.7)";

  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{s.sat_id}</div>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: dot }} />
      </div>

      <div style={styles.kv}><span>link_state</span><b>{state}</b></div>
      <div style={styles.kv}><span>snr_db</span><b>{fmt1(s.snr_db)}</b></div>
      <div style={styles.kv}><span>loss</span><b>{fmt0(s.packet_loss_pct)}%</b></div>
      <div style={styles.kv}><span>pos</span><b>{fmtPos(s.position)}</b></div>
      <div style={styles.kv}><span>vendor</span><b>{s.source_vendor ?? "SIM"}</b></div>
    </div>
  );
}

function fmt1(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n.toFixed(1) : String(x ?? "-");
}
function fmt0(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n.toFixed(0) : String(x ?? "-");
}
function fmtPos(p: any) {
  if (!p) return "-";
  return `${Number(p.lat).toFixed(2)}, ${Number(p.lon).toFixed(2)}`;
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 16,
    alignItems: "start",
  },
  mapPanel: {
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  kv: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    opacity: 0.95,
  },
};

