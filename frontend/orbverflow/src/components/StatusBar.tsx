import React from 'react';
import { Activity, Clock, ThermometerSun, Wifi } from 'lucide-react';
const StatusBar = () => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatusItem
          icon={<Activity size={18} className="text-green-500" />}
          label="Mission Status"
          value="Active"
          status="Nominal"
          color="from-green-500/20 to-green-500/5"
          animatedIcon="animate-pulse-slow" />

        <StatusItem
          icon={<Clock size={18} className="text-blue-500" />}
          label="Mission Time"
          value="452:16:33"
          status="Day 19"
          color="from-blue-500/20 to-blue-500/5"
          animatedValue="animate-count-time" />

        <StatusItem
          icon={<ThermometerSun size={18} className="text-orange-500" />}
          label="External Temp"
          value="-173°C"
          status="Normal Range"
          color="from-orange-500/20 to-orange-500/5"
          animatedIcon="animate-float" />

        <StatusItem
          icon={<Wifi size={18} className="text-purple-500" />}
          label="Signal Strength"
          value="97.4%"
          status="Strong"
          color="from-purple-500/20 to-purple-500/5"
          animatedValue="animate-pulse-slow" />

      </div>
    </div>);

};
const StatusItem = ({
  icon,
  label,
  value,
  status,
  color,
  animatedIcon = '',
  animatedValue = ''
}) => {
  return (
    <div
      className={`bg-gradient-to-r ${color} rounded-lg p-3 border border-gray-800/30 hover:border-gray-700/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/5 group`}>

      <div className="flex items-center space-x-3">
        <div
          className={`p-2 rounded-lg bg-black/30 backdrop-blur-sm ${animatedIcon} group-hover:scale-110 transition-transform duration-300`}>

          {icon}
        </div>
        <div>
          <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
            {label}
          </div>
          <div
            className={`text-lg font-semibold tracking-tight ${animatedValue} group-hover:text-white transition-colors`}>

            {value}
          </div>
          <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
            {status}
          </div>
        </div>
      </div>
    </div>);

};
export default StatusBar;