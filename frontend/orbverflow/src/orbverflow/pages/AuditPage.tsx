import React, { useState } from 'react';
import { useAppStore } from '../store';
function shortHash(h?: string) {
  if (!h) return '-';
  return h.slice(0, 8);
}
export default function AuditPage() {
  const { audit } = useAppStore();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const items = [...audit].reverse(); // time desc (latest first)
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-medium tracking-tight mb-4 text-white">
        Audit Log
      </h2>

      <div className="rounded-xl p-4 bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm">
        {items.length === 0 ?
        <div className="text-gray-500 italic text-center py-8">
            No audit events recorded
          </div> :

        <div className="flex flex-col gap-3">
            {items.map((e: any, idx: number) =>
          <div
            key={idx}
            className="rounded-xl p-4 bg-black/20 border border-gray-800/50 hover:bg-black/30 transition-colors">

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="font-bold text-white text-base mb-1">
                      {e.event ?? e.type ?? 'EVENT'}
                    </div>
                    <div className="text-sm text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>
                        dataset:{' '}
                        <span className="text-gray-300">
                          {e.dataset ?? '-'}
                        </span>
                      </span>
                      <span className="text-gray-600">|</span>
                      <span>
                        engine:{' '}
                        <span className="text-gray-300">{e.engine ?? '-'}</span>
                      </span>
                      <span className="text-gray-600">|</span>
                      <span>
                        hash:{' '}
                        <span className="font-mono text-gray-300">
                          {shortHash(e.hash)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 transition-colors border border-gray-700 whitespace-nowrap">

                    {openIdx === idx ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {openIdx === idx &&
            <pre className="mt-4 p-4 rounded-lg bg-black/40 border border-gray-800 text-xs text-gray-300 font-mono overflow-auto max-h-[260px]">
                    {JSON.stringify(e.payload ?? e, null, 2)}
                  </pre>
            }
              </div>
          )}
          </div>
        }
      </div>
    </div>);

}