// src/pages/AuditPage.tsx
import { useAppStore } from "../store";

export default function AuditPage() {
  const { audit } = useAppStore();
  return (
    <div>
      <h3>Audit Log</h3>
      <pre style={{ border: "1px solid #333", borderRadius: 10, padding: 12, overflow: "auto" }}>
        {JSON.stringify(audit, null, 2)}
      </pre>
    </div>
  );
}
