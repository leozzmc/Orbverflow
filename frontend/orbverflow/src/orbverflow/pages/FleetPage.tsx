import React from 'react';
import { useAppStore } from '../store';
import { IncidentMap } from '../components/IncidentMap';
export default function FleetPage() {
  const { fleet, latestIncident } = useAppStore();
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-medium tracking-tight mb-4 text-white">
        Fleet Overview
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
        <div className="rounded-xl overflow-hidden border border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
          <IncidentMap
            satellites={fleet}
            incident={latestIncident}
            height={560} />

        </div>

        <div className="grid grid-cols-1 gap-3">
          {fleet.map((s: any) =>
          <SatCard key={s.sat_id} s={s} />
          )}
        </div>
      </div>
    </div>);

}
function SatCard({ s }: {s: any;}) {
  const state = String(s.link_state ?? 'UNKNOWN');
  let dotColor = 'bg-gray-400';
  if (state === 'OK')
  dotColor = 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]';else
  if (state === 'DEGRADED')
  dotColor = 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]';else
  if (state === 'DOWN')
  dotColor = 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]';
  return (
    <div className="rounded-xl p-4 bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm hover:bg-gray-800/60 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="text-base font-bold text-white">{s.sat_id}</div>
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm font-mono opacity-90">
          <span className="text-gray-400">link_state</span>
          <b className="text-gray-200">{state}</b>
        </div>
        <div className="flex justify-between text-sm font-mono opacity-90">
          <span className="text-gray-400">snr_db</span>
          <b className="text-gray-200">{fmt1(s.snr_db)}</b>
        </div>
        <div className="flex justify-between text-sm font-mono opacity-90">
          <span className="text-gray-400">loss</span>
          <b className="text-gray-200">{fmt0(s.packet_loss_pct)}%</b>
        </div>
        <div className="flex justify-between text-sm font-mono opacity-90">
          <span className="text-gray-400">pos</span>
          <b className="text-gray-200">{fmtPos(s.position)}</b>
        </div>
        <div className="flex justify-between text-sm font-mono opacity-90">
          <span className="text-gray-400">vendor</span>
          <b className="text-gray-200">{s.source_vendor ?? 'SIM'}</b>
        </div>
      </div>
    </div>);

}
function fmt1(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n.toFixed(1) : String(x ?? '-');
}
function fmt0(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n.toFixed(0) : String(x ?? '-');
}
function fmtPos(p: any) {
  if (!p) return '-';
  return `${Number(p.lat).toFixed(2)}, ${Number(p.lon).toFixed(2)}`;
}