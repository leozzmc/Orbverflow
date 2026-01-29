import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Globe, MapPin, Radio } from 'lucide-react';
// Fix for default marker icon in leaflet
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl =
'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl =
'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
export function TaiwanMap() {
  const position: [number, number] = [23.6978, 120.9605];
  const taipeiPosition: [number, number] = [25.033, 121.5654];
  const kaohsiungPosition: [number, number] = [22.6273, 120.3014];
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium tracking-tight flex items-center">
          <Globe className="mr-2 text-blue-500" size={20} />
          Regional Monitoring: Taiwan Sector
        </h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
            <Radio size={12} className="mr-2 text-green-500 animate-pulse" />
            <span>Signal: Strong</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Live Satellite Feed
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 overflow-hidden p-1 h-[450px] relative z-0 shadow-lg shadow-blue-900/5">
        <MapContainer
          center={position}
          zoom={8}
          scrollWheelZoom={false}
          style={{
            height: '100%',
            width: '100%',
            borderRadius: '0.5rem',
            zIndex: 0,
            background: '#050713'
          }}>

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />


          <Marker position={taipeiPosition}>
            <Popup>
              <div className="p-1">
                <div className="flex items-center mb-1">
                  <MapPin size={14} className="text-blue-600 mr-1" />
                  <span className="font-bold text-gray-800">Taipei HQ</span>
                </div>
                <div className="text-xs text-gray-600">
                  Status:{' '}
                  <span className="text-green-600 font-medium">
                    Operational
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Lat: 25.0330° N
                </div>
              </div>
            </Popup>
          </Marker>

          <Marker position={kaohsiungPosition}>
            <Popup>
              <div className="p-1">
                <div className="flex items-center mb-1">
                  <MapPin size={14} className="text-blue-600 mr-1" />
                  <span className="font-bold text-gray-800">
                    Kaohsiung Station
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Status:{' '}
                  <span className="text-green-600 font-medium">Online</span>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        <div className="absolute bottom-4 left-4 z-[400] bg-gray-900/80 backdrop-blur-md border border-gray-700/50 p-3 rounded-lg max-w-xs">
          <div className="text-xs font-medium text-gray-300 mb-2">
            Telemetry Data
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <div className="text-[10px] text-gray-500 uppercase">
                Wind Speed
              </div>
              <div className="text-sm text-blue-400 font-mono">12.4 km/h</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase">
                Visibility
              </div>
              <div className="text-sm text-blue-400 font-mono">100%</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase">
                Precipitation
              </div>
              <div className="text-sm text-blue-400 font-mono">0%</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase">
                Humidity
              </div>
              <div className="text-sm text-blue-400 font-mono">68%</div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}