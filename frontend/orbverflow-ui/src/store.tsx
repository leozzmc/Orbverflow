import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { connectWs } from "./ws";
import type { WsEvent } from "./ws";
import { getDatasetMeta, getIncidentsLatest, getMissionLatest, getAuditLatest } from "./api";

type AppState = {
  dataset: any | null;
  fleet: any[]; // satellites
  latestIncident: any | null;
  playbooks: any[];
  mission: any | null; // recommendation
  audit: any[];
};
type WsEvent = any;


const Ctx = createContext<{ state: AppState } | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDataset] = useState<any | null>(null);
  const [fleet, setFleet] = useState<any[]>([]);
  const [latestIncident, setLatestIncident] = useState<any | null>(null);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [mission, setMission] = useState<any | null>(null);
  const [audit, setAudit] = useState<any[]>([]);

  useEffect(() => {
    // bootstrap REST
    (async () => {
      try { setDataset(await getDatasetMeta()); } catch {}
      try {
        const x = await getIncidentsLatest();
        if (x?.has_incident) {
          setLatestIncident(x.incident);
          setPlaybooks(x.playbooks ?? []);
        }
      } catch {}
      try {
        const m = await getMissionLatest();
        if (m?.has_plan) setMission(m.recommendation);
      } catch {}
      try {
        const a = await getAuditLatest(50);
        setAudit(a?.events ?? []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const ws = connectWs((e: WsEvent) => {
      if (e?.type === "fleet_snapshot") {
        setFleet(e.satellites ?? []);
      }
      if (e?.type === "incident_created") {
        setLatestIncident(e.incident ?? null);
        // playbooks may come together depending on your backend event shape
        // if you include playbooks in incident_created event, parse them here
      }
      if (e?.type === "playbook_proposed") {
        setPlaybooks((prev) => {
          const next = [...prev];
          next.push(e.playbook);
          return next;
        });
      }
      if (e?.type === "playbook_approved") {
        setPlaybooks((prev) => prev.filter((p) => p.id !== e.playbook_id));
        alert("Action Approved by Operator");
      }
      if (e?.type === "mission_continuity_proposed") {
        // some backends send {type, plan} or {type, recommendation}
        setMission((e as any).recommendation ?? e);
      }
      if (e?.type === "audit_log") {
        setAudit((prev) => {
          const next = [...prev, e];
          return next.slice(-200);
        });
      }
    });

    return () => ws.close();
  }, []);

  const state = useMemo<AppState>(() => ({
    dataset, fleet, latestIncident, playbooks, mission, audit
  }), [dataset, fleet, latestIncident, playbooks, mission, audit]);

  return <Ctx.Provider value={{ state }}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppStore must be used within AppStoreProvider");
  return v.state;
}
