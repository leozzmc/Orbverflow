// src/pages/PlaybooksPage.tsx
import { useAppStore } from "../store";
import { approvePlaybook } from "../api";

export default function PlaybooksPage() {
  const { playbooks } = useAppStore();

  async function approve(id: string) {
    await approvePlaybook(id);
  }

  return (
    <div>
      <h3>Playbooks</h3>
      {playbooks.length === 0 ? (
        <div>No playbooks yet (trigger JAMMING first).</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {playbooks.map((p) => (
            <div key={p.id} style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
              <div style={{ fontWeight: 700 }}>{p.id} — {p.name}</div>
              <div>state: <b>{p.state}</b></div>
              <div style={{ marginTop: 8 }}>
                <div><b>actions</b></div>
                <pre style={{ margin: 0 }}>{JSON.stringify(p.actions ?? [], null, 2)}</pre>
              </div>
              <div style={{ marginTop: 8 }}>
                <button disabled={p.state === "APPROVED"} onClick={() => approve(p.id)}>
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
