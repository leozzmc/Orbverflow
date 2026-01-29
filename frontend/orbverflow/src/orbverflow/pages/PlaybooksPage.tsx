import React, { useState } from 'react';
import { useAppStore } from '../store';
import { approvePlaybook } from '../api';
import { ChevronRight, ChevronDown } from 'lucide-react';
function Collapse({
  title,
  children



}: {title: string;children: React.ReactNode;}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 text-sm text-gray-300 transition-colors w-full text-left">

        {open ?
        <ChevronDown size={14} className="mr-2" /> :

        <ChevronRight size={14} className="mr-2" />
        }
        {title}
      </button>

      {open && <div className="mt-2">{children}</div>}
    </div>);

}
export default function PlaybooksPage() {
  const { playbooks, approvedPlaybooks } = useAppStore();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  async function approve(id: string) {
    setErr(null);
    setBusyId(id);
    try {
      await approvePlaybook(id);
      // UI update should come from WS playbook_approved event
    } catch (e: any) {
      setErr(`approve failed: ${String(e?.message ?? e)}`);
    } finally {
      setBusyId(null);
    }
  }
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-medium tracking-tight mb-4 text-white">
        Playbooks
      </h2>

      {err &&
      <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm font-mono">
          {err}
        </div>
      }

      <h3 className="text-lg font-medium text-gray-300 mt-6 mb-3">Proposed</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
        {playbooks.length === 0 &&
        <div className="text-gray-500 italic col-span-full">
            No proposed playbooks available
          </div>
        }

        {playbooks.map((pb: any) =>
        <div
          key={pb.id}
          className="rounded-xl p-5 bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm flex flex-col gap-3 hover:border-gray-700 transition-colors">

            <div>
              <div className="text-base font-bold text-white flex items-center justify-between">
                <span>{pb.id}</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {pb.state ?? 'PROPOSED'}
                </span>
              </div>
              <div className="text-sm text-gray-400 mt-1">{pb.name}</div>
            </div>

            <div>
              <b className="text-xs uppercase text-gray-500 tracking-wider">
                Actions
              </b>
              <pre className="mt-2 p-3 rounded-lg bg-black/40 border border-gray-800 text-xs text-gray-300 font-mono overflow-auto max-h-[150px]">
                {JSON.stringify(pb.actions ?? [], null, 2)}
              </pre>
            </div>

            {pb.safety_impact &&
          <div>
                <b className="text-xs uppercase text-gray-500 tracking-wider">
                  Safety Impact
                </b>
                <pre className="mt-2 p-3 rounded-lg bg-black/40 border border-gray-800 text-xs text-gray-300 font-mono overflow-auto max-h-[150px]">
                  {JSON.stringify(pb.safety_impact, null, 2)}
                </pre>
              </div>
          }

            {pb.command_snippets &&
          <Collapse title="Command Snippets">
                <pre className="p-3 rounded-lg bg-black/40 border border-gray-800 text-xs text-gray-300 font-mono overflow-auto max-h-[150px]">
                  {JSON.stringify(pb.command_snippets, null, 2)}
                </pre>
              </Collapse>
          }

            <div className="mt-auto pt-2">
              <button
              disabled={busyId === pb.id}
              onClick={() => approve(pb.id)}
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200
                  ${busyId === pb.id ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40'}`}>

                {busyId === pb.id ? 'Approving...' : 'Approve Playbook'}
              </button>
            </div>
          </div>
        )}
      </div>

      <h3 className="text-lg font-medium text-gray-300 mt-8 mb-3">
        Approved (Recent)
      </h3>
      <div className="rounded-xl bg-gray-900/30 border border-gray-800/30 p-4">
        {approvedPlaybooks.length === 0 ?
        <div className="text-gray-500 italic">No approved playbooks yet</div> :

        <ul className="space-y-2">
            {approvedPlaybooks.map((x: any) =>
          <li
            key={x.id}
            className="flex items-center text-sm text-gray-300">

                <span className="w-2 h-2 rounded-full bg-green-500 mr-3"></span>
                <b className="mr-2 text-white">{x.id}</b>
                <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400 border border-green-500/20 mr-2">
                  {x.state}
                </span>
                <span className="text-gray-500">
                  delivery: {x.delivery_status}
                </span>
              </li>
          )}
          </ul>
        }
      </div>
    </div>);

}