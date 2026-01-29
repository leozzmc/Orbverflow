// // frontend/src/component/IncidentMap.tsx  (或 src/components/IncidentMap.tsx)
// import React from "react";
// import { MapContainer, TileLayer, Circle, Marker, Tooltip } from "react-leaflet";
// import L from "leaflet";

// const dotIcon = L.divIcon({
//   className: "orb-dot",
//   html: `<div style="width:10px;height:10px;border-radius:999px;background:rgba(120,255,170,0.95);box-shadow:0 0 10px rgba(120,255,170,0.5)"></div>`,
//   iconSize: [10, 10],
//   iconAnchor: [5, 5],
// });

// export function IncidentMap({
//   satellites,
//   incident,
//   height = 520,
// }: {
//   satellites: any[];
//   incident: any | null;
//   height?: number;
// }) {
//   const center = pickCenter(satellites, incident);

//   const loc = incident?.location ?? incident?.incident?.location;
//   const radiusKm = incident?.radius_km ?? incident?.incident?.radius_km;
//   const confidence = incident?.confidence ?? incident?.incident?.confidence;
//   const type = incident?.type ?? incident?.incident?.type;

//   const showIncident = !!loc && Number.isFinite(Number(radiusKm));

//   return (
//     <div style={{ height }}>
//       <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%" }}>
//         {/* <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
//         <TileLayer
//           attribution="Tiles © Esri"
//           url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
//         />

//         {satellites.map((s: any) => {
//           const p = s.position;
//           if (!p) return null;
//           return (
//             <Marker key={s.sat_id} position={[p.lat, p.lon]} icon={dotIcon}>
//               <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
//                 <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12 }}>
//                   <div>
//                     <b>{s.sat_id}</b> ({s.link_state})
//                   </div>
//                   <div>snr: {fmt1(s.snr_db)}</div>
//                   <div>loss: {fmt0(s.packet_loss_pct)}%</div>
//                   <div>vendor: {s.source_vendor ?? "SIM"}</div>
//                 </div>
//               </Tooltip>
//             </Marker>
//           );
//         })}

//         {showIncident ? (
//           <>
//             <Circle
//               center={[loc.lat, loc.lon]}
//               radius={Number(radiusKm) * 1000}
//               pathOptions={{
//                 color: "rgba(255,80,80,0.95)",
//                 fillColor: "rgba(255,80,80,0.18)",
//                 weight: 2,
//               }}
//             />
//             <Marker
//               position={[loc.lat, loc.lon]}
//               icon={L.divIcon({
//                 className: "orb-incident-label",
//                 html: `
//                   <div style="
//                     padding:6px 10px;
//                     border-radius:12px;
//                     border:1px solid rgba(255,120,120,0.35);
//                     background:rgba(20,20,20,0.75);
//                     color:white;
//                     font-size:12px;
//                     font-family: ui-monospace, Menlo, monospace;
//                     white-space:nowrap;
//                   ">
//                     <b>${type ?? "INCIDENT"}</b> detected · conf: ${fmt2(confidence)}
//                   </div>
//                 `,
//                 iconSize: [1, 1],
//                 iconAnchor: [0, 0],
//               })}
//             />
//           </>
//         ) : null}
//       </MapContainer>
//     </div>
//   );
// }

// // keep default export too (optional but nice)
// export default IncidentMap;

// function pickCenter(sats: any[], incident: any | null): [number, number] {
//   const loc = incident?.location ?? incident?.incident?.location;
//   if (loc?.lat && loc?.lon) return [loc.lat, loc.lon];

//   const p = sats?.find((x) => x?.position)?.position;
//   if (p?.lat && p?.lon) return [p.lat, p.lon];

//   return [23.7, 121.0];
// }
// function fmt1(x: any) {
//   const n = Number(x);
//   return Number.isFinite(n) ? n.toFixed(1) : String(x ?? "-");
// }
// function fmt0(x: any) {
//   const n = Number(x);
//   return Number.isFinite(n) ? n.toFixed(0) : String(x ?? "-");
// }
// function fmt2(x: any) {
//   const n = Number(x);
//   return Number.isFinite(n) ? n.toFixed(2) : "-";
// }


// frontend/src/components/IncidentMap.tsx
import React from "react";
import { MapContainer, TileLayer, Circle, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";

const dotIcon = L.divIcon({
  className: "orb-dot",
  html: `<div style="width:10px;height:10px;border-radius:999px;background:rgba(120,255,170,0.95);box-shadow:0 0 10px rgba(120,255,170,0.5)"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

export function IncidentMap({
  satellites,
  incident,
  height = 520,
}: {
  satellites: any[];
  incident: any | null;
  height?: number;
}) {
  const center = pickCenter(satellites, incident);

  const loc = incident?.location ?? incident?.incident?.location;
  const radiusKm = incident?.radius_km ?? incident?.incident?.radius_km;
  const confidence = incident?.confidence ?? incident?.incident?.confidence;
  const type = incident?.type ?? incident?.incident?.type;

  const showIncident = !!loc && Number.isFinite(Number(radiusKm));

  return (
    <div style={{ height, width: "100%" }} className="orb-card">
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: "100%", width: "100%", borderRadius: 16, overflow: "hidden" }}
      >
        <TileLayer
          attribution="Tiles © Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        {satellites.map((s: any) => {
          const p = s.position;
          if (!p) return null;
          return (
            <Marker key={s.sat_id} position={[p.lat, p.lon]} icon={dotIcon}>
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12 }}>
                  <div><b>{s.sat_id}</b> ({s.link_state})</div>
                  <div>snr: {fmt1(s.snr_db)}</div>
                  <div>loss: {fmt0(s.packet_loss_pct)}%</div>
                  <div>vendor: {s.source_vendor ?? "SIM"}</div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {showIncident ? (
          <>
            {/* ✅ 紅色範圍圈：JAMMING detected */}
            <Circle
              center={[loc.lat, loc.lon]}
              radius={Number(radiusKm) * 1000}
              pathOptions={{
                color: "rgba(255,80,80,0.95)",
                fillColor: "rgba(255,80,80,0.18)",
                weight: 2,
              }}
            />
            {/* ✅ 標籤 */}
            <Marker
              position={[loc.lat, loc.lon]}
              icon={L.divIcon({
                className: "orb-incident-label",
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
                    <b>${type ?? "INCIDENT"}</b> detected · conf: ${fmt2(confidence)}
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
  );
}

export default IncidentMap;

function pickCenter(sats: any[], incident: any | null): [number, number] {
  const loc = incident?.location ?? incident?.incident?.location;
  if (loc?.lat && loc?.lon) return [loc.lat, loc.lon];

  const p = sats?.find((x) => x?.position)?.position;
  if (p?.lat && p?.lon) return [p.lat, p.lon];

  return [23.7, 121.0];
}

function fmt1(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n.toFixed(1) : String(x ?? "-");
}
function fmt0(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n.toFixed(0) : String(x ?? "-");
}
function fmt2(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n.toFixed(2) : "-";
}
