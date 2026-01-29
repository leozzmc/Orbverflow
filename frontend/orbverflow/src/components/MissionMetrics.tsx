import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
const MissionMetrics = () => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-base sm:text-lg font-semibold">Mission Metrics</h2>
        <div className="flex space-x-2">
          <button className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-gray-800 rounded-full text-gray-400 hover:bg-gray-700">
            Daily
          </button>
          <button className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-blue-600 rounded-full text-white">
            Weekly
          </button>
          <button className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-gray-800 rounded-full text-gray-400 hover:bg-gray-700">
            Monthly
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Sample Collection"
          value="237"
          change="+12%"
          isPositive={true}
          color="bg-blue-500" />

        <MetricCard
          title="Distance Traveled"
          value="42.8 km"
          change="+3.2 km"
          isPositive={true}
          color="bg-green-500" />

        <MetricCard
          title="Power Consumption"
          value="87.3 kWh"
          change="-5.2%"
          isPositive={true}
          color="bg-purple-500" />

        <MetricCard
          title="Anomaly Reports"
          value="3"
          change="+2"
          isPositive={false}
          color="bg-orange-500" />

      </div>
    </div>);

};
const MetricCard = ({ title, value, change, isPositive, color }) => {
  return (
    <div className="bg-gray-900 rounded-xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <div className="text-xs sm:text-sm text-gray-400">{title}</div>
        <div className={`h-2 w-2 rounded-full ${color}`}></div>
      </div>
      <div className="text-lg sm:text-2xl font-bold mb-1">{value}</div>
      <div
        className={`flex items-center text-[10px] sm:text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>

        {isPositive ?
        <TrendingUp size={12} className="mr-1 sm:hidden" /> :

        <TrendingDown size={12} className="mr-1 sm:hidden" />
        }
        {isPositive ?
        <TrendingUp size={14} className="mr-1 hidden sm:block" /> :

        <TrendingDown size={14} className="mr-1 hidden sm:block" />
        }
        <span>{change} from last week</span>
      </div>
    </div>);

};
export default MissionMetrics;