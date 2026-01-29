import React from 'react';
import Sidebar from '../components/Sidebar';
import { Rocket, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
export function MissionsPage() {
  return (
    <div className="min-h-screen w-full bg-[#050713] text-white">
      {/* Main Navigation */}
      <Sidebar />

      {/* Content */}
      <div className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back to Dashboard Link */}
          <Link
            to="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">

            <ArrowLeft
              size={16}
              className="mr-2 group-hover:-translate-x-1 transition-transform" />

            <span className="text-sm">Back to Dashboard</span>
          </Link>

          {/* To Be Continued Card */}
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-12 text-center max-w-lg">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-600/20">
                <Rocket size={36} className="text-white" />
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Missions
              </h1>

              {/* To Be Continued Message */}
              <p className="text-xl text-gray-300 mb-2">To be continued...</p>
              <p className="text-sm text-gray-500">
                This section is under development. Check back soon for exciting
                mission updates!
              </p>

              {/* Decorative Elements */}
              <div className="mt-8 flex justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <div
                  className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"
                  style={{
                    animationDelay: '0.2s'
                  }}>
                </div>
                <div
                  className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
                  style={{
                    animationDelay: '0.4s'
                  }}>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}