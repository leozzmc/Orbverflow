import React, { useState } from 'react';
import { useAppStore } from '../store';
import { IncidentMap } from '../components/IncidentMap';
export default function IncidentsPage() {
  const { latestIncident, fleet } = useAppStore();
  const [showPayload, setShowPayload] = useState(true);
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-medium tracking-tight mb-4 text-white">
        Incidents (latest)
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
        <div className="rounded-xl p-5 bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <b className="text-white text-lg">Status</b>
            <button
              onClick={() => setShowPayload((v) => !v)}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 transition-colors border border-gray-700">

              {showPayload ? 'Hide JSON' : 'Show JSON'}
            </button>
          </div>

          {latestIncident ?
          <div className="mt-2">
              <div className="text-white text-lg font-medium">
                <span className="font-bold text-red-400">
                  {latestIncident.incident_id}
                </span>{' '}
                — {latestIncident.type}
              </div>
              <div className="text-gray-400 mt-2 text-sm">
                affected:{' '}
                <span className="text-gray-300">
                  {(latestIncident.affected_sats ?? []).join(', ')}
                </span>
              </div>
              <div className="text-gray-400 text-sm">
                confidence:{' '}
                <span className="text-gray-300">
                  {Number(latestIncident.confidence ?? 0).toFixed(3)}
                </span>
              </div>

              {showPayload &&
            <pre className="mt-4 p-4 rounded-xl bg-black/40 border border-gray-800 text-xs text-gray-300 font-mono overflow-auto max-h-[260px]">
                  {JSON.stringify(latestIncident, null, 2)}
                </pre>
            }
            </div> :

          <div className="mt-4 text-gray-500 italic">
              No active incidents detected
            </div>
          }
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
          <IncidentMap satellites={fleet} incident={latestIncident} />
        </div>
      </div>
    </div>);

}