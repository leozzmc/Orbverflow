import React from 'react'
import { MapContainer, TileLayer, Circle, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// Fix for default marker icon in leaflet with webpack/cra
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'
const iconRetinaUrl =
  'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png'
const shadowUrl =
  'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = DefaultIcon
const dotIcon = L.divIcon({
  className: 'orb-dot',
  html: `<div style="width:10px;height:10px;border-radius:999px;background:rgba(120,255,170,0.95);box-shadow:0 0 10px rgba(120,255,170,0.5)"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
})
export function IncidentMap({
  satellites,
  incident,
  height = 520,
}: {
  satellites: any[]
  incident: any | null
  height?: number
}) {
  const center = pickCenter(satellites, incident)
  const loc = incident?.location ?? incident?.incident?.location
  const radiusKm = incident?.radius_km ?? incident?.incident?.radius_km
  const confidence = incident?.confidence ?? incident?.incident?.confidence
  const type = incident?.type ?? incident?.incident?.type
  const showIncident = !!loc && Number.isFinite(Number(radiusKm))
  return (
    <div
      style={{
        height,
      }}
      className="w-full rounded-xl overflow-hidden border border-gray-800/50 shadow-lg bg-gray-900/50 backdrop-blur-sm"
    >
      <MapContainer
        center={center}
        zoom={6}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: '0.75rem',
          background: '#050713',
        }}
      >
       
      <TileLayer
        attribution="Tiles © Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

        {satellites.map((s: any) => {
          const p = s.position
          if (!p) return null
          return (
            <Marker key={s.sat_id} position={[p.lat, p.lon]} icon={dotIcon}>
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                <div className="font-mono text-xs p-1">
                  <div>
                    <b>{s.sat_id}</b> ({s.link_state})
                  </div>
                  <div>snr: {fmt1(s.snr_db)}</div>
                  <div>loss: {fmt0(s.packet_loss_pct)}%</div>
                  <div>vendor: {s.source_vendor ?? 'SIM'}</div>
                </div>
              </Tooltip>
            </Marker>
          )
        })}

        {showIncident ? (
          <>
            <Circle
              center={[loc.lat, loc.lon]}
              radius={Number(radiusKm) * 1000}
              pathOptions={{
                color: 'rgba(255,80,80,0.95)',
                fillColor: 'rgba(255,80,80,0.18)',
                weight: 2,
              }}
            />
            <Marker
              position={[loc.lat, loc.lon]}
              icon={L.divIcon({
                className: 'orb-incident-label',
                html: `
                  <div style="
                    padding:6px 10px;
                    border-radius:12px;
                    border:1px solid rgba(255,120,120,0.35);
                    background:rgba(20,20,20,0.75);
                    color:white;
                    font-size:12px;
                    font-family: ui-monospace, Menlo, monospace;
                    white-space:nowrap;
                  ">
                    <b>${type ?? 'INCIDENT'}</b> detected · conf: ${fmt2(confidence)}
                  </div>
                `,
                iconSize: [1, 1],
                iconAnchor: [0, 0],
              })}
            />
          </>
        ) : null}
      </MapContainer>
    </div>
  )
}
function pickCenter(sats: any[], incident: any | null): [number, number] {
  const loc = incident?.location ?? incident?.incident?.location
  if (loc?.lat && loc?.lon) return [loc.lat, loc.lon]
  const p = sats?.find((x) => x?.position)?.position
  if (p?.lat && p?.lon) return [p.lat, p.lon]
  return [23.7, 121.0]
}
function fmt1(x: any) {
  const n = Number(x)
  return Number.isFinite(n) ? n.toFixed(1) : String(x ?? '-')
}
function fmt0(x: any) {
  const n = Number(x)
  return Number.isFinite(n) ? n.toFixed(0) : String(x ?? '-')
}
function fmt2(x: any) {
  const n = Number(x)
  return Number.isFinite(n) ? n.toFixed(2) : '-'
}
