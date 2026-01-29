// frontend/src/components/TelemetryGlobe.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";

type Sat = {
  sat_id: string;
  position?: { lat: number; lon: number };
  link_state?: string;
  snr_db?: number;
  packet_loss_pct?: number;
  source_vendor?: string;
};

export default function TelemetryGlobe({
  satellites,
  height = 420,
}: {
  satellites: Sat[];
  height?: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<any>(null);
  const [w, setW] = useState<number>(600);

  // ✅ lock width to container
  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;

    const ro = new ResizeObserver(() => {
      const next = Math.max(320, Math.floor(el.getBoundingClientRect().width));
      setW(next);
    });
    ro.observe(el);

    // init
    const initW = Math.max(320, Math.floor(el.getBoundingClientRect().width));
    setW(initW);

    return () => ro.disconnect();
  }, []);

  const points = useMemo(() => {
    return (satellites ?? [])
      .filter((s) => s?.position && Number.isFinite(Number(s.position.lat)) && Number.isFinite(Number(s.position.lon)))
      .map((s) => {
        const altitude = 0.08;
        const color =
          s.link_state === "DOWN"
            ? "rgba(255,80,80,0.95)"
            : s.link_state === "DEGRADED"
            ? "rgba(255,190,80,0.95)"
            : "rgba(120,255,170,0.95)";

        return {
          id: s.sat_id,
          lat: s.position!.lat,
          lng: s.position!.lon,
          altitude,
          color,
          s,
        };
      });
  }, [satellites]);

  return (
    <div
      ref={wrapRef}
      style={{
        height,
        width: "100%",
        maxWidth: "100%",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <Globe
        ref={globeRef}
        width={w}
        height={height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        pointsData={points}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointAltitude={(d: any) => d.altitude}
        pointColor={(d: any) => d.color}
        pointRadius={0.16}
        pointsMerge={true}
        pointLabel={(d: any) => {
          const s = d.s as Sat;
          const snr = s.snr_db != null ? Number(s.snr_db).toFixed(1) : "-";
          const loss = s.packet_loss_pct != null ? Number(s.packet_loss_pct).toFixed(0) : "-";
          const vendor = s.source_vendor ?? "SIM";
          const st = s.link_state ?? "UNKNOWN";
          return `
            <div style="font-family: ui-monospace, Menlo, monospace; font-size: 12px;">
              <div><b>${s.sat_id}</b> (${st})</div>
              <div>snr: ${snr}</div>
              <div>loss: ${loss}%</div>
              <div>vendor: ${vendor}</div>
            </div>
          `;
        }}
        onGlobeReady={() => {
          try {
            globeRef.current?.pointOfView({ lat: 23.7, lng: 121.0, altitude: 2.0 }, 0);
          } catch {}
        }}
      />
    </div>
  );
}
