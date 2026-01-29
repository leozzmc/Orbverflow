import React from 'react';
import { X, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
const NotificationsPanel = ({ onClose }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-800/50 flex items-center justify-between">
        <h2 className="text-lg font-medium tracking-tight">Notifications</h2>
        <button
          className="p-1.5 rounded-full hover:bg-gray-800/50 transition-all duration-200 hover:rotate-90"
          onClick={onClose}>

          <X size={18} />
        </button>
      </div>
      <div className="flex items-center p-3 border-b border-gray-800/50">
        <button className="flex-1 text-center py-1.5 text-sm text-white border-b-2 border-blue-500 hover:bg-gray-800/30 transition-colors">
          All
        </button>
        <button className="flex-1 text-center py-1.5 text-sm text-gray-400 hover:text-white transition-colors hover:bg-gray-800/30">
          Unread
        </button>
        <button className="flex-1 text-center py-1.5 text-sm text-gray-400 hover:text-white transition-colors hover:bg-gray-800/30">
          Important
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <Notification
          icon={<Info size={16} className="text-blue-500" />}
          title="System Update Completed"
          time="2 hours ago"
          message="Navigation systems have been updated to version 4.2.1"
          delay="0" />

        <Notification
          icon={<AlertTriangle size={16} className="text-orange-500" />}
          title="Solar Flare Warning"
          time="5 hours ago"
          message="Class X solar flare detected. Communications may be affected."
          important
          delay="100" />

        <Notification
          icon={<CheckCircle size={16} className="text-green-500" />}
          title="Mission Milestone Achieved"
          time="Yesterday"
          message="Rover has successfully reached Jezero Crater's northern rim."
          delay="200" />

        <Notification
          icon={<Clock size={16} className="text-purple-500" />}
          title="Schedule Change"
          time="2 days ago"
          message="EVA-217 has been rescheduled to accommodate equipment maintenance."
          delay="300" />

        <Notification
          icon={<Info size={16} className="text-blue-500" />}
          title="New Data Available"
          time="3 days ago"
          message="Spectroscopy results from sample #142 are ready for analysis."
          delay="400" />

      </div>
      <div className="p-3 border-t border-gray-800/50">
        <button className="w-full py-2 text-sm text-center text-blue-400 hover:text-blue-300 transition-colors hover:bg-gray-800/30 rounded-lg">
          View All Notifications
        </button>
      </div>
    </div>);

};
const Notification = ({
  icon,
  title,
  time,
  message,
  important = false,
  delay = '0'
}) => {
  return (
    <div
      className={`p-3 mb-2 rounded-lg ${important ? 'bg-gray-800/70' : 'hover:bg-gray-800/50'} cursor-pointer transition-all duration-200 hover:translate-x-1 animate-fade-in`}
      style={{
        animationDelay: `${delay}ms`
      }}>

      <div className="flex items-start">
        <div className="mt-0.5 mr-3 p-1.5 rounded-full bg-black/30 hover:scale-110 transition-transform">
          <div className="animate-pulse-slow">{icon}</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-medium">{title}</div>
            <div className="text-xs text-gray-500">{time}</div>
          </div>
          <div className="text-xs text-gray-400">{message}</div>
        </div>
      </div>
    </div>);

};
export default NotificationsPanel;