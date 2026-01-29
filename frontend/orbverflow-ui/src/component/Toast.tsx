// frontend/src/components/Toast.tsx
import React from "react";

export function useToast() {
  const [msg, setMsg] = React.useState<string | null>(null);

  function show(message: string, ttlMs = 1800) {
    setMsg(message);
    window.setTimeout(() => setMsg((cur) => (cur === message ? null : cur)), ttlMs);
  }

  const Toast = msg ? (
    <div
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        zIndex: 9999,
        padding: "10px 14px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(0,0,0,0.70)",
        backdropFilter: "blur(10px)",
        color: "white",
        maxWidth: 420,
      }}
    >
      {msg}
    </div>
  ) : null;

  return { show, Toast };
}
