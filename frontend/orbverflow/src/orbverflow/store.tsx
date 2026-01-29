import React, {
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext } from
'react';
import { connectWs } from './ws';
import {
  getDatasetMeta,
  getIncidentsLatest,
  getMissionLatest,
  getAuditLatest,
  getTelemetryLatest,
  getPlaybooksLatest } from
'./api';
export type PlaybookState = 'PROPOSED' | 'APPROVED' | 'EXECUTED';
export type DatasetMeta = {
  source_vendor?: string;
  source_dataset_id?: string;
  mapping_version?: string | null;
  files?: string[];
};
export type AppState = {
  datasetMeta: DatasetMeta | null;
  scenario: string; // "NORMAL" | "JAMMING" | ...
  fleet: any[];
  latestIncident: any | null;
  playbooks: any[];
  approvedPlaybooks: any[];
  mission: any | null;
  audit: any[];
};
const Ctx = createContext<{
  state: AppState;
  actions: {
    toast: (m: string) => void;
  };
} | null>(null);
export function AppStoreProvider({ children }: {children: React.ReactNode;}) {
  const [datasetMeta, setDatasetMeta] = useState<DatasetMeta | null>(null);
  const [scenario, setScenario] = useState<string>('UNKNOWN');
  const [fleet, setFleet] = useState<any[]>([]);
  const [latestIncident, setLatestIncident] = useState<any | null>(null);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [approvedPlaybooks, setApprovedPlaybooks] = useState<any[]>([]);
  const [mission, setMission] = useState<any | null>(null);
  const [audit, setAudit] = useState<any[]>([]);
  // lightweight toast bus (FleetPage will render the UI)
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  function toast(message: string) {
    setToastMsg(message);
    window.setTimeout(
      () => setToastMsg((cur) => cur === message ? null : cur),
      1800
    );
  }
  useEffect(() => {
    // bootstrap REST (fallback)
    ;(async () => {
      // dataset meta
      try {
        const meta = await getDatasetMeta();
        if (meta?.has_dataset) {
          setDatasetMeta({
            source_vendor: meta.source_vendor,
            source_dataset_id: meta.source_dataset_id,
            mapping_version: meta.mapping_version,
            files: meta.files ?? []
          });
        }
      } catch {}
      // telemetry fallback (also a second chance to infer vendor/dataset)
      try {
        const t = await getTelemetryLatest();
        if (t?.scenario) setScenario(t.scenario);
        // infer dataset meta if /meta/dataset not ready
        const p = t?.records?.[0]?.provenance;
        if (!datasetMeta && p) {
          setDatasetMeta({
            source_vendor: p.source_vendor,
            source_dataset_id: p.source_dataset_id,
            mapping_version: p.mapping_version ?? null,
            files: p.source_file ? [p.source_file] : []
          });
        }
        if (Array.isArray(t?.records)) {
          setFleet(
            (t.records ?? []).map((r: any) => ({
              sat_id: r.sat_id,
              link_state: r.link_state,
              snr_db: r.snr_db,
              packet_loss_pct: r.packet_loss_pct,
              position: {
                lat: r.lat,
                lon: r.lon
              },
              source_vendor: r?.provenance?.source_vendor ?? 'SIM'
            }))
          );
        }
      } catch {}
      // incident + playbooks (older rest shape may include playbooks)
      try {
        const x = await getIncidentsLatest();
        if (x?.has_incident) {
          setLatestIncident(x.incident ?? null);
          if (Array.isArray(x.playbooks)) setPlaybooks(x.playbooks);
        }
      } catch {}
      // playbooks reload fallback
      try {
        const p = await getPlaybooksLatest(50);
        if (Array.isArray(p?.playbooks) && p.playbooks.length)
        setPlaybooks(p.playbooks);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const ws = connectWs((e: any) => {
      if (!e?.type) return;
      if (e.type === 'telemetry_batch') {
        if (e.scenario) setScenario(e.scenario);
      }
      if (e.type === 'fleet_snapshot') {
        setFleet(e.satellites ?? []);
        // infer dataset meta from live stream if missing
        const v = e?.satellites?.[0]?.source_vendor;
        if (!datasetMeta && v) {
          setDatasetMeta({
            source_vendor: v,
            source_dataset_id: 'UNKNOWN',
            mapping_version: null,
            files: []
          });
        }
      }
      if (e.type === 'incident_created') {
        setLatestIncident(e.incident ?? null);
        if (Array.isArray(e.playbooks)) setPlaybooks(e.playbooks);
      }
      if (e.type === 'playbook_proposed') {
        const pb = e.playbook;
        if (!pb?.id) return;
        setPlaybooks((prev) => {
          if (prev.some((x) => x.id === pb.id)) return prev;
          return [pb, ...prev];
        });
      }
      if (e.type === 'playbook_approved') {
        const pbId = e.playbook_id;
        setPlaybooks((prev) => prev.filter((p) => p.id !== pbId));
        setApprovedPlaybooks((prev) => {
          const rec = {
            id: pbId,
            state: 'APPROVED',
            delivery_status: e.delivery_status ?? 'SENT'
          };
          return [rec, ...prev].slice(0, 50);
        });
        toast(`✅ Approved ${pbId} (${e.delivery_status ?? 'SENT'})`);
      }
      if (e.type === 'mission_continuity_proposed') {
        setMission(e.recommendation ?? e);
      }
      if (e.type === 'audit_log') {
        setAudit((prev) => [...prev, e].slice(-200));
      }
      // Optional: if you later broadcast dataset meta event
      if (e.type === 'dataset_meta') {
        setDatasetMeta({
          source_vendor: e.source_vendor,
          source_dataset_id: e.source_dataset_id,
          mapping_version: e.mapping_version ?? null,
          files: e.files ?? []
        });
      }
    });
    return () => ws.close();
  }, [datasetMeta]);
  const state = useMemo<AppState>(
    () => ({
      datasetMeta,
      scenario,
      fleet,
      latestIncident,
      playbooks,
      approvedPlaybooks,
      mission,
      audit
    }),
    [
    datasetMeta,
    scenario,
    fleet,
    latestIncident,
    playbooks,
    approvedPlaybooks,
    mission,
    audit]

  );
  return (
    <Ctx.Provider
      value={{
        state,
        actions: {
          toast
        }
      }}>

      {/* inline toast render slot */}
      {toastMsg &&
      <div className="fixed right-4 bottom-4 z-[9999] px-4 py-3 rounded-xl border border-white/20 bg-black/70 backdrop-blur-md text-white max-w-md shadow-xl animate-fade-in">
          {toastMsg}
        </div>
      }
      {children}
    </Ctx.Provider>);

}
export function useAppStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppStore must be used within AppStoreProvider');
  return v.state;
}
export function useAppActions() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppActions must be used within AppStoreProvider');
  return v.actions;
}