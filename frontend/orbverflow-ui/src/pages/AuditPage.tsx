// // src/pages/AuditPage.tsx
// import { useAppStore } from "../store";

// export default function AuditPage() {
//   const { audit } = useAppStore();
//   return (
//     <div>
//       <h3>Audit Log</h3>
//       <pre style={{ border: "1px solid #333", borderRadius: 10, padding: 12, overflow: "auto" }}>
//         {JSON.stringify(audit, null, 2)}
//       </pre>
//     </div>
//   );
// }

// frontend/src/pages/AuditPage.tsx
import React, { useState } from "react";
import { useAppStore } from "../store";

function shortHash(h?: string) {
  if (!h) return "-";
  return h.slice(0, 8);
}

export default function AuditPage() {
  const { audit } = useAppStore();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const items = [...audit].reverse(); // time desc (latest first)

  return (
    <div>
      <h2 style={{ margin: "8px 0 12px" }}>Audit Log</h2>

      <div style={{
        borderRadius: 16,
        padding: 12,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.12)"
      }}>
        {items.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No audit events</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((e: any, idx: number) => (
              <div key={idx} style={{
                padding: 12,
                borderRadius: 14,
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.08)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{e.event ?? e.type ?? "EVENT"}</div>
                    <div style={{ opacity: 0.8, fontSize: 13 }}>
                      dataset: {e.dataset ?? "-"} | engine: {e.engine ?? "-"} | hash: {shortHash(e.hash)}
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                    style={{ padding: "6px 10px", borderRadius: 10 }}
                  >
                    {openIdx === idx ? "Hide" : "Details"}
                  </button>
                </div>

                {openIdx === idx ? (
                  <pre style={{
                    marginTop: 10,
                    padding: 10,
                    borderRadius: 12,
                    background: "rgba(0,0,0,0.35)",
                    overflow: "auto",
                    maxHeight: 260
                  }}>
                    {JSON.stringify(e.payload ?? e, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
