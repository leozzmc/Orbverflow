// // src/pages/IncidentsPage.tsx
// import { useAppStore } from "../store";

// export default function IncidentsPage() {
//   const { latestIncident } = useAppStore();

//   return (
//     <div>
//       <h3>Incidents (latest)</h3>
//       <pre style={{ border: "1px solid #333", borderRadius: 10, padding: 12, overflow: "auto" }}>
//         {latestIncident ? JSON.stringify(latestIncident, null, 2) : "No incident"}
//       </pre>

//       <div style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>
//         Map (Leaflet) 建議下一步再加：用 latestIncident.location + radius_km 畫圈、用 fleet_snapshot 畫 markers。
//       </div>
//     </div>
//   );
// }

// frontend/src/pages/IncidentsPage.tsx
import React, { useState } from "react";
import { useAppStore } from "../store";
import { IncidentMap } from "../component/IncidentMap";

export default function IncidentsPage() {
  const { latestIncident, fleet } = useAppStore();
  const [showPayload, setShowPayload] = useState(true);

  return (
    <div>
      <h2 style={{ margin: "8px 0 12px" }}>Incidents (latest)</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }}>
        <div style={{
          borderRadius: 16,
          padding: 14,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.12)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b>Status</b>
            <button onClick={() => setShowPayload((v) => !v)} style={{ padding: "6px 10px", borderRadius: 10 }}>
              {showPayload ? "Hide JSON" : "Show JSON"}
            </button>
          </div>

          {latestIncident ? (
            <div style={{ marginTop: 10 }}>
              <div><b>{latestIncident.incident_id}</b> — {latestIncident.type}</div>
              <div style={{ opacity: 0.8, marginTop: 6 }}>
                affected: {(latestIncident.affected_sats ?? []).join(", ")}
              </div>
              <div style={{ opacity: 0.8 }}>
                confidence: {Number(latestIncident.confidence ?? 0).toFixed(3)}
              </div>

              {showPayload ? (
                <pre style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.35)",
                  overflow: "auto",
                  maxHeight: 260
                }}>
                  {JSON.stringify(latestIncident, null, 2)}
                </pre>
              ) : null}
            </div>
          ) : (
            <div style={{ marginTop: 10, opacity: 0.7 }}>No incident</div>
          )}
        </div>

        <IncidentMap satellites={fleet} incident={latestIncident} />
      </div>
    </div>
  );
}
