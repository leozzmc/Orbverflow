import React, { useState } from 'react'
import { AppStoreProvider } from './store'
import { OrbverflowLayout } from './components/OrbverflowLayout'
import FleetPage from './pages/FleetPage'
import IncidentsPage from './pages/IncidentsPage'
import PlaybooksPage from './pages/PlaybooksPage'
import AuditPage from './pages/AuditPage'
import ThreatModelPage from './pages/ThreatModelPage'
import ScenarioDemoPage from './pages/ScenarioDemoPage'
import Sidebar from '../components/Sidebar'
export function OrbverflowApp() {
  const [tab, setTab] = useState<
    | 'Fleet'
    | 'Incidents'
    | 'Playbooks'
    | 'Audit'
    | 'ThreatModel'
    | 'ScenarioDemo'
  >('Fleet')
  return (
    <AppStoreProvider>
      <div className="min-h-screen w-full bg-[#050713]">
        {/* Main Navigation Sidebar */}
        <Sidebar />

        {/* Orbverflow Content */}
        <OrbverflowLayout active={tab} onNavigate={setTab}>
          {tab === 'Fleet' && <FleetPage />}
          {tab === 'Incidents' && <IncidentsPage />}
          {tab === 'Playbooks' && <PlaybooksPage />}
          {tab === 'Audit' && <AuditPage />}
          {tab === 'ThreatModel' && <ThreatModelPage />}
          {tab === 'ScenarioDemo' && <ScenarioDemoPage />}
        </OrbverflowLayout>
      </div>
    </AppStoreProvider>
  )
}
