import React, { useState } from 'react'
import { X } from 'lucide-react'
// Custom image URLs
const MOS_ICON =
  'https://cdn.magicpatterns.com/uploads/ftWyqjy3HN3ZbfYGP1XRGq/mos.png'
const C2_SERVER_ICON =
  'https://cdn.magicpatterns.com/uploads/hG8jconkcy58tLWE6RwmXW/c2.png'
const VALIDATION_GATEWAY_ICON =
  'https://cdn.magicpatterns.com/uploads/587MeENhAPVNb6MmQU9icf/pasted-image.png'
const ANTENNA_ICON =
  'https://cdn.magicpatterns.com/uploads/arizjHne55tSvqqPXTjpyi/antenna.png'
const SATELLITE_ICON =
  'https://cdn.magicpatterns.com/uploads/bFzmGfUNQDc6tDdextgY2x/sat.png'
// Node component with custom image
function ImageNode({
  src,
  label,
  sublabel,
}: {
  src: string
  label: string
  sublabel?: string
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-28 h-28 rounded-xl bg-gray-800/80 border border-gray-600/50 flex items-center justify-center shadow-lg backdrop-blur-sm hover:bg-gray-700/80 transition-all duration-300 hover:scale-105 hover:border-blue-500/50 p-3">
        <img src={src} alt={label} className="w-20 h-20 object-contain" />
      </div>
      <div className="mt-3 text-center">
        <div className="text-sm font-medium text-white whitespace-nowrap">
          {label}
        </div>
        {sublabel && (
          <div className="text-xs text-gray-400 whitespace-nowrap">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  )
}
// Animated arrow component
function AnimatedArrow({
  direction,
  label,
  color,
}: {
  direction: 'forward' | 'backward'
  label: string
  color: 'blue' | 'green'
}) {
  const isForward = direction === 'forward'
  const colorClasses = color === 'blue' ? 'text-blue-400' : 'text-green-400'
  const bgColor = color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
  const glowColor =
    color === 'blue' ? 'shadow-blue-500/50' : 'shadow-green-500/50'
  return (
    <div
      className={`flex flex-col items-center ${isForward ? 'mb-1' : 'mt-1'}`}
    >
      <div
        className={`text-[10px] font-medium ${colorClasses} mb-1 whitespace-nowrap`}
      >
        {label}
      </div>
      <div className="relative w-20 h-3 flex items-center">
        <div
          className={`absolute inset-x-0 h-0.5 ${bgColor} opacity-30 rounded-full`}
        />
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`flex items-center gap-2 ${isForward ? 'animate-flow-right' : 'animate-flow-left'}`}
            style={{
              width: '200%',
            }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${bgColor} shadow-lg ${glowColor}`}
              />
            ))}
          </div>
        </div>
        <div className={`absolute ${isForward ? 'right-0' : 'left-0'}`}>
          <div
            className="w-0 h-0 border-y-[4px] border-y-transparent"
            style={{
              borderLeftWidth: isForward ? '6px' : '0',
              borderRightWidth: !isForward ? '6px' : '0',
              borderLeftColor: isForward
                ? color === 'blue'
                  ? '#60a5fa'
                  : '#4ade80'
                : 'transparent',
              borderRightColor: !isForward
                ? color === 'blue'
                  ? '#60a5fa'
                  : '#4ade80'
                : 'transparent',
            }}
          />
        </div>
      </div>
    </div>
  )
}
function NodeConnection() {
  return (
    <div className="flex flex-col items-center justify-center mx-2">
      <AnimatedArrow direction="forward" label="Command" color="blue" />
      <AnimatedArrow direction="backward" label="Telemetry" color="green" />
    </div>
  )
}
function WirelessConnection() {
  return (
    <div className="flex flex-col items-center justify-center mx-3">
      <div className="flex flex-col items-center mb-1">
        <div className="text-[10px] font-medium text-blue-400 mb-1">
          RF Uplink
        </div>
        <div className="relative w-24 h-3 flex items-center">
          <div className="absolute inset-x-0 h-0.5 bg-blue-500 opacity-30 rounded-full" />
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="flex items-center gap-3 animate-flow-right"
              style={{
                width: '200%',
              }}
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="absolute right-0">
            <div
              className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px]"
              style={{
                borderLeftColor: '#60a5fa',
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center mt-1">
        <div className="relative w-24 h-3 flex items-center">
          <div className="absolute inset-x-0 h-0.5 bg-green-500 opacity-30 rounded-full" />
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="flex items-center gap-3 animate-flow-left"
              style={{
                width: '200%',
              }}
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="absolute left-0">
            <div
              className="w-0 h-0 border-y-[4px] border-y-transparent border-r-[6px]"
              style={{
                borderRightColor: '#4ade80',
              }}
            />
          </div>
        </div>
        <div className="text-[10px] font-medium text-green-400 mt-1">
          RF Downlink
        </div>
      </div>
    </div>
  )
}
// Layer data
const LAYER_DATA = {
  application: {
    title: 'Application Layer',
    severity: 'medium' as const,
    threats: [
      'Command Injection',
      'Replay Attacks',
      'Auth Bypass',
      'Supply Chain Attack',
    ],
    description:
      'Software and protocol vulnerabilities at the application level',
  },
  network: {
    title: 'Network Layer',
    severity: 'high' as const,
    threats: ['Man-in-the-Middle', 'DDoS Attacks', 'Protocol Exploits'],
    description: 'Communication infrastructure and routing vulnerabilities',
  },
  rf: {
    title: 'RF Layer',
    severity: 'critical' as const,
    threats: ['Jamming', 'Spoofing', 'Eavesdropping'],
    description: 'Physical radio frequency transmission vulnerabilities',
  },
}
// Stacked Diamond Layers - overlapping with shadows and increasing widths and heights
function StackedDiamonds({
  selectedLayer,
  onLayerClick,
}: {
  selectedLayer: 'application' | 'network' | 'rf' | null
  onLayerClick: (layer: 'application' | 'network' | 'rf') => void
}) {
  const centerX = 110
  // Three stacked diamonds with overlapping vertical positions, increasing widths AND heights
  const layers = [
    {
      id: 'application' as const,
      y: 10,
      width: 120,
      height: 32,
      color: '#60a5fa',
      lightColor: '#93c5fd',
      label: 'Application',
    },
    {
      id: 'network' as const,
      y: 38,
      width: 150,
      height: 40,
      color: '#f87171',
      lightColor: '#fca5a5',
      label: 'Network',
    },
    {
      id: 'rf' as const,
      y: 72,
      width: 180,
      height: 50,
      color: '#fde047',
      lightColor: '#fef08a',
      label: 'RF',
    },
  ]
  return (
    <div className="flex items-start gap-6">
      {/* Diamond Stack */}
      <div className="relative w-[220px] h-[170px]">
        <svg viewBox="0 0 220 170" className="w-full h-full">
          <defs>
            {layers.map((layer) => (
              <linearGradient
                key={`grad-${layer.id}`}
                id={`grad-${layer.id}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor={layer.lightColor} />
                <stop offset="100%" stopColor={layer.color} />
              </linearGradient>
            ))}

            {/* Shadow filter for overlap effect */}
            <filter
              id="diamondShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="3"
                floodColor="#000"
                floodOpacity="0.4"
              />
            </filter>

            {/* Glow filter for selected state */}
            <filter
              id="diamondGlow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render diamonds from bottom to top for proper layering */}
          {[...layers].reverse().map((layer) => {
            const isSelected = selectedLayer === layer.id
            // Diamond points: top, right, bottom, left (using layer-specific width AND height)
            const points = `${centerX},${layer.y} ${centerX + layer.width / 2},${layer.y + layer.height / 2} ${centerX},${layer.y + layer.height} ${centerX - layer.width / 2},${layer.y + layer.height / 2}`
            return (
              <g
                key={layer.id}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onLayerClick(layer.id)}
                filter={
                  isSelected ? 'url(#diamondGlow)' : 'url(#diamondShadow)'
                }
                style={{
                  transform: isSelected ? 'translateY(-4px)' : '',
                  transformOrigin: 'center',
                }}
              >
                <polygon
                  points={points}
                  fill={`url(#grad-${layer.id})`}
                  opacity={isSelected ? 1 : 0.92}
                  className="hover:opacity-100 transition-opacity"
                />
                {isSelected && (
                  <polygon
                    points={points}
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Labels on the side */}
      <div className="flex flex-col justify-center gap-2 pt-2">
        {layers.map((layer) => {
          const isSelected = selectedLayer === layer.id
          return (
            <button
              key={layer.id}
              onClick={() => onLayerClick(layer.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${isSelected ? 'bg-gray-700/80 scale-105' : 'hover:bg-gray-800/50'}`}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: layer.color,
                }}
              />
              <span
                className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}
              >
                {layer.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
// Layer Detail Panel
function LayerDetailPanel({
  layer,
  onClose,
}: {
  layer: 'application' | 'network' | 'rf' | null
  onClose: () => void
}) {
  if (!layer) return null
  const data = LAYER_DATA[layer]
  const severityColors = {
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  const bgColors = {
    application:
      'border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-blue-500/5',
    network: 'border-red-500/40 bg-gradient-to-br from-red-500/10 to-red-500/5',
    rf: 'border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5',
  }
  const accentColors = {
    application: 'text-blue-400',
    network: 'text-red-400',
    rf: 'text-yellow-400',
  }
  const dotColors = {
    application: 'bg-blue-500',
    network: 'bg-red-500',
    rf: 'bg-yellow-500',
  }
  const threatDotColors = {
    application: 'bg-blue-400',
    network: 'bg-red-400',
    rf: 'bg-yellow-400',
  }
  return (
    <div
      className={`rounded-xl p-6 border-2 ${bgColors[layer]} backdrop-blur-sm animate-fade-in shadow-xl`}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${dotColors[layer]} animate-pulse`}
          />
          <h4 className={`text-xl font-bold ${accentColors[layer]}`}>
            {data.title}
          </h4>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border uppercase ${severityColors[data.severity]}`}
          >
            {data.severity}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-5">{data.description}</p>

      <div className="mb-5">
        <div className="text-sm font-medium text-gray-300 mb-3">
          Potential Threats:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.threats.map((threat, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50"
            >
              <div
                className={`w-2 h-2 rounded-full ${threatDotColors[layer]}`}
              />
              <span className="text-sm text-gray-200">{threat}</span>
              {threat === 'Supply Chain Attack' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 ml-auto">
                  NEW
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-700/50">
        <div className="text-xs text-gray-500">
          Click on other layers to explore different attack surfaces
        </div>
      </div>
    </div>
  )
}
export default function ThreatModelPage() {
  const [selectedLayer, setSelectedLayer] = useState<
    'application' | 'network' | 'rf' | null
  >(null)
  const handleLayerClick = (layer: 'application' | 'network' | 'rf') => {
    setSelectedLayer(selectedLayer === layer ? null : layer)
  }
  return (
    <div className="animate-fade-in">
      <style>{`
        @keyframes flow-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes flow-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-flow-right {
          animation: flow-right 2s linear infinite;
        }
        .animate-flow-left {
          animation: flow-left 2s linear infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <h2 className="text-xl font-medium tracking-tight text-white mb-6">
        Threat Model Overview
      </h2>

      {/* Main Threat Model Container */}
      <div className="relative p-8 pt-10 rounded-2xl border-2 border-red-500/50 bg-gray-900/30 backdrop-blur-sm mt-4">
        <div className="absolute -top-4 left-6 px-4 py-1.5 bg-[#050713] border-2 border-red-500/50 rounded-lg z-10">
          <span className="text-sm font-bold text-red-400 tracking-wide">
            THREAT MODEL
          </span>
        </div>
        <div className="absolute -top-4 right-6 flex items-center gap-4 px-4 py-1.5 bg-[#050713] border border-gray-600/50 rounded-lg z-10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500 rounded-full" />
            <span className="text-xs text-blue-400 font-medium">
              Control Command Flow
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500 rounded-full" />
            <span className="text-xs text-green-400 font-medium">
              Telemetry Data
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center py-6 overflow-x-auto">
          <div className="flex items-center gap-0">
            <ImageNode
              src={MOS_ICON}
              label="Mission Operation"
              sublabel="Center (MOC)"
            />
            <NodeConnection />
            <ImageNode
              src={C2_SERVER_ICON}
              label="C2 Server"
              sublabel="Command & Control"
            />
            <NodeConnection />
            <ImageNode
              src={VALIDATION_GATEWAY_ICON}
              label="Validation Gateway"
              sublabel="Encryption Check"
            />
            <NodeConnection />
            <ImageNode
              src={ANTENNA_ICON}
              label="Antenna Array"
              sublabel="Ground Station"
            />
            <WirelessConnection />
            <ImageNode
              src={SATELLITE_ICON}
              label="Satellites"
              sublabel="LEO Constellation"
            />
          </div>
        </div>
      </div>

      {/* Attack Surface Section - Stacked Diamonds + Detail Panel */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-400 mb-4">
            Attack Surface Layers
          </h3>
          <StackedDiamonds
            selectedLayer={selectedLayer}
            onLayerClick={handleLayerClick}
          />
        </div>

        <div className="min-h-[240px]">
          {selectedLayer ? (
            <LayerDetailPanel
              layer={selectedLayer}
              onClose={() => setSelectedLayer(null)}
            />
          ) : (
            <div className="h-full flex items-center justify-center rounded-xl border-2 border-dashed border-gray-700/50 bg-gray-900/20 p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="text-lg text-gray-400 mb-2">Select a Layer</div>
                <div className="text-sm text-gray-500">
                  Click on a diamond or label to view
                  <br />
                  detailed threat information
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <InfoCard
          title="Security Controls"
          items={[
            {
              label: 'End-to-End Encryption',
              status: 'active',
            },
            {
              label: 'Command Authentication',
              status: 'active',
            },
            {
              label: 'Anti-Replay Protection',
              status: 'active',
            },
            {
              label: 'Anomaly Detection',
              status: 'active',
            },
            {
              label: 'Out-of-Band Recovery',
              status: 'standby',
            },
          ]}
        />
        <InfoCard
          title="Monitoring Points"
          items={[
            {
              label: 'MOC → C2 Link',
              status: 'monitoring',
            },
            {
              label: 'C2 → Gateway Link',
              status: 'monitoring',
            },
            {
              label: 'Gateway → Antenna Link',
              status: 'monitoring',
            },
            {
              label: 'RF Uplink Channel',
              status: 'monitoring',
            },
            {
              label: 'RF Downlink Channel',
              status: 'monitoring',
            },
          ]}
        />
      </div>
    </div>
  )
}
function InfoCard({
  title,
  items,
}: {
  title: string
  items: {
    label: string
    status: string
  }[]
}) {
  const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    standby: 'bg-yellow-500',
    monitoring: 'bg-blue-500',
    inactive: 'bg-gray-500',
  }
  return (
    <div className="rounded-xl p-5 bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm">
      <h4 className="text-sm font-medium text-white mb-4">{title}</h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{item.label}</span>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${statusColors[item.status] || 'bg-gray-500'} animate-pulse`}
              />
              <span className="text-[10px] text-gray-500 uppercase">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
