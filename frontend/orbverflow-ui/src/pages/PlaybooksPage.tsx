// frontend/src/pages/PlaybooksPage.tsx
import React from "react";
import { useAppStore } from "../store";
import { approvePlaybook } from "../api";

function Collapse({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: "6px 10px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.04)",
          cursor: "pointer",
        }}
      >
        {open ? "▼" : "▶"} {title}
      </button>

      {open ? <div style={{ marginTop: 8 }}>{children}</div> : null}
    </div>
  );
}

export default function PlaybooksPage() {
  const { playbooks, approvedPlaybooks } = useAppStore();

  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  async function approve(id: string) {
    setErr(null);
    setBusyId(id);
    try {
      await approvePlaybook(id);
      // ✅ UI update should come from WS playbook_approved event
      // (fallback removal not needed if WS works)
    } catch (e: any) {
      setErr(`approve failed: ${String(e?.message ?? e)}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h2 style={{ margin: "8px 0 12px" }}>Playbooks</h2>

      {err ? (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 12,
            border: "1px solid rgba(255,80,80,0.35)",
            background: "rgba(255,80,80,0.10)",
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 12,
          }}
        >
          {err}
        </div>
      ) : null}

      <h3 style={{ margin: "14px 0 8px" }}>Proposed</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: 16,
          alignItems: "start",
        }}
      >
        {playbooks.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No proposed playbooks</div>
        ) : null}

        {playbooks.map((pb: any) => (
          <div
            key={pb.id}
            style={{
              borderRadius: 16,
              padding: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>
                {pb.id} — {pb.name}
              </div>
              <div style={{ opacity: 0.8 }}>state: {pb.state ?? "PROPOSED"}</div>
            </div>

            <div>
              <b>actions</b>
              <pre
                style={{
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.35)",
                  overflow: "auto",
                }}
              >
                {JSON.stringify(pb.actions ?? [], null, 2)}
              </pre>
            </div>

            {pb.safety_impact ? (
              <div>
                <b>safety impact</b>
                <pre
                  style={{
                    marginTop: 6,
                    padding: 10,
                    borderRadius: 12,
                    background: "rgba(0,0,0,0.35)",
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(pb.safety_impact, null, 2)}
                </pre>
              </div>
            ) : null}

            {pb.command_snippets ? (
              <Collapse title="command snippets">
                <pre
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background: "rgba(0,0,0,0.35)",
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(pb.command_snippets, null, 2)}
                </pre>
              </Collapse>
            ) : null}

            {/* footer: keep button position stable */}
            <div style={{ marginTop: 6 }}>
              <button
                disabled={busyId === pb.id}
                onClick={() => approve(pb.id)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background:
                    busyId === pb.id ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
                  cursor: busyId === pb.id ? "not-allowed" : "pointer",
                }}
              >
                {busyId === pb.id ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ margin: "18px 0 8px" }}>Approved (recent)</h3>
      <div style={{ opacity: 0.9 }}>
        {approvedPlaybooks.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No approved playbooks yet</div>
        ) : (
          <ul>
            {approvedPlaybooks.map((x: any) => (
              <li key={x.id}>
                <b>{x.id}</b> — {x.state} — delivery: {x.delivery_status}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
