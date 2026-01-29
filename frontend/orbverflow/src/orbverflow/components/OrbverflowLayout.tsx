import React, { useState } from 'react'
import { useAppStore } from '../store'
import { triggerScenario } from '../api'
import { Badges, ScenarioBanner } from './Badges'
import { AlertTriangle, Radio, ShieldAlert, Play } from 'lucide-react'
export function OrbverflowLayout({
  active,
  onNavigate,
  children,
}: {
  active:
    | 'Fleet'
    | 'Incidents'
    | 'Playbooks'
    | 'Audit'
    | 'ThreatModel'
    | 'ScenarioDemo'
  onNavigate: (x: any) => void
  children: React.ReactNode
}) {
  const { datasetMeta, scenario } = useAppStore()
  const [busy, setBusy] = useState(false)
  async function run(s: string) {
    setBusy(true)
    try {
      await triggerScenario(s, 10)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="min-h-screen w-full bg-[#050713] text-white pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              Orbverflow Event Detection Center
            </h1>
            <Badges datasetMeta={datasetMeta} />
          </div>

          <div className="flex flex-wrap gap-2">
            <TriggerButton
              label="JAMMING"
              icon={<Radio size={14} />}
              onClick={() => run('JAMMING')}
              disabled={busy}
              color="red"
            />
            <TriggerButton
              label="SATB_DOWN"
              icon={<AlertTriangle size={14} />}
              onClick={() => run('SATB_DOWN')}
              disabled={busy}
              color="orange"
            />
            <TriggerButton
              label="SPOOFING"
              icon={<ShieldAlert size={14} />}
              onClick={() => run('SPOOFING')}
              disabled={busy}
              color="purple"
            />
            <button
              onClick={() => onNavigate('ScenarioDemo')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:scale-105"
            >
              <Play size={14} />
              Scenario Demo Start
            </button>
          </div>
        </div>

        {/* Scenario Banner */}
        <ScenarioBanner activeTab={active} />

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-xl border border-gray-800/50 mb-8 w-fit backdrop-blur-sm overflow-x-auto">
          <Tab
            label="Fleet"
            active={active === 'Fleet'}
            onClick={() => onNavigate('Fleet')}
          />
          <Tab
            label="Incidents"
            active={active === 'Incidents'}
            onClick={() => onNavigate('Incidents')}
          />
          <Tab
            label="Playbooks"
            active={active === 'Playbooks'}
            onClick={() => onNavigate('Playbooks')}
          />
          <Tab
            label="Audit"
            active={active === 'Audit'}
            onClick={() => onNavigate('Audit')}
          />
          <Tab
            label="Threat Model"
            active={active === 'ThreatModel'}
            onClick={() => onNavigate('ThreatModel')}
          />
          <Tab
            label="Scenario Demo"
            active={active === 'ScenarioDemo'}
            onClick={() => onNavigate('ScenarioDemo')}
          />
        </div>

        {/* Content Area */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
function Tab({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
        ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
    >
      {label}
    </button>
  )
}
function TriggerButton({
  label,
  icon,
  onClick,
  disabled,
  color,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled: boolean
  color: 'red' | 'orange' | 'purple'
}) {
  const colorClasses = {
    red: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20',
    orange:
      'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20',
    purple:
      'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20',
  }
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 ${colorClasses[color]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
    >
      {icon}
      Trigger {label}
    </button>
  )
}
