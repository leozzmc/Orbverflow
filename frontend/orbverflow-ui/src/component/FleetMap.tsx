// frontend/src/components/FleetMap.tsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";

const ICON = new L.DivIcon({
  className: "sat-marker",
  html: `<div style="width:10px;height:10px;border-radius:999px;background:#79ffa5;box-shadow:0 0 12px rgba(121,255,165,0.7)"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

function FitToFleet({ points }: { points: Array<[number, number]> }) {
  const map = useMap();
  React.useEffect(() => {
    if (!points.length) return;
    const b = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(b.pad(0.25));
  }, [points, map]);
  return null;
}

export function FleetMap({ fleet, incident }: { fleet: any[]; incident: any | null }) {
  const points: Array<[number, number]> =
    (fleet ?? [])
      .map((s: any) => [Number(s?.position?.lat), Number(s?.position?.lon)] as [number, number])
      .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));

  const center: [number, number] = points[0] ?? [23.7, 121.0];

  const incLat = Number(incident?.location?.lat);
  const incLon = Number(incident?.location?.lon);
  const hasIncidentCircle = Number.isFinite(incLat) && Number.isFinite(incLon) && Number.isFinite(Number(incident?.radius_km));

  // leaflet circle uses meters
  const radiusMeters = hasIncidentCircle ? Number(incident.radius_km) * 1000 : 0;

  return (
    <div style={{ height: 520, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
      <MapContainer center={center} zoom={4} style={{ height: "100%", width: "100%" }}>
        {/* “Earth-like” satellite imagery tiles (looks like a globe surface) */}
        <TileLayer
          attribution="Tiles © Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        <FitToFleet points={points} />

        {fleet.map((s: any) => {
          const lat = Number(s?.position?.lat);
          const lon = Number(s?.position?.lon);
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
          return (
            <Marker key={s.sat_id} position={[lat, lon]} icon={ICON}>
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontWeight: 800 }}>{s.sat_id}</div>
                  <div>link: <b>{s.link_state}</b></div>
                  <div>snr: {Number(s.snr_db).toFixed?.(1) ?? s.snr_db}</div>
                  <div>loss: {Number(s.packet_loss_pct).toFixed?.(0) ?? s.packet_loss_pct}%</div>
                  <div>vendor: {s.source_vendor ?? "SIM"}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {hasIncidentCircle ? (
          <Circle center={[incLat, incLon]} radius={radiusMeters}>
            <Popup>
              <div style={{ minWidth: 220 }}>
                <div style={{ fontWeight: 800 }}>Incident: {incident?.type ?? "UNKNOWN"}</div>
                <div>radius_km: {incident?.radius_km}</div>
                <div>confidence: {incident?.confidence}</div>
                <div>affected: {(incident?.affected_sats ?? []).join(", ")}</div>
              </div>
            </Popup>
          </Circle>
        ) : null}
      </MapContainer>
    </div>
  );
}
