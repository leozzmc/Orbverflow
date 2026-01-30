import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  Component,
} from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Tooltip,
  Polyline,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Play, Pause, SkipBack, SkipForward, RotateCcw, X } from 'lucide-react'
// Satellite footprint radius in meters (approximately 200km coverage)
const FOOTPRINT_RADIUS = 200000
// Satellite icons
const SAT_ICON = new L.DivIcon({
  className: 'sat-marker',
  html: `<div style="width:12px;height:12px;border-radius:999px;background:#79ffa5;box-shadow:0 0 12px rgba(121,255,165,0.7)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})
const DEGRADED_ICON = new L.DivIcon({
  className: 'sat-marker-degraded',
  html: `<div style="width:12px;height:12px;border-radius:999px;background:#fbbf24;box-shadow:0 0 12px rgba(251,191,36,0.7)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})
const DOWN_ICON = new L.DivIcon({
  className: 'sat-marker-down',
  html: `<div style="width:12px;height:12px;border-radius:999px;background:#f87171;box-shadow:0 0 12px rgba(248,113,113,0.7)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})
const OUTOFBAND_ICON = new L.DivIcon({
  className: 'sat-marker-outofband',
  html: `<div style="width:12px;height:12px;border-radius:999px;background:#a855f7;box-shadow:0 0 12px rgba(168,85,247,0.7)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})
// Initial satellite positions around Taiwan - Real Flock satellite data
// Reference time range: 30/01/2026 14:50:11 UTC to 14:51:52 UTC (101 seconds)
// Initial positions calculated at 14:51:00 UTC (T+49s from start)
const INITIAL_SATELLITES = [
  {
    id: 'Flock 4g-14',
    lat: 25.912,
    lon: 117.0802,
    alt: 491.37,
    velLat: 0.0635,
    velLon: -0.0145,
  },
  {
    id: 'Flock 4g-32',
    lat: 23.6981,
    lon: 118.7943,
    alt: 466.88,
    velLat: 0.0642,
    velLon: -0.0142,
  },
  {
    id: 'Flock 4g-17',
    lat: 20.3357,
    lon: 117.6394,
    alt: 493.17,
    velLat: 0.0635,
    velLon: -0.0136,
  },
  {
    id: 'Flock 4g-16',
    lat: 20.3911,
    lon: 121.3309,
    alt: 443.06,
    velLat: 0.0642,
    velLon: -0.0137,
  },
  {
    id: 'Flock 4g-28',
    lat: 19.5924,
    lon: 123.0113,
    alt: 434.63,
    velLat: 0.0479,
    velLon: -0.0135,
  },
]
// Timeline phases for navigation
const PHASES = [
  {
    time: 0,
    label: 'Start',
  },
  {
    time: 1,
    label: 'Link Degradation',
  },
  {
    time: 5,
    label: 'Troubleshooting',
  },
  {
    time: 10,
    label: 'Threat Classified',
  },
  {
    time: 15,
    label: 'Playbook-04',
  },
  {
    time: 18,
    label: '4g-16 Down',
  },
  {
    time: 25,
    label: 'Transfer',
  },
]
function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 6)
  }, [])
  return null
}
// Satellite Footprint Circle Component
function SatelliteFootprint({
  satellite,
  isFlashing,
}: {
  satellite: any
  isFlashing: boolean
}) {
  const state = satellite.link_state
  // Determine footprint color based on state - increased fill opacity for better visibility
  let strokeColor = 'rgba(74, 222, 128, 0.7)' // Green for OK
  let fillColor = 'rgba(74, 222, 128, 0.15)'
  let strokeWeight = 1.5
  let fillOpacity = isFlashing ? 0.25 : 0.18
  if (state === 'DEGRADED') {
    strokeColor = 'rgba(251, 191, 36, 0.85)' // Yellow/amber for degraded
    fillColor = 'rgba(251, 191, 36, 0.2)'
    fillOpacity = isFlashing ? 0.35 : 0.25
  } else if (state === 'DOWN') {
    strokeColor = 'rgba(248, 113, 113, 0.9)' // Red for down
    fillColor = 'rgba(248, 113, 113, 0.25)'
    strokeWeight = 2
    fillOpacity = isFlashing ? 0.4 : 0.3
  } else if (state === 'OUTOFBAND') {
    strokeColor = 'rgba(168, 85, 247, 0.8)' // Purple for out-of-band
    fillColor = 'rgba(168, 85, 247, 0.18)'
    fillOpacity = 0.2
  }
  return (
    <Circle
      center={[satellite.lat, satellite.lon]}
      radius={FOOTPRINT_RADIUS}
      pathOptions={{
        color: strokeColor,
        fillColor: fillColor,
        weight: strokeWeight,
        fillOpacity: fillOpacity,
        opacity:
          isFlashing && (state === 'DEGRADED' || state === 'DOWN') ? 0.95 : 0.8,
      }}
    />
  )
}
// ISL Map Link Component - Animated line between satellites on the map
function ISLMapLink({
  sat1,
  sat2,
  isActive,
}: {
  sat1: any
  sat2: any
  isActive: boolean
}) {
  if (!isActive || !sat1 || !sat2) return null
  const positions: [number, number][] = [
    [sat1.lat, sat1.lon],
    [sat2.lat, sat2.lon],
  ]
  return (
    <>
      {/* Glow effect - wider, more transparent line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#22c55e',
          weight: 8,
          opacity: 0.3,
          lineCap: 'round',
        }}
      />
      {/* Main line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#4ade80',
          weight: 3,
          opacity: 0.9,
          lineCap: 'round',
          dashArray: '10, 5',
          className: 'isl-map-line-animated',
        }}
      />
      {/* Inner bright line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#86efac',
          weight: 1.5,
          opacity: 1,
          lineCap: 'round',
        }}
      />
    </>
  )
}
// Highlight Card Component
function HighlightCard({ text, visible }: { text: string; visible: boolean }) {
  if (!visible) return null
  return (
    <div className="rounded-xl p-4 bg-red-900/40 border border-red-500/50 backdrop-blur-sm">
      <div className="text-lg font-bold text-red-300">{text}</div>
    </div>
  )
}
// ISL Link Diagram Component - Updated to show 4g-17 (left), 4g-16 (center), 4g-28 (right)
function ISLLinkDiagram({
  visible,
  showCommandRelay,
  commandFlowActive,
  showDataTransfer,
}: {
  visible: boolean
  showCommandRelay: boolean
  commandFlowActive: boolean
  showDataTransfer: boolean
}) {
  if (!visible) return null
  return (
    <div className="rounded-xl p-5 bg-gray-900/50 border border-purple-500/30 backdrop-blur-sm">
      <div className="text-base font-medium text-purple-300 mb-4">
        ISL Tunnel Active
      </div>

      {/* Satellite Link Diagram: 4g-17 ↔ 4g-16 ↔ 4g-28 */}
      <div className="flex items-center justify-center gap-2 py-4">
        {/* Flock 4g-17 (Left) */}
        <div className="flex flex-col items-center relative">
          <div className="w-14 h-14 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <span className="text-[10px] font-bold text-purple-300 text-center leading-tight">
              4g-17
            </span>
          </div>
          {showCommandRelay && (
            <div className="mt-2 text-xs text-green-400 font-medium animate-pulse">
              Command Relay
            </div>
          )}
          {showDataTransfer && (
            <div className="absolute -top-2 -right-2">
              <div className="w-4 h-4 rounded-full bg-green-500 animate-ping opacity-75" />
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-400" />
            </div>
          )}
        </div>

        {/* ISL Link 17-16 */}
        <div className="flex flex-col items-center mx-1 relative">
          <div className="text-[10px] text-purple-400 font-medium mb-1">
            ISL
          </div>
          <div className="relative w-16 h-1">
            <div className="absolute inset-0 bg-purple-500/30 rounded-full" />
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div
                className={`h-full bg-gradient-to-r from-purple-500 via-purple-300 to-purple-500 rounded-full ${showDataTransfer ? 'animate-isl-data-right' : commandFlowActive ? 'animate-isl-flow-right' : 'animate-isl-glow'}`}
                style={{
                  width:
                    showDataTransfer || commandFlowActive ? '200%' : '100%',
                }}
              />
            </div>
            {showDataTransfer && (
              <>
                <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-data-packet-right" />
                <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-data-packet-right-delayed" />
              </>
            )}
          </div>
          {showDataTransfer ? (
            <div className="text-[10px] text-green-400 mt-1 font-medium">
              DATA →
            </div>
          ) : commandFlowActive ? (
            <div className="text-[10px] text-green-400 mt-1 animate-pulse">
              →
            </div>
          ) : null}
        </div>

        {/* Flock 4g-16 (Center) */}
        <div className="flex flex-col items-center relative">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center ${showDataTransfer ? 'bg-green-500/20 border-2 border-green-500 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 'bg-purple-500/20 border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]'}`}
          >
            <span
              className={`text-[10px] font-bold text-center leading-tight ${showDataTransfer ? 'text-green-300' : 'text-purple-300'}`}
            >
              4g-16
            </span>
          </div>
          <div
            className={`mt-2 text-xs font-medium ${showDataTransfer ? 'text-green-400' : 'text-purple-400'}`}
          >
            {showDataTransfer ? 'RELAY' : 'HUB'}
          </div>
        </div>

        {/* ISL Link 16-28 */}
        <div className="flex flex-col items-center mx-1 relative">
          <div className="text-[10px] text-purple-400 font-medium mb-1">
            ISL
          </div>
          <div className="relative w-16 h-1">
            <div className="absolute inset-0 bg-purple-500/30 rounded-full" />
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div
                className={`h-full bg-gradient-to-r from-purple-500 via-purple-300 to-purple-500 rounded-full ${showDataTransfer ? 'animate-isl-data-right' : commandFlowActive ? 'animate-isl-flow-right' : 'animate-isl-glow'}`}
                style={{
                  width:
                    showDataTransfer || commandFlowActive ? '200%' : '100%',
                }}
              />
            </div>
            {showDataTransfer && (
              <>
                <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-data-packet-right" />
                <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-data-packet-right-delayed" />
              </>
            )}
          </div>
          {showDataTransfer ? (
            <div className="text-[10px] text-green-400 mt-1 font-medium">
              DATA →
            </div>
          ) : commandFlowActive ? (
            <div className="text-[10px] text-green-400 mt-1 animate-pulse">
              →
            </div>
          ) : null}
        </div>

        {/* Flock 4g-28 (Right) */}
        <div className="flex flex-col items-center relative">
          <div className="w-14 h-14 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <span className="text-[10px] font-bold text-purple-300 text-center leading-tight">
              4g-28
            </span>
          </div>
          {showCommandRelay && (
            <div className="mt-2 text-xs text-green-400 font-medium animate-pulse">
              Command Relay
            </div>
          )}
          {showDataTransfer && (
            <div className="absolute -top-2 -left-2">
              <div className="w-4 h-4 rounded-full bg-green-500 animate-ping opacity-75" />
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-400" />
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-2">
        {showDataTransfer
          ? 'Mission data being relayed via ISL: 4g-17 → 4g-16 → 4g-28'
          : 'Inter-Satellite Link (ISL) providing out-of-band communication'}
      </div>
    </div>
  )
}
// Confirmation Modal Component
function ConfirmationModal({
  visible,
  playbookId,
  onConfirm,
  onCancel,
}: {
  visible: boolean
  playbookId: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState(false)
  const handleConfirm = () => {
    if (inputValue === 'Action Approve') {
      setInputValue('')
      setError(false)
      onConfirm()
    } else {
      setError(true)
    }
  }
  const handleCancel = () => {
    setInputValue('')
    setError(false)
    onCancel()
  }
  if (!visible) return null
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Confirm Action</h3>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <p className="text-gray-300 mb-4">
          To approve{' '}
          <span className="font-bold text-blue-400">{playbookId}</span>, please
          type{' '}
          <span className="font-mono bg-gray-800 px-2 py-0.5 rounded text-yellow-400">
            Action Approve
          </span>{' '}
          below:
        </p>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setError(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm()
          }}
          placeholder="Type 'Action Approve'"
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white font-mono focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500'}`}
          autoFocus
        />

        {error && (
          <p className="text-red-400 text-sm mt-2">
            Please type exactly "Action Approve" to confirm.
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
export default function ScenarioDemoPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [demoCompleted, setDemoCompleted] = useState(false)
  const [satellites, setSatellites] = useState(
    INITIAL_SATELLITES.map((s) => ({
      ...s,
      link_state: 'OK',
      snr_db: 15 + Math.random() * 10,
      packet_loss_pct: Math.random() * 5,
    })),
  )
  // Boot log style message system
  const [bootLogs, setBootLogs] = useState<string[]>([])
  const [showBootLog, setShowBootLog] = useState(false)
  const [bootLogTitle, setBootLogTitle] = useState('')
  // Highlight card for important messages
  const [highlightText, setHighlightText] = useState('')
  const [showHighlight, setShowHighlight] = useState(false)
  const [showJammingCircle, setShowJammingCircle] = useState(false)
  const [jammingSource, setJammingSource] = useState<{
    lat: number
    lon: number
    radius: number
  } | null>(null)
  // Estimated jamming source zone
  const [showJammingZone, setShowJammingZone] = useState(false)
  const [jammingZone, setJammingZone] = useState<{
    lat: number
    lon: number
    radius: number
  } | null>(null)
  const [proposedPlaybooks, setProposedPlaybooks] = useState<any[]>([])
  // ISL Link states
  const [showISLDiagram, setShowISLDiagram] = useState(false)
  const [showCommandRelay, setShowCommandRelay] = useState(false)
  const [commandFlowActive, setCommandFlowActive] = useState(false)
  const [showDataTransfer, setShowDataTransfer] = useState(false)
  // ISL Map Lines state
  const [showISLMapLines, setShowISLMapLines] = useState(false)
  const [playbookActionLogs, setPlaybookActionLogs] = useState<string[]>([])
  const [showPlaybookActions, setShowPlaybookActions] = useState(false)
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingPlaybookId, setPendingPlaybookId] = useState('')
  // Footprint flashing state
  const [footprintFlash, setFootprintFlash] = useState(false)
  // Track which events have been triggered to prevent re-triggering
  const triggeredEventsRef = useRef<Set<number>>(new Set())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const bootLogTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const flashIntervalRef = useRef<NodeJS.Timeout | null>(null)
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  // Clear all boot log timeouts
  const clearBootLogTimeouts = useCallback(() => {
    bootLogTimeoutsRef.current.forEach((t) => clearTimeout(t))
    bootLogTimeoutsRef.current = []
  }, [])
  // Show boot log with title - stable version
  const showBootLogWithTitle = useCallback(
    (title: string, messages: string[], interval = 800) => {
      clearBootLogTimeouts()
      setBootLogTitle(title)
      setBootLogs([])
      setShowBootLog(true)
      messages.forEach((msg, i) => {
        const timeout = setTimeout(() => {
          setBootLogs((prev) => [...prev, msg])
        }, i * interval)
        bootLogTimeoutsRef.current.push(timeout)
      })
    },
    [clearBootLogTimeouts],
  )
  // Start footprint flashing
  const startFootprintFlashing = useCallback(() => {
    if (flashIntervalRef.current) clearInterval(flashIntervalRef.current)
    flashIntervalRef.current = setInterval(() => {
      setFootprintFlash((prev) => !prev)
    }, 500)
  }, [])
  // Stop footprint flashing
  const stopFootprintFlashing = useCallback(() => {
    if (flashIntervalRef.current) {
      clearInterval(flashIntervalRef.current)
      flashIntervalRef.current = null
    }
    setFootprintFlash(false)
  }, [])
  // Reset demo state
  const resetDemo = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animationRef.current) clearInterval(animationRef.current)
    clearBootLogTimeouts()
    stopFootprintFlashing()
    triggeredEventsRef.current = new Set()
    setIsRunning(false)
    setIsPaused(false)
    setElapsedTime(0)
    setDemoCompleted(false)
    setShowJammingCircle(false)
    setJammingSource(null)
    setShowJammingZone(false)
    setJammingZone(null)
    setProposedPlaybooks([])
    setShowISLDiagram(false)
    setShowCommandRelay(false)
    setCommandFlowActive(false)
    setShowDataTransfer(false)
    setShowISLMapLines(false)
    setBootLogs([])
    setShowBootLog(false)
    setBootLogTitle('')
    setPlaybookActionLogs([])
    setShowPlaybookActions(false)
    setHighlightText('')
    setShowHighlight(false)
    setShowConfirmModal(false)
    setPendingPlaybookId('')
    setSatellites(
      INITIAL_SATELLITES.map((s) => ({
        ...s,
        link_state: 'OK',
        snr_db: 15 + Math.random() * 10,
        packet_loss_pct: Math.random() * 5,
      })),
    )
  }, [clearBootLogTimeouts, stopFootprintFlashing])
  // Start the demo scenario
  const startDemo = () => {
    resetDemo()
    setIsRunning(true)
    setIsPaused(false)
    showBootLogWithTitle('', ['Demo Start...'], 500)
    setTimeout(() => setShowBootLog(false), 1500)
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)
  }
  // Toggle pause
  const togglePause = () => {
    if (isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    setIsPaused(!isPaused)
  }
  // Jump to specific phase
  const jumpToPhase = (targetTime: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    const newTriggered = new Set<number>()
    triggeredEventsRef.current.forEach((t) => {
      if (t < targetTime) newTriggered.add(t)
    })
    triggeredEventsRef.current = newTriggered
    setElapsedTime(targetTime)
    applyStateForTime(targetTime)
    if (!isPaused && isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    }
  }
  // Go to previous phase
  const prevPhase = () => {
    const currentPhaseIndex = PHASES.findIndex(
      (p, i) =>
        i === PHASES.length - 1 ||
        (elapsedTime >= p.time && elapsedTime < PHASES[i + 1].time),
    )
    if (currentPhaseIndex > 0) {
      jumpToPhase(PHASES[currentPhaseIndex - 1].time)
    }
  }
  // Go to next phase
  const nextPhase = () => {
    const currentPhaseIndex = PHASES.findIndex(
      (p, i) =>
        i === PHASES.length - 1 ||
        (elapsedTime >= p.time && elapsedTime < PHASES[i + 1].time),
    )
    if (currentPhaseIndex < PHASES.length - 1) {
      jumpToPhase(PHASES[currentPhaseIndex + 1].time)
    }
  }
  // Apply state for a specific time (used when jumping to phases)
  const applyStateForTime = (time: number) => {
    clearBootLogTimeouts()
    setShowJammingCircle(false)
    setJammingSource(null)
    setShowJammingZone(false)
    setJammingZone(null)
    setProposedPlaybooks([])
    setBootLogs([])
    setShowBootLog(false)
    setShowHighlight(false)
    if (time >= 1) {
      // Start footprint flashing for degraded satellites
      startFootprintFlashing()
      setSatellites((prev) =>
        prev.map((s) => {
          // Flock 4g-14 always stays OK
          if (s.id === 'Flock 4g-14') {
            return {
              ...s,
              link_state: 'OK',
              snr_db: 15 + Math.random() * 10,
              packet_loss_pct: Math.random() * 5,
            }
          }
          // Flock 4g-16 goes DOWN at T+18s
          if (s.id === 'Flock 4g-16' && time >= 18) {
            return {
              ...s,
              link_state: 'DOWN',
              snr_db: 0,
              packet_loss_pct: 100,
            }
          } else {
            return {
              ...s,
              link_state: 'DEGRADED',
              snr_db: Math.random() * 7,
              packet_loss_pct: 70 + Math.random() * 23,
            }
          }
        }),
      )
      if (time >= 1 && time < 5) {
        showBootLogWithTitle(
          'Link Degradation Detected',
          [
            'Satellites link degradation detected',
            '4 LEO satellites reporting packet loss',
            'Flock 4g-14 unaffected - outside impact zone',
            'Forming cluster....',
            'SNR drop detected across cluster',
          ],
          800,
        )
      }
    } else {
      stopFootprintFlashing()
      setSatellites(
        INITIAL_SATELLITES.map((s) => ({
          ...s,
          link_state: 'OK',
          snr_db: 15 + Math.random() * 10,
          packet_loss_pct: Math.random() * 5,
        })),
      )
    }
    if (time >= 5 && time < 10) {
      showBootLogWithTitle(
        'Troubleshooting',
        [
          'Cluster engine troubleshooting...',
          'Checking onboard computer issues...',
          'Checking consistency within the cluster...',
          'Hardware fault ruled out',
        ],
        1000,
      )
    }
    if (time >= 10) {
      setShowJammingCircle(true)
      setJammingSource({
        lat: 23.5,
        lon: 120.5,
        radius: 500000,
      })
      // Show estimated jamming source zone
      setShowJammingZone(true)
      setJammingZone({
        lat: 21.5,
        lon: 120.0,
        radius: 150000,
      })
      if (time >= 10 && time < 15) {
        showBootLogWithTitle(
          'Threat Analysis',
          [
            'Threat classified = Ground-based wideband jamming',
            'Threat triangulation complete',
            'Estimated jamming source location identified',
          ],
          800,
        )
        setTimeout(() => {
          setHighlightText('Impact radius = 500 km (confidence: 0.87)')
          setShowHighlight(true)
        }, 3200)
      } else {
        setHighlightText('Impact radius = 500 km (confidence: 0.87)')
        setShowHighlight(true)
      }
    }
    if (time >= 15 && time < 25) {
      setShowBootLog(false)
      setShowHighlight(false)
      const playbooks = []
      playbooks.push({
        id: 'Playbook-04',
        name: 'Availability / Degrade Response',
        state: 'PROPOSED',
        actions: [
          'Activate out-of-band relay (ISL tunnel)',
          'RF downlink degrade (graceful degradation)',
          'Reduce payload transmission rate',
          'Prioritize critical telemetry channels',
        ],
      })
      if (time >= 18) {
        playbooks.push({
          id: 'Playbook-07',
          name: 'Mission Continuity Protocol',
          state: 'PROPOSED',
          actions: [
            'Publish mission state summary (signed + anti-replay)',
            'Select candidate replacement satellites (Flock 4g-17 / Flock 4g-28)',
            'Recommend switching window and degradation strategy',
          ],
        })
      }
      setProposedPlaybooks(playbooks)
    }
  }
  // Handle time-based events
  useEffect(() => {
    if (!isRunning || isPaused) return
    const triggerEvent = (time: number, callback: () => void) => {
      if (elapsedTime === time && !triggeredEventsRef.current.has(time)) {
        triggeredEventsRef.current.add(time)
        callback()
      }
    }
    // T+1s: Satellites link degradation (except Flock 4g-14)
    triggerEvent(1, () => {
      startFootprintFlashing()
      setSatellites((prev) =>
        prev.map((s) => {
          // Flock 4g-14 always stays OK
          if (s.id === 'Flock 4g-14') {
            return s // Keep current OK state
          }
          return {
            ...s,
            link_state: 'DEGRADED',
            snr_db: 5 + Math.random() * 2,
            packet_loss_pct: 70 + Math.random() * 23,
          }
        }),
      )
      showBootLogWithTitle(
        'Link Degradation Detected',
        [
          'Satellites link degradation detected',
          '4 LEO satellites reporting packet loss',
          'Flock 4g-14 unaffected - outside impact zone',
          'Forming cluster....',
          'SNR drop detected across cluster',
        ],
        800,
      )
    })
    // T+5s: Troubleshooting
    triggerEvent(5, () => {
      showBootLogWithTitle(
        'Troubleshooting',
        [
          'Cluster engine troubleshooting...',
          'Checking onboard computer issues...',
          'Checking consistency within the cluster...',
          'Hardware fault ruled out',
        ],
        1000,
      )
    })
    // T+10s: Threat classified
    triggerEvent(10, () => {
      setShowJammingCircle(true)
      setJammingSource({
        lat: 23.5,
        lon: 120.5,
        radius: 500000,
      })
      // Show estimated jamming source zone
      setShowJammingZone(true)
      setJammingZone({
        lat: 21.5,
        lon: 120.0,
        radius: 150000,
      })
      showBootLogWithTitle(
        'Threat Analysis',
        [
          'Threat classified = Ground-based wideband jamming',
          'Threat triangulation complete',
          'Estimated jamming source location identified',
        ],
        800,
      )
      setTimeout(() => {
        setHighlightText('Impact radius = 500 km (confidence: 0.87)')
        setShowHighlight(true)
      }, 3200)
    })
    // T+15s: Suggest Playbook-04
    triggerEvent(15, () => {
      setShowBootLog(false)
      setShowHighlight(false)
      setProposedPlaybooks([
        {
          id: 'Playbook-04',
          name: 'Availability / Degrade Response',
          state: 'PROPOSED',
          actions: [
            'Activate out-of-band relay (ISL tunnel)',
            'RF downlink degrade (graceful degradation)',
            'Reduce payload transmission rate',
            'Prioritize critical telemetry channels',
          ],
        },
      ])
    })
    // T+18s: Flock 4g-16 Down, Playbook-07
    triggerEvent(18, () => {
      setSatellites((prev) =>
        prev.map((s) =>
          s.id === 'Flock 4g-16'
            ? {
                ...s,
                link_state: 'DOWN',
                snr_db: 0,
                packet_loss_pct: 100,
              }
            : s,
        ),
      )
      setProposedPlaybooks((prev) => [
        ...prev,
        {
          id: 'Playbook-07',
          name: 'Mission Continuity Protocol',
          state: 'PROPOSED',
          actions: [
            'Publish mission state summary (signed + anti-replay)',
            'Select candidate replacement satellites (Flock 4g-17 / Flock 4g-28)',
            'Recommend switching window and degradation strategy',
          ],
        },
      ])
    })
  }, [
    elapsedTime,
    isRunning,
    isPaused,
    showBootLogWithTitle,
    startFootprintFlashing,
  ])
  // Request playbook approval
  const requestApproval = (id: string) => {
    setPendingPlaybookId(id)
    setShowConfirmModal(true)
  }
  // Confirm playbook approval
  const confirmApproval = () => {
    setShowConfirmModal(false)
    approvePlaybook(pendingPlaybookId)
    setPendingPlaybookId('')
  }
  // Cancel approval
  const cancelApproval = () => {
    setShowConfirmModal(false)
    setPendingPlaybookId('')
  }
  // Approve playbook with boot log style actions
  const approvePlaybook = (id: string) => {
    const playbook = proposedPlaybooks.find((p) => p.id === id)
    if (!playbook) return
    setProposedPlaybooks((prev) => prev.filter((p) => p.id !== id))
    // Show actions in boot log style
    setShowPlaybookActions(true)
    setPlaybookActionLogs([`Executing ${id}...`])
    playbook.actions.forEach((action: string, i: number) => {
      setTimeout(
        () => {
          setPlaybookActionLogs((prev) => [...prev, `> ${action}`])
        },
        (i + 1) * 600,
      )
    })
    setTimeout(
      () => {
        setPlaybookActionLogs((prev) => [
          ...prev,
          `✓ ${id} executed successfully`,
        ])
      },
      (playbook.actions.length + 1) * 600,
    )
    if (id === 'Playbook-04') {
      // After Playbook-04: Switch to OUTOFBAND and show ISL diagram
      setTimeout(
        () => {
          stopFootprintFlashing()
          // Change satellites to OUTOFBAND (except Flock 4g-14 which stays OK)
          setSatellites((prev) =>
            prev.map((s) => {
              if (s.id === 'Flock 4g-14') {
                return {
                  ...s,
                  link_state: 'OK',
                  snr_db: 15 + Math.random() * 10,
                  packet_loss_pct: Math.random() * 5,
                }
              }
              return {
                ...s,
                link_state: 'OUTOFBAND',
                snr_db: 18 + Math.random() * 7,
                packet_loss_pct: Math.random() * 3,
              }
            }),
          )
          // Show ISL diagram and hide jamming highlight
          setShowISLDiagram(true)
          setShowHighlight(false)
          setShowPlaybookActions(false)
        },
        (playbook.actions.length + 2) * 600,
      )
    } else if (id === 'Playbook-07') {
      // After Playbook-07: Show command relay and boot logs
      setTimeout(
        () => {
          setShowPlaybookActions(false)
          setShowCommandRelay(true)
          setCommandFlowActive(true)
          // Show command relay activation boot logs - Updated for 4g-17, 4g-16, 4g-28
          showBootLogWithTitle(
            'Command Relay Mode Activation',
            [
              'Activating Out-of-band tunnel...',
              'Establishing secure ISL channel...',
              'Flock 4g-17: Initiating command relay...',
              'Flock 4g-16: Configuring as relay hub...',
              'Flock 4g-28: Initiating command relay...',
              'Routing commands via ISL mesh...',
              'Validating relay parameters...',
              'All relay nodes synchronized',
              '✓ Command Relay Mode Activated',
            ],
            800,
          )
          // After boot log completes, show data transfer animation and ISL map lines
          setTimeout(
            () => {
              setShowDataTransfer(true)
              setShowISLMapLines(true)
              setCommandFlowActive(false)
            },
            9 * 800 + 500,
          )
          // Complete demo after data transfer shows
          setTimeout(
            () => {
              if (timerRef.current) clearInterval(timerRef.current)
              setDemoCompleted(true)
              setElapsedTime(0)
              setIsRunning(false)
            },
            9 * 800 + 2500,
          )
        },
        (playbook.actions.length + 2) * 600,
      )
    }
  }
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationRef.current) clearInterval(animationRef.current)
      if (flashIntervalRef.current) clearInterval(flashIntervalRef.current)
      clearBootLogTimeouts()
    }
  }, [clearBootLogTimeouts])
  // Move satellites animation AND update telemetry values
  useEffect(() => {
    if (!isRunning || isPaused) return
    animationRef.current = setInterval(() => {
      setSatellites((prev) =>
        prev.map((s) => {
          // Use real velocity data - animation runs every 300ms (0.3 seconds)
          const timeScale = 0.3
          const newLat = s.lat + (s.velLat || 0) * timeScale
          const newLon = s.lon + (s.velLon || 0) * timeScale
          let newSnr = s.snr_db
          let newLoss = s.packet_loss_pct
          // Flock 4g-14 always maintains OK state values
          if (s.id === 'Flock 4g-14' && s.link_state === 'OK') {
            newSnr = 15 + Math.random() * 10
            newLoss = Math.random() * 5
          } else if (s.link_state === 'OK') {
            newSnr = 15 + Math.random() * 10
            newLoss = Math.random() * 5
          } else if (s.link_state === 'DEGRADED') {
            newSnr = Math.max(
              0,
              Math.min(7, s.snr_db - 0.1 + (Math.random() - 0.6) * 0.5),
            )
            newLoss = 70 + Math.random() * 23
          } else if (s.link_state === 'DOWN') {
            newSnr = 0
            newLoss = 100
          } else if (s.link_state === 'OUTOFBAND') {
            newSnr = 18 + Math.random() * 7
            newLoss = Math.random() * 3
          }
          return {
            ...s,
            lat: newLat,
            lon: newLon,
            snr_db: newSnr,
            packet_loss_pct: newLoss,
          }
        }),
      )
    }, 300)
    return () => {
      if (animationRef.current) clearInterval(animationRef.current)
    }
  }, [isRunning, isPaused])
  const getIcon = (state: string) => {
    if (state === 'DOWN') return DOWN_ICON
    if (state === 'DEGRADED') return DEGRADED_ICON
    if (state === 'OUTOFBAND') return OUTOFBAND_ICON
    return SAT_ICON
  }
  // Get satellites for ISL map lines
  const sat4g17 = satellites.find((s) => s.id === 'Flock 4g-17')
  const sat4g16 = satellites.find((s) => s.id === 'Flock 4g-16')
  const sat4g28 = satellites.find((s) => s.id === 'Flock 4g-28')
  return (
    <div className="animate-fade-in">
      <style>{`
        @keyframes isl-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes isl-flow-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes isl-flow-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes isl-data-right {
          0% { transform: translateX(-50%); background: linear-gradient(to right, #22c55e, #4ade80, #22c55e); }
          100% { transform: translateX(0%); background: linear-gradient(to right, #22c55e, #4ade80, #22c55e); }
        }
        @keyframes isl-data-left {
          0% { transform: translateX(0%); background: linear-gradient(to right, #22c55e, #4ade80, #22c55e); }
          100% { transform: translateX(-50%); background: linear-gradient(to right, #22c55e, #4ade80, #22c55e); }
        }
        @keyframes data-packet-right {
          0% { left: 0%; opacity: 1; }
          100% { left: 100%; opacity: 0.5; }
        }
        @keyframes data-packet-left {
          0% { right: 0%; opacity: 1; }
          100% { right: 100%; opacity: 0.5; }
        }
        @keyframes footprint-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes isl-line-dash {
          0% { stroke-dashoffset: 30; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-isl-glow {
          animation: isl-glow 1.5s ease-in-out infinite;
        }
        .animate-isl-flow-right {
          animation: isl-flow-right 1s linear infinite;
        }
        .animate-isl-flow-left {
          animation: isl-flow-left 1s linear infinite;
        }
        .animate-isl-data-right {
          animation: isl-data-right 0.8s linear infinite;
          background: linear-gradient(to right, #22c55e, #4ade80, #22c55e) !important;
        }
        .animate-isl-data-left {
          animation: isl-data-left 0.8s linear infinite;
          background: linear-gradient(to right, #22c55e, #4ade80, #22c55e) !important;
        }
        .animate-data-packet-right {
          animation: data-packet-right 0.6s linear infinite;
        }
        .animate-data-packet-right-delayed {
          animation: data-packet-right 0.6s linear infinite;
          animation-delay: 0.3s;
        }
        .animate-data-packet-left {
          animation: data-packet-left 0.6s linear infinite;
        }
        .animate-data-packet-left-delayed {
          animation: data-packet-left 0.6s linear infinite;
          animation-delay: 0.3s;
        }
        .footprint-flash {
          animation: footprint-pulse 0.5s ease-in-out infinite;
        }
        .isl-map-line-animated {
          animation: isl-line-dash 1s linear infinite;
        }
      `}</style>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        playbookId={pendingPlaybookId}
        onConfirm={confirmApproval}
        onCancel={cancelApproval}
      />

      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-medium tracking-tight text-white">
          Scenario Demo
        </h2>

        <div className="flex items-center gap-2">
          {!isRunning && !demoCompleted && (
            <button
              onClick={startDemo}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center gap-2"
            >
              <Play size={16} />
              Start Demo
            </button>
          )}

          {isRunning && (
            <>
              <button
                onClick={prevPhase}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                title="Previous Phase"
              >
                <SkipBack size={16} />
              </button>

              <button
                onClick={togglePause}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isPaused ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-yellow-600 hover:bg-yellow-500 text-white'}`}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>

              <button
                onClick={nextPhase}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                title="Next Phase"
              >
                <SkipForward size={16} />
              </button>
            </>
          )}

          {demoCompleted && (
            <button
              onClick={resetDemo}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Restart Demo
            </button>
          )}
        </div>
      </div>

      {/* Phase indicators */}
      {isRunning && (
        <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
          {PHASES.map((phase, i) => (
            <button
              key={phase.time}
              onClick={() => jumpToPhase(phase.time)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${elapsedTime >= phase.time && (i === PHASES.length - 1 || elapsedTime < PHASES[i + 1].time) ? 'bg-blue-600 text-white' : elapsedTime >= phase.time ? 'bg-gray-600 text-gray-300' : 'bg-gray-800 text-gray-500'}`}
            >
              T+{phase.time}s: {phase.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* Left Side: Map + Telemetry */}
        <div className="space-y-4">
          {/* Map */}
          <div className="rounded-xl overflow-hidden border border-gray-800/50 bg-gray-900/50 backdrop-blur-sm h-[400px]">
            <MapContainer
              center={[23.7, 121.0]}
              zoom={6}
              style={{
                height: '100%',
                width: '100%',
                background: '#050713',
              }}
            >
              <TileLayer
                attribution="Tiles © Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <MapController center={[23.7, 121.0]} />

              {/* ISL Map Lines - between 4g-17, 4g-16, and 4g-28 */}
              <ISLMapLink
                sat1={sat4g17}
                sat2={sat4g16}
                isActive={showISLMapLines}
              />
              <ISLMapLink
                sat1={sat4g16}
                sat2={sat4g28}
                isActive={showISLMapLines}
              />

              {/* Satellite Footprints */}
              {satellites.map((s) => (
                <SatelliteFootprint
                  key={`footprint-${s.id}`}
                  satellite={s}
                  isFlashing={footprintFlash}
                />
              ))}

              {/* Satellite Markers */}
              {satellites.map((s) => (
                <Marker
                  key={s.id}
                  position={[s.lat, s.lon]}
                  icon={getIcon(s.link_state)}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                    <div className="font-mono text-xs p-1">
                      <div>
                        <b>{s.id}</b> ({s.link_state})
                      </div>
                      <div>snr: {s.snr_db.toFixed(1)}</div>
                      <div>loss: {s.packet_loss_pct.toFixed(0)}%</div>
                    </div>
                  </Tooltip>
                </Marker>
              ))}

              {/* Estimated Jamming Source Zone (Orange) */}
              {showJammingZone && jammingZone && (
                <Circle
                  center={[jammingZone.lat, jammingZone.lon]}
                  radius={jammingZone.radius}
                  pathOptions={{
                    color: 'rgba(251, 146, 60, 0.9)',
                    fillColor: 'rgba(251, 146, 60, 0.3)',
                    weight: 3,
                    dashArray: '5, 5',
                  }}
                >
                  <Tooltip direction="center" permanent>
                    <div className="font-mono text-xs text-orange-600 font-bold text-center">
                      Estimated Jamming
                      <br />
                      Source Zone
                      <br />
                      Radius: 150km
                      <br />
                      Confidence: 0.87
                    </div>
                  </Tooltip>
                </Circle>
              )}

              {/* Jamming Impact Circle (Red) */}
              {showJammingCircle && jammingSource && (
                <Circle
                  center={[jammingSource.lat, jammingSource.lon]}
                  radius={jammingSource.radius}
                  pathOptions={{
                    color: 'rgba(255,80,80,0.9)',
                    fillColor: 'rgba(255,80,80,0.15)',
                    weight: 2,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -200]} permanent>
                    <div className="font-mono text-xs text-red-600 font-bold">
                      Jamming Impact Zone
                      <br />
                      Radius: 500km
                    </div>
                  </Tooltip>
                </Circle>
              )}
            </MapContainer>
          </div>

          {/* Satellite Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {satellites.slice(0, 5).map((s) => (
              <SatCard key={s.id} s={s} />
            ))}
          </div>

          {/* Status Legend */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-900/50 border border-gray-800/50">
            <span className="text-xs text-gray-400 font-medium">Status:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
              <span className="text-xs text-gray-300">OK</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)]" />
              <span className="text-xs text-gray-300">DEGRADED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]" />
              <span className="text-xs text-gray-300">DOWN</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
              <span className="text-xs text-gray-300">OUT-OF-BAND</span>
            </div>
          </div>

          {/* Data Reference Timestamp */}
          <div className="text-center text-xs text-gray-500 font-mono">
            Reference Data: 30/01/2026 14:50:11 UTC - 14:51:52 UTC
          </div>
        </div>

        {/* Right Side: Timer + Event Cards + Playbooks */}
        <div className="space-y-4">
          {/* Timer */}
          <div className="rounded-xl p-4 bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm">
            <div className="text-sm text-gray-400 mb-1">Response Time</div>
            <div className="text-4xl font-mono font-bold text-white">
              {formatTime(elapsedTime)}
            </div>
            {isPaused && (
              <div className="text-xs text-yellow-400 mt-1 animate-pulse">
                PAUSED
              </div>
            )}
          </div>

          {/* ISL Link Diagram - moved above boot log */}
          <ISLLinkDiagram
            visible={showISLDiagram}
            showCommandRelay={showCommandRelay}
            commandFlowActive={commandFlowActive}
            showDataTransfer={showDataTransfer}
          />

          {/* Boot Log Style Messages */}
          {showBootLog && bootLogs.length > 0 && (
            <div className="rounded-xl p-4 bg-gray-900/80 border border-gray-700/50 backdrop-blur-sm">
              {bootLogTitle && (
                <div className="text-base font-medium text-white mb-3">
                  {bootLogTitle}
                </div>
              )}
              <div className="bg-black/60 rounded-lg p-3 font-mono text-sm text-green-400 space-y-1 max-h-[200px] overflow-auto">
                {bootLogs.map((log, i) => (
                  <div key={i} className="animate-fade-in">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlight Card */}
          <HighlightCard text={highlightText} visible={showHighlight} />

          {/* Playbook Action Logs */}
          {showPlaybookActions && playbookActionLogs.length > 0 && (
            <div className="rounded-xl p-4 bg-gray-900/80 border border-blue-500/30 backdrop-blur-sm">
              <div className="bg-black/60 rounded-lg p-3 font-mono text-sm text-blue-400 space-y-1 max-h-[200px] overflow-auto">
                {playbookActionLogs.map((log, i) => (
                  <div key={i} className="animate-fade-in">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proposed Playbooks */}
          {proposedPlaybooks.length > 0 && (
            <div className="space-y-3">
              <div className="text-base font-medium text-gray-300">
                Proposed Playbooks
              </div>
              {proposedPlaybooks.map((pb) => (
                <div
                  key={pb.id}
                  className="rounded-xl p-5 bg-gray-900/50 border border-blue-500/30 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-bold text-white">{pb.id}</div>
                    <span className="text-sm px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {pb.state}
                    </span>
                  </div>
                  <div className="text-base text-gray-300 mb-4">{pb.name}</div>

                  <div className="mb-4">
                    <div className="text-sm uppercase text-gray-500 mb-2 font-medium">
                      Actions
                    </div>
                    <ul className="text-sm text-gray-300 space-y-2">
                      {pb.actions.map((action: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="text-blue-400 mr-2 mt-0.5">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => requestApproval(pb.id)}
                    className="w-full py-3 px-4 rounded-lg text-base font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all hover:scale-[1.02]"
                  >
                    Approve Playbook
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Demo Complete Message */}
          {demoCompleted && (
            <div className="rounded-xl p-5 bg-green-900/30 border border-green-500/30 backdrop-blur-sm text-center">
              <div className="text-xl font-bold text-green-400 mb-2">
                ✓ Demo Complete
              </div>
              <div className="text-base text-gray-300">
                Mission successfully transferred via ISL out-of-band
                communication
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
function SatCard({ s }: { s: any }) {
  const state = String(s.link_state ?? 'UNKNOWN')
  let dotColor = 'bg-gray-400'
  if (state === 'OK')
    dotColor = 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]'
  else if (state === 'DEGRADED')
    dotColor = 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]'
  else if (state === 'DOWN')
    dotColor = 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]'
  else if (state === 'OUTOFBAND')
    dotColor = 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]'
  return (
    <div className="rounded-xl p-2 bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm hover:bg-gray-800/60 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-bold text-white">{s.id}</div>
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      </div>
      <div className="space-y-0.5 text-[10px] font-mono">
        <div className="flex justify-between">
          <span className="text-gray-400">state</span>
          <b className="text-gray-200">{state}</b>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">snr</span>
          <b className="text-gray-200">{s.snr_db?.toFixed(1) ?? '-'}</b>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">loss</span>
          <b className="text-gray-200">
            {s.packet_loss_pct?.toFixed(0) ?? '-'}%
          </b>
        </div>
      </div>
    </div>
  )
}
