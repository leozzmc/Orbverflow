// src/App.tsx
import React from "react";
import { AppStoreProvider } from "./store";
import FleetPage from "./pages/FleetPage";
import IncidentsPage from "./pages/IncidentsPage";
import PlaybooksPage from "./pages/PlaybooksPage";
import AuditPage from "./pages/AuditPage";

export default function App() {
  const [tab, setTab] = React.useState<"fleet" | "incidents" | "playbooks" | "audit">("fleet");

  return (
    <AppStoreProvider>
      <div style={{ padding: 16, fontFamily: "system-ui" }}>
        <Header tab={tab} setTab={setTab} />
        <div style={{ marginTop: 16 }}>
          {tab === "fleet" && <FleetPage />}
          {tab === "incidents" && <IncidentsPage />}
          {tab === "playbooks" && <PlaybooksPage />}
          {tab === "audit" && <AuditPage />}
        </div>
      </div>
    </AppStoreProvider>
  );
}

function Header({ tab, setTab }: any) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ fontWeight: 700, fontSize: 18 }}>Orbverflow Demo Dashboard</div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <Btn active={tab === "fleet"} onClick={() => setTab("fleet")}>Fleet</Btn>
        <Btn active={tab === "incidents"} onClick={() => setTab("incidents")}>Incidents</Btn>
        <Btn active={tab === "playbooks"} onClick={() => setTab("playbooks")}>Playbooks</Btn>
        <Btn active={tab === "audit"} onClick={() => setTab("audit")}>Audit</Btn>
      </div>
    </div>
  );
}

function Btn({ active, ...props }: any) {
  return (
    <button
      {...props}
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid #444",
        background: active ? "#444" : "transparent",
        color: active ? "white" : "inherit",
        cursor: "pointer",
      }}
    />
  );
}
