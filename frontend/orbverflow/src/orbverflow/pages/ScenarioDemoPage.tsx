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
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Play, Pause, SkipBack, SkipForward, RotateCcw, X } from 'lucide-react'
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
// Initial satellite positions around Taiwan
const INITIAL_SATELLITES = [
  {
    id: 'SatA',
    lat: 22.5,
    lon: 118.5,
    orbit: 1,
  },
  {
    id: 'SatB',
    lat: 23.5,
    lon: 119.5,
    orbit: 1,
  },
  {
    id: 'SatC',
    lat: 25.0,
    lon: 122.0,
    orbit: 2,
  },
  {
    id: 'SatD',
    lat: 24.0,
    lon: 123.0,
    orbit: 2,
  },
  {
    id: 'SatE',
    lat: 23.0,
    lon: 124.0,
    orbit: 2,
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
    label: 'SatB Down',
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
// Highlight Card Component
function HighlightCard({ text, visible }: { text: string; visible: boolean }) {
  if (!visible) return null
  return (
    <div className="rounded-xl p-4 bg-red-900/40 border border-red-500/50 backdrop-blur-sm">
      <div className="text-lg font-bold text-red-300">{text}</div>
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
      packet_loss_pct: Math.random() * 5, // OK state: 0-5%
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
  const [proposedPlaybooks, setProposedPlaybooks] = useState<any[]>([])
  const [showTransferProgress, setShowTransferProgress] = useState(false)
  const [transferProgress, setTransferProgress] = useState(0)
  const [transferLogs, setTransferLogs] = useState<string[]>([])
  const [playbookActionLogs, setPlaybookActionLogs] = useState<string[]>([])
  const [showPlaybookActions, setShowPlaybookActions] = useState(false)
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingPlaybookId, setPendingPlaybookId] = useState('')
  // Track which events have been triggered to prevent re-triggering
  const triggeredEventsRef = useRef<Set<number>>(new Set())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const transferRef = useRef<NodeJS.Timeout | null>(null)
  const bootLogTimeoutsRef = useRef<NodeJS.Timeout[]>([])
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
      // Clear any existing timeouts
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
  // Reset demo state
  const resetDemo = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animationRef.current) clearInterval(animationRef.current)
    if (transferRef.current) clearInterval(transferRef.current)
    clearBootLogTimeouts()
    // Reset triggered events
    triggeredEventsRef.current = new Set()
    setIsRunning(false)
    setIsPaused(false)
    setElapsedTime(0)
    setDemoCompleted(false)
    setShowJammingCircle(false)
    setJammingSource(null)
    setProposedPlaybooks([])
    setShowTransferProgress(false)
    setTransferProgress(0)
    setTransferLogs([])
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
        packet_loss_pct: Math.random() * 5, // OK state: 0-5%
      })),
    )
  }, [clearBootLogTimeouts])
  // Start the demo scenario
  const startDemo = () => {
    resetDemo()
    setIsRunning(true)
    setIsPaused(false)
    // Show "Demo Start" boot log
    showBootLogWithTitle('', ['Demo Start...'], 500)
    setTimeout(() => setShowBootLog(false), 1500)
    // Start timer
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
    // Clear triggered events for times >= targetTime so they can re-trigger
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
    setProposedPlaybooks([])
    setShowTransferProgress(false)
    setBootLogs([])
    setShowBootLog(false)
    setShowHighlight(false)
    if (time >= 1) {
      setSatellites((prev) =>
        prev.map((s) => {
          if (s.id === 'SatB' && time >= 18) {
            // SatB is DOWN after T+18s
            return {
              ...s,
              link_state: 'DOWN',
              snr_db: 0,
              packet_loss_pct: 100,
            }
          } else {
            // All others are DEGRADED: snr < 7, loss 70-93%
            return {
              ...s,
              link_state: 'DEGRADED',
              snr_db: Math.random() * 7,
              packet_loss_pct: 70 + Math.random() * 23, // 70-93%
            }
          }
        }),
      )
      // Show boot log for the current phase
      if (time >= 1 && time < 5) {
        showBootLogWithTitle(
          'Link Degradation Detected',
          [
            'Satellites link degradation detected',
            '5 LEO satellites reporting packet loss',
            'Forming cluster....',
            'SNR drop detected across cluster',
          ],
          800,
        )
      }
    } else {
      // Before T+1s: OK state
      setSatellites(
        INITIAL_SATELLITES.map((s) => ({
          ...s,
          link_state: 'OK',
          snr_db: 15 + Math.random() * 10,
          packet_loss_pct: Math.random() * 5, // OK state: 0-5%
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
            'Select candidate replacement satellites (SatA / SatC)',
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
    // Check if this event has already been triggered
    const triggerEvent = (time: number, callback: () => void) => {
      if (elapsedTime === time && !triggeredEventsRef.current.has(time)) {
        triggeredEventsRef.current.add(time)
        callback()
      }
    }
    // T+1s: Satellites link degradation
    triggerEvent(1, () => {
      setSatellites((prev) =>
        prev.map((s) => ({
          ...s,
          link_state: 'DEGRADED',
          snr_db: 5 + Math.random() * 2,
          packet_loss_pct: 70 + Math.random() * 23, // 70-93%
        })),
      )
      showBootLogWithTitle(
        'Link Degradation Detected',
        [
          'Satellites link degradation detected',
          '5 LEO satellites reporting packet loss',
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
    // T+18s: SatB Down, Playbook-07
    triggerEvent(18, () => {
      setSatellites((prev) =>
        prev.map((s) =>
          s.id === 'SatB'
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
            'Select candidate replacement satellites (SatA / SatC)',
            'Recommend switching window and degradation strategy',
          ],
        },
      ])
    })
  }, [elapsedTime, isRunning, isPaused, showBootLogWithTitle])
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
    // Only start transfer after Playbook-07 is approved
    if (id === 'Playbook-07') {
      setTimeout(
        () => {
          startTransfer()
        },
        (playbook.actions.length + 2) * 600,
      )
    } else {
      // For Playbook-04, just hide the action logs after completion
      setTimeout(
        () => {
          setShowPlaybookActions(false)
        },
        (playbook.actions.length + 3) * 600,
      )
    }
  }
  // Start mission transfer
  const startTransfer = () => {
    setShowPlaybookActions(false)
    setShowTransferProgress(true)
    setTransferProgress(0)
    setTransferLogs(['Activating Out-of-band tunnel...'])
    let progress = 0
    transferRef.current = setInterval(() => {
      progress += 2
      setTransferProgress(progress)
      if (progress === 20)
        setTransferLogs((prev) => [...prev, 'Establishing secure channel...'])
      if (progress === 40)
        setTransferLogs((prev) => [...prev, 'Transferring mission state...'])
      if (progress === 60)
        setTransferLogs((prev) => [
          ...prev,
          'Validating handover parameters...',
        ])
      if (progress === 80)
        setTransferLogs((prev) => [...prev, 'Confirming satellite switch...'])
      if (progress >= 100) {
        if (transferRef.current) clearInterval(transferRef.current)
        setTransferLogs((prev) => [...prev, '✓ Mission transfer complete'])
        // Change all satellites to out-of-band (purple)
        setSatellites((prev) =>
          prev.map((s) => ({
            ...s,
            link_state: 'OUTOFBAND',
            snr_db: 20 + Math.random() * 5,
            packet_loss_pct: Math.random() * 3,
          })),
        )
        // Stop timer and mark complete
        if (timerRef.current) clearInterval(timerRef.current)
        setDemoCompleted(true)
        setElapsedTime(0)
        setIsRunning(false)
      }
    }, 100)
  }
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationRef.current) clearInterval(animationRef.current)
      if (transferRef.current) clearInterval(transferRef.current)
      clearBootLogTimeouts()
    }
  }, [clearBootLogTimeouts])
  // Move satellites animation AND update telemetry values
  useEffect(() => {
    if (!isRunning || isPaused) return
    animationRef.current = setInterval(() => {
      setSatellites((prev) =>
        prev.map((s) => {
          const speed = 0.025
          const newLat =
            s.orbit === 1 ? s.lat + speed * 0.5 : s.lat - speed * 0.3
          const newLon = s.orbit === 1 ? s.lon + speed : s.lon - speed * 0.5
          // Update telemetry based on current state
          let newSnr = s.snr_db
          let newLoss = s.packet_loss_pct
          if (s.link_state === 'OK') {
            // OK state: snr > 15, loss < 5%
            newSnr = 15 + Math.random() * 10 // 15-25
            newLoss = Math.random() * 5 // 0-5%
          } else if (s.link_state === 'DEGRADED') {
            // DEGRADED state: snr < 7 trending toward 0, loss 70-93%
            // Gradually decrease SNR toward 0
            newSnr = Math.max(
              0,
              Math.min(7, s.snr_db - 0.1 + (Math.random() - 0.6) * 0.5),
            )
            newLoss = 70 + Math.random() * 23 // 70-93%
          } else if (s.link_state === 'DOWN') {
            // DOWN state: snr = 0, loss = 100%
            newSnr = 0
            newLoss = 100
          } else if (s.link_state === 'OUTOFBAND') {
            // OUTOFBAND state: recovered, good values
            newSnr = 18 + Math.random() * 7 // 18-25
            newLoss = Math.random() * 3 // 0-3%
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
  return (
    <div className="animate-fade-in">
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
                  <Tooltip direction="center" permanent>
                    <div className="font-mono text-xs text-red-600 font-bold">
                      Jamming Source
                      <br />
                      Radius: 500km
                      <br />
                      Confidence: 0.87
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

          {/* Transfer Progress */}
          {showTransferProgress && (
            <div className="rounded-xl p-4 bg-gray-900/50 border border-green-500/30 backdrop-blur-sm">
              <div className="text-lg font-medium text-white mb-3">
                Mission Transferring...
              </div>

              {/* Boot Log Style */}
              <div className="bg-black/60 rounded-lg p-3 font-mono text-sm text-green-400 space-y-1 mb-3 max-h-[180px] overflow-auto">
                {transferLogs.map((log, i) => (
                  <div key={i} className="animate-fade-in">
                    {log}
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-green-500 transition-all duration-100"
                  style={{
                    width: `${transferProgress}%`,
                  }}
                />
              </div>
              <div className="text-right text-base text-gray-300 mt-2 font-mono">
                {transferProgress}%
              </div>
            </div>
          )}

          {/* Demo Complete Message */}
          {demoCompleted && (
            <div className="rounded-xl p-5 bg-green-900/30 border border-green-500/30 backdrop-blur-sm text-center">
              <div className="text-xl font-bold text-green-400 mb-2">
                ✓ Demo Complete
              </div>
              <div className="text-base text-gray-300">
                All satellites switched to out-of-band communication
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
