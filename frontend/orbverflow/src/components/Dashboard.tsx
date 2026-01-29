import React, { useEffect, useState, useRef } from 'react';
import DashboardCard from './DashboardCard';
import FeatureSection from './FeatureSection';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import NotificationsPanel from './NotificationsPanel';
import Footer from './Footer';
import StatCard from './StatCard';
import Marquee from 'react-fast-marquee';
import {
  ChevronRight,
  Bell,
  ArrowRight,
  ExternalLink,
  Eye,
  Activity,
  Clock,
  ThermometerSun,
  Wifi,
  Rocket,
  Satellite,
  Gauge,
  BarChart3,
  Zap,
  AlertCircle } from
'lucide-react';
const Dashboard = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(false);
  const notificationsPanelRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const statsRef = useRef(null);
  // Handle clicks outside of notifications panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
      notificationsOpen &&
      notificationsPanelRef.current &&
      !notificationsPanelRef.current.contains(event.target) &&
      notificationButtonRef.current &&
      !notificationButtonRef.current.contains(event.target))
      {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);
  // Animate stats when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setAnimatedStats(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2
      }
    );
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => {
      if (statsRef.current) {
        observer.disconnect();
      }
    };
  }, []);
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#050713]">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-[#050713] z-[-1]">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-purple-900/10 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000"></div>
      </div>
      {/* Top Navigation */}
      <Sidebar />
      {/* Main content */}
      <div className="flex-1 w-full mt-16 sm:mt-20">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl w-full">
          {/* Header with mission status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
              <span className="text-gray-400 text-sm font-medium tracking-wide">
                MISSION CONTROL CENTER
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 mr-3">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping-slow"></div>
                <span className="text-gray-300 text-xs">SYSTEMS NOMINAL</span>
              </div>
              <button
                ref={notificationButtonRef}
                className="relative p-2 rounded-full hover:bg-gray-800/50 transition-colors group"
                onClick={() => setNotificationsOpen(!notificationsOpen)}>

                <Bell
                  size={18}
                  className="text-gray-300 group-hover:text-white transition-colors" />

                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-ping-slow"></span>
              </button>
            </div>
          </div>
          {/* Status Bar */}
          <StatusBar />
          {/* News Ticker Marquee */}
          <div className="mt-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 overflow-hidden">
            <div className="flex items-center p-3 border-b border-gray-800/50">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs font-medium text-gray-300">
                  LIVE UPDATES
                </span>
              </div>
            </div>
            <Marquee speed={40} gradient={false} className="py-3">
              <div className="flex items-center space-x-12">
                <NewsItem
                  icon={<AlertCircle size={14} className="text-red-400" />}
                  text="Solar flare detected in sector 7G. Communications may be affected." />

                <NewsItem
                  icon={<Activity size={14} className="text-green-400" />}
                  text="Artemis lander successfully deployed new seismic instruments on lunar surface." />

                <NewsItem
                  icon={<Satellite size={14} className="text-blue-400" />}
                  text="ISS crew completes critical EVA to repair solar array." />

                <NewsItem
                  icon={<Gauge size={14} className="text-purple-400" />}
                  text="Mars rover reaches milestone of 1000 sols on the red planet." />

                <NewsItem
                  icon={
                  <ThermometerSun size={14} className="text-orange-400" />
                  }
                  text="Extreme temperature fluctuations recorded at lunar south pole." />

              </div>
            </Marquee>
          </div>
          {/* Featured missions section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium tracking-tight">
                Featured Missions
              </h2>
              <div className="flex items-center text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors group">
                <span>View all</span>
                <ChevronRight
                  size={16}
                  className="ml-1 group-hover:translate-x-1 transition-transform" />

              </div>
            </div>
            {/* First row of mission cards with embedded stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <DashboardCard
                title="ISS Live Feed"
                subtitle="International Space Station"
                bgImage="https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                actionButton={
                <button className="bg-blue-500/80 hover:bg-blue-500 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors hover:scale-105 transform">
                    View Feed
                  </button>
                }
                darkOverlay
                stat={{
                  icon: <Satellite size={14} className="text-blue-400" />,
                  label: 'Orbit Status',
                  value: 'Stable',
                  trend: '+2% altitude'
                }} />

              <DashboardCard
                title="Lunar Base Operations"
                subtitle="Artemis Outpost"
                bgImage="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                actionButton={
                <button className="bg-indigo-500/80 hover:bg-indigo-500 px-4 py-1.5 rounded-lg text-xs font-medium flex items-center transition-colors hover:scale-105 transform">
                    <span>Access</span>
                    <ArrowRight
                    size={12}
                    className="ml-1 group-hover:translate-x-1 transition-transform" />

                  </button>
                }
                darkOverlay
                stat={{
                  icon: <Zap size={14} className="text-yellow-400" />,
                  label: 'Power Systems',
                  value: '98.7%',
                  trend: 'Optimal'
                }} />

              <DashboardCard
                title="Galaxy Survey"
                subtitle="Hubble Deep Field"
                bgImage="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2013&q=80"
                actionButton={
                <button className="bg-indigo-500/80 hover:bg-indigo-500 p-1.5 rounded-lg transition-colors hover:scale-105 transform">
                    <Eye size={16} className="hover:animate-pulse" />
                  </button>
                }
                darkOverlay
                stat={{
                  icon: <BarChart3 size={14} className="text-purple-400" />,
                  label: 'Data Collection',
                  value: '2.8 TB',
                  trend: '+0.4 TB today'
                }} />

            </div>
            {/* Mars Exploration and James Webb */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
              {/* Mars Exploration - Large card (2 columns) */}
              <div className="lg:col-span-2">
                <DashboardCard
                  title="Mars Exploration Hub"
                  description="Real-time data from Perseverance and Ingenuity missions. Track atmospheric conditions, geological discoveries, and sample collection progress on the Red Planet."
                  bgImage="https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                  actionButton={
                  <button className="bg-red-500/80 hover:bg-red-500 px-4 py-1.5 rounded-lg text-xs font-medium flex items-center transition-colors hover:scale-105 transform group">
                      <span>Explore</span>
                      <ChevronRight
                      size={14}
                      className="ml-1 group-hover:translate-x-1 transition-transform" />

                    </button>
                  }
                  darkOverlay
                  stat={{
                    icon: <Gauge size={14} className="text-red-400" />,
                    label: 'Sample Collection',
                    value: '237 samples',
                    trend: '+12% from last week'
                  }} />

              </div>
              {/* Deep Space Observatory - Purple card */}
              <div>
                <DashboardCard
                  title="James Webb Observatory"
                  description="Infrared observations revealing the birth of stars, exoplanets, and the earliest galaxies formed after the Big Bang."
                  bgGradient="bg-gradient-to-br from-purple-700 to-indigo-900"
                  actionButton={
                  <button className="bg-white/90 hover:bg-white text-purple-700 text-xs font-medium px-4 py-1.5 rounded-lg transition-colors hover:scale-105 transform">
                      View discoveries
                    </button>
                  }
                  stat={{
                    icon: <Activity size={14} className="text-purple-300" />,
                    label: 'System Health',
                    value: 'Excellent',
                    trend: 'All mirrors aligned'
                  }} />

              </div>
            </div>
          </div>
          {/* Mission Stats */}
          <div className="mt-10" ref={statsRef}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium tracking-tight">
                Mission Metrics
              </h2>
              <div className="flex space-x-2">
                <button className="text-xs px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 rounded-full text-gray-400 transition-colors hover:scale-105 transform">
                  Daily
                </button>
                <button className="text-xs px-3 py-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors hover:scale-105 transform">
                  Weekly
                </button>
                <button className="text-xs px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 rounded-full text-gray-400 transition-colors hover:scale-105 transform">
                  Monthly
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Distance Traveled"
                value="42.8 km"
                change="+3.2 km"
                isPositive={true}
                icon={<Rocket size={18} className="text-green-500" />}
                color="border-green-500"
                bgColor="bg-green-500/10"
                animated={animatedStats}
                delay="0" />

              <StatCard
                title="Power Consumption"
                value="87.3 kWh"
                change="-5.2%"
                isPositive={true}
                icon={<Zap size={18} className="text-purple-500" />}
                color="border-purple-500"
                bgColor="bg-purple-500/10"
                animated={animatedStats}
                delay="150" />

              <StatCard
                title="Anomaly Reports"
                value="3"
                change="+2"
                isPositive={false}
                icon={<Activity size={18} className="text-orange-500" />}
                color="border-orange-500"
                bgColor="bg-orange-500/10"
                animated={animatedStats}
                delay="300" />

              <StatCard
                title="Communication Uptime"
                value="99.8%"
                change="+0.3%"
                isPositive={true}
                icon={<Wifi size={18} className="text-blue-500" />}
                color="border-blue-500"
                bgColor="bg-blue-500/10"
                animated={animatedStats}
                delay="450" />

            </div>
          </div>

          {/* Secondary mission cards */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium tracking-tight">
                Active Operations
              </h2>
              <div className="flex items-center text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors group">
                <span>View all</span>
                <ChevronRight
                  size={16}
                  className="ml-1 group-hover:translate-x-1 transition-transform" />

              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <DashboardCard
                title="Asteroid Tracking"
                subtitle="Near Earth Objects"
                bgImage="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                actionButton={
                <button className="bg-orange-500/80 hover:bg-orange-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:scale-105 transform">
                    Monitor
                  </button>
                }
                darkOverlay
                compact />

              <DashboardCard
                title="Space Telescope Array"
                subtitle="Deep Space Network"
                bgGradient="bg-gradient-to-br from-blue-800 to-blue-600"
                actionButton={
                <button className="bg-blue-500/80 hover:bg-blue-500 border border-white/20 p-1.5 rounded-lg transition-colors hover:scale-105 transform">
                    <ExternalLink
                    size={14}
                    className="hover:rotate-12 transition-transform" />

                  </button>
                }
                compact />

              <DashboardCard
                title="Solar System Explorer"
                subtitle="Interplanetary Missions"
                bgGradient="bg-gradient-to-br from-yellow-700 to-yellow-500"
                actionButton={
                <button className="bg-yellow-500/80 hover:bg-yellow-500 text-yellow-900 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:scale-105 transform">
                    Navigate
                  </button>
                }
                compact />

              <DashboardCard
                title="Exoplanet Database"
                subtitle="Kepler & TESS Discoveries"
                bgGradient="bg-gradient-to-br from-green-800 to-green-600"
                actionButton={
                <button className="bg-green-500/80 hover:bg-green-500 p-1.5 rounded-lg transition-colors hover:scale-105 transform group">
                    <ChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform" />

                  </button>
                }
                compact />

            </div>
          </div>
          {/* Communication and development cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
            <DashboardCard
              title="Deep Space Network"
              subtitle="Communication Array"
              bgImage="https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2078&q=80"
              actionButton={
              <button className="bg-gray-800/80 hover:bg-gray-800 border border-gray-600 px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:scale-105 transform">
                  Signal Status
                </button>
              }
              darkOverlay
              stat={{
                icon: <Wifi size={14} className="text-blue-400" />,
                label: 'Signal Strength',
                value: '97.4%',
                trend: 'Strong'
              }} />

            <DashboardCard
              title="Spacecraft Development"
              subtitle="Next Generation Vehicles"
              bgImage="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              actionButton={
              <button className="bg-blue-600/80 hover:bg-blue-600 px-4 py-1.5 rounded-lg text-xs font-medium flex items-center transition-colors hover:scale-105 transform group">
                  <span>View Projects</span>
                  <ArrowRight
                  size={12}
                  className="ml-1 group-hover:translate-x-1 transition-transform" />

                </button>
              }
              darkOverlay
              stat={{
                icon: <Clock size={14} className="text-blue-400" />,
                label: 'Development Timeline',
                value: 'On Schedule',
                trend: 'Phase 2 in progress'
              }} />

          </div>
          {/* Bottom feature section */}
          <div className="mt-10">
            <FeatureSection />
          </div>
          {/* Footer */}
          <div className="mt-12">
            <Footer />
          </div>
        </div>
      </div>
      {/* Notifications panel */}
      <div
        ref={notificationsPanelRef}
        className={`fixed inset-y-0 right-0 w-[85%] sm:w-80 bg-gray-900/95 backdrop-blur-sm border-l border-gray-800/50 transform ${notificationsOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>

        <NotificationsPanel onClose={() => setNotificationsOpen(false)} />
      </div>
    </div>);

};
const NewsItem = ({ icon, text }) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-300">
      <div className="p-1.5 rounded-full bg-gray-800/70">{icon}</div>
      <span>{text}</span>
    </div>);

};
export default Dashboard;