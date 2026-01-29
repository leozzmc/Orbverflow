// frontend/src/orbverflow/ws.ts
export type WsEvent =
  | { type: "telemetry_batch"; scenario?: string; [k: string]: any }
  | { type: "fleet_snapshot"; satellites?: any[] }
  | { type: "incident_created"; incident?: any; playbooks?: any[] }
  | { type: "playbook_proposed"; playbook: any }
  | { type: "playbook_approved"; playbook_id: string; delivery_status?: string }
  | { type: "mission_continuity_proposed"; plan?: any; recommendation?: any }
  | { type: "audit_log"; [k: string]: any }
  | Record<string, any>;

function toWsBase(apiBase: string) {
  // http://host:8000 -> ws://host:8000
  // https://host -> wss://host
  return apiBase.replace(/^http/, "ws");
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "http://127.0.0.1:8000";
const WS_URL = `${toWsBase(API_BASE)}/ws`;

export function connectWs(onEvent: (e: WsEvent) => void) {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => console.log("[ws] connected", WS_URL);
  ws.onclose = () => console.log("[ws] closed");
  ws.onerror = (err) => console.error("[ws] error", err);

  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data) as WsEvent;
      onEvent(data);
    } catch {
      console.warn("[ws] invalid json", msg.data);
    }
  };

  return ws;
}
