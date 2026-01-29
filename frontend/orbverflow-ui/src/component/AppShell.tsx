// frontend/src/components/AppShell.tsx
import React from "react";
import { useAppStore } from "../store";
import { triggerScenario } from "../api";
import { Badges } from "./Badges";

export function AppShell({
  active,
  onNavigate,
  children,
}: {
  active: "Fleet" | "Incidents" | "Playbooks" | "Audit";
  onNavigate: (x: any) => void;
  children: React.ReactNode;
}) {
  const { datasetMeta, scenario } = useAppStore();
  const [busy, setBusy] = React.useState(false);

  async function run(s: string) {
    setBusy(true);
    try {
      await triggerScenario(s, 10);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Top bar */}
        <div style={styles.topRow}>
          <div style={styles.title}>Orbverflow Demo Dashboard</div>

          <div style={styles.tabs}>
            <Tab label="Fleet" active={active === "Fleet"} onClick={() => onNavigate("Fleet")} />
            <Tab label="Incidents" active={active === "Incidents"} onClick={() => onNavigate("Incidents")} />
            <Tab label="Playbooks" active={active === "Playbooks"} onClick={() => onNavigate("Playbooks")} />
            <Tab label="Audit" active={active === "Audit"} onClick={() => onNavigate("Audit")} />
          </div>
        </div>

        {/* Badge + triggers */}
        <div style={styles.headerRow}>
          <Badges datasetMeta={datasetMeta} />

          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button disabled={busy} onClick={() => run("JAMMING")} style={styles.btn}>
              Trigger JAMMING
            </button>
            <button disabled={busy} onClick={() => run("SATB_DOWN")} style={styles.btn}>
              Trigger SATB_DOWN
            </button>
            <button disabled={busy} onClick={() => run("SPOOFING")} style={styles.btn}>
              Trigger SPOOFING
            </button>
          </div>
        </div>

        {/* Scenario banner */}
        <div style={styles.banner}>
          <b>Scenario:</b> {scenario}
        </div>

        {/* Content */}
        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ ...styles.tab, ...(active ? styles.tabActive : {}) }}>
      {label}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(30,30,30,1) 100%)",
    color: "white",
  },
  container: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "16px 18px 26px",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: 0.2,
  },
  tabs: { display: "flex", gap: 10 },
  tab: {
    padding: "6px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    cursor: "pointer",
  },
  tabActive: {
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(255,255,255,0.08)",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  btn: {
    padding: "8px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "white",
    cursor: "pointer",
  },
  banner: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0, 120, 80, 0.15)",
  },
  content: { marginTop: 16 },
};
