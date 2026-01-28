// src/pages/IncidentsPage.tsx
import { useAppStore } from "../store";

export default function IncidentsPage() {
  const { latestIncident } = useAppStore();

  return (
    <div>
      <h3>Incidents (latest)</h3>
      <pre style={{ border: "1px solid #333", borderRadius: 10, padding: 12, overflow: "auto" }}>
        {latestIncident ? JSON.stringify(latestIncident, null, 2) : "No incident"}
      </pre>

      <div style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>
        Map (Leaflet) 建議下一步再加：用 latestIncident.location + radius_km 畫圈、用 fleet_snapshot 畫 markers。
      </div>
    </div>
  );
}
