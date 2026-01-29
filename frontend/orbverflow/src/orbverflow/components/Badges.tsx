import React from 'react'
import { useAppStore } from '../store'
export function Badges({ datasetMeta }: { datasetMeta: any }) {
  const dataset = datasetMeta?.source_dataset_id ?? 'unknown'
  const vendor = datasetMeta?.source_vendor ?? 'unknown'
  const mapping = datasetMeta?.mapping_version ?? 'unknown'
  return (
    <div className="flex gap-3 items-center flex-wrap">
      <Badge label="Dataset" value={dataset} />
      <Badge label="Vendor" value={vendor} />
      <Badge label="Mapping" value={mapping} />
    </div>
  )
}
function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 rounded-full px-3 py-1.5 bg-white/5 text-xs text-gray-300">
      <span className="font-semibold text-gray-400 mr-1">{label}:</span>
      <span className="text-white">{value}</span>
    </div>
  )
}
export function ScenarioBanner({ activeTab }: { activeTab?: string }) {
  const { scenario } = useAppStore()
  // When on ScenarioDemo tab, show the specific scenario name
  const isScenarioDemo = activeTab === 'ScenarioDemo'
  const displayScenario = isScenarioDemo
    ? 'Resilient Satellite Operations Under Ku-band Jamming'
    : scenario
  const isBad =
    scenario === 'JAMMING' ||
    scenario === 'SATB_DOWN' ||
    scenario === 'SPOOFING' ||
    isScenarioDemo
  return (
    <div
      className={`mt-3 mb-5 px-3 py-2.5 rounded-xl border text-sm font-medium flex items-center
        ${isBad ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-green-500/30 bg-green-500/10 text-green-200'}`}
    >
      <span className="mr-2 font-bold">Scenario:</span> {displayScenario}
    </div>
  )
}
