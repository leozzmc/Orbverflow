import React from 'react';
import { ChevronRight, Rocket, Clock } from 'lucide-react';
const FeatureSection = () => {
  return (
    <div className="border-t border-gray-800/50 pt-6">
      <div className="text-xs text-blue-500 uppercase tracking-wider font-medium mb-3">
        Next Launch
      </div>
      <div className="bg-gradient-to-br from-gray-900/80 to-blue-900/20 backdrop-blur-sm rounded-xl p-5 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/10 group">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-semibold tracking-tight group-hover:text-blue-100 transition-colors">
                Artemis Moon Mission
              </h2>
              <div className="hidden sm:flex items-center space-x-2 bg-blue-900/30 px-3 py-1 rounded-full group-hover:bg-blue-800/40 transition-colors">
                <Clock size={12} className="text-blue-400 animate-pulse-slow" />
                <span className="text-xs text-blue-400">T-14:06:32</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 mt-1 max-w-xl group-hover:text-gray-200 transition-colors">
              Humanity's return to the lunar surface with advanced life support
              systems, sustainable habitats, and preparation for future Mars
              colonization missions.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center text-sm text-gray-300 border border-gray-700/50 bg-gray-800/50 hover:bg-gray-800 rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 group">
              <Rocket
                size={14}
                className="mr-2 group-hover:rotate-12 transition-transform" />

              <span>Mission Details</span>
            </button>
            <button className="flex items-center text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 group">
              <span>Watch Launch</span>
              <ChevronRight
                size={14}
                className="ml-1 group-hover:translate-x-1 transition-transform" />

            </button>
          </div>
        </div>
      </div>
    </div>);

};
export default FeatureSection;