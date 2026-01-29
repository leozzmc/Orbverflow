// frontend/src/components/Badges.tsx
import React from "react";
import { useAppStore } from "../store";

function pill(label: string, value: string) {
  return (
    <span style={{
      display: "inline-flex",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
      fontSize: 14,
    }}>
      <span style={{ opacity: 0.7 }}>{label}:</span>
      <span>{value}</span>
    </span>
  );
}

export function Badges({ datasetMeta }: { datasetMeta: any }) {
  const dataset = datasetMeta?.source_dataset_id ?? "unknown";
  const vendor = datasetMeta?.source_vendor ?? "unknown";
  const mapping = datasetMeta?.mapping_version ?? "unknown";

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <Badge label="Dataset" value={dataset} />
      <Badge label="Vendor" value={vendor} />
      <Badge label="Mapping" value={mapping} />
    </div>
  );
}
function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.badge}>
      <b>{label}:</b> {value}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  badge: {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 999,
    padding: "6px 12px",
    background: "rgba(255,255,255,0.04)",
    fontSize: 13,
  },
}

// export function Badge({ label, value }: { label: string; value: string }) {
//   return (
//     <div style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 999, padding: "6px 12px" }}>
//       <b>{label}:</b> {value}
//     </div>
//   );
// }


// export function TopBadges() {
//   const { datasetMeta } = useAppStore();
//   const dataset = datasetMeta?.source_dataset_id ?? "unknown";
//   const vendor = datasetMeta?.source_vendor ?? "unknown";
//   const mapping = datasetMeta?.mapping_version ? `v${datasetMeta.mapping_version}` : "unknown";

//   return (
//     <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
//       {pill("Dataset", dataset)}
//       {pill("Vendor", vendor)}
//       {pill("Mapping", mapping)}
//     </div>
//   );
// }

export function TopBadges() {
  const { datasetMeta } = useAppStore();
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <Badge label="Dataset" value={datasetMeta?.source_dataset_id ?? "unknown"} />
      <Badge label="Vendor" value={datasetMeta?.source_vendor ?? "unknown"} />
      <Badge label="Mapping" value={datasetMeta?.mapping_version ?? "unknown"} />
    </div>
  );
}
export function ScenarioBanner() {
  const { scenario } = useAppStore();
  const isBad = scenario === "JAMMING" || scenario === "SATB_DOWN" || scenario === "SPOOFING";

  return (
    <div style={{
      margin: "12px 0 18px",
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.12)",
      background: isBad ? "rgba(255,80,80,0.10)" : "rgba(120,255,140,0.08)",
      fontSize: 14
    }}>
      <b>Scenario:</b> {scenario}
    </div>
  );
}
