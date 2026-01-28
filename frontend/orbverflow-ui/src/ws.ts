// src/ws.ts
export type WsEvent =
  | { type: "fleet_snapshot"; timestamp: number; satellites: Array<any> }
  | { type: "telemetry_batch"; scenario: string; tick: number; records: Array<any> }
  | { type: "incident_created"; incident: any }
  | { type: "playbook_proposed"; playbook: any }
  | { type: "playbook_approved"; playbook_id: string; delivery_status?: string }
  | { type: "mission_continuity_proposed"; plan?: any; recommendation?: any }
  | { type: "audit_log"; [k: string]: any }
  | Record<string, any>;

export function connectWs(onEvent: (e: WsEvent) => void) {
  const ws = new WebSocket("ws://127.0.0.1:8000/ws");

  ws.onopen = () => console.log("[ws] connected");
  ws.onclose = () => console.log("[ws] closed");
  ws.onerror = (err) => console.error("[ws] error", err);

  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data) as WsEvent;
      onEvent(data);
    } catch {
      console.warn("[ws] non-json message", msg.data);
    }
  };

  return ws;
}
