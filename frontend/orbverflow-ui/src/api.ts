// // src/api.ts
// const BASE = "http://127.0.0.1:8000";

// export async function getDatasetMeta() {
//   const r = await fetch(`${BASE}/meta/dataset`);
//   return r.json();
// }

// export async function getIncidentsLatest() {
//   const r = await fetch(`${BASE}/incidents/latest`);
//   return r.json();
// }

// export async function getMissionLatest() {
//   const r = await fetch(`${BASE}/mission/continuity/latest`);
//   return r.json();
// }

// export async function getAuditLatest(limit = 50) {
//   const r = await fetch(`${BASE}/audit/latest?limit=${limit}`);
//   return r.json();
// }

// export async function triggerScenario(scenario: string, duration_sec: number) {
//   const r = await fetch(`${BASE}/scenario/trigger`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ scenario, duration_sec }),
//   });
//   return r.json();
// }

// export async function approvePlaybook(playbookId: string) {
//   const r = await fetch(`${BASE}/playbooks/${playbookId}/approve`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ operator: "demo_user" }),
//   });
//   return r.json();
// }

// frontend/src/api.ts
const BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

async function jget(path: string) {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

export async function getTelemetryLatest() {
  return jget("/telemetry/latest");
}

export async function getIncidentsLatest() {
  return jget("/incidents/latest");
}

export async function getMissionLatest() {
  return jget("/mission/continuity/latest");
}

export async function getAuditLatest(limit = 50) {
  return jget(`/audit/latest?limit=${limit}`);
}

export async function getDatasetMeta() {
  return jget("/meta/dataset");
}

// Issue-9 optional reload fallback
export async function getPlaybooksLatest(limit = 50) {
  return jget(`/playbooks/latest?limit=${limit}`);
}

export async function triggerScenario(scenario: string, duration_sec: number) {
  const r = await fetch(`${BASE}/scenario/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario, duration_sec }),
  });
  return r.json();
}

export async function approvePlaybook(playbookId: string) {
  const r = await fetch(`${BASE}/playbooks/${playbookId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operator: "demo_user" }),
  });
  return r.json();
}