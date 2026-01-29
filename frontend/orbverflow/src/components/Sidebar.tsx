import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Rocket,
  Globe,
  Radio,
  Users,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Menu,
  X,
  MoreHorizontal,
  Radar } from
'lucide-react';
const Sidebar = () => {
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  // Refs for dropdown containers
  const userMenuRef = useRef(null);
  const overflowMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  // Primary menu items to always show
  const primaryMenuItems = [
  {
    icon: <Home size={16} />,
    label: 'Dashboard',
    path: '/'
  },
  {
    icon: <Radar size={16} />,
    label: 'Detection',
    path: '/orbverflow'
  },
  {
    icon: <Rocket size={16} />,
    label: 'Missions',
    path: '/missions'
  }];

  // Overflow menu items that will go into the dropdown
  const overflowMenuItems = [
  {
    icon: <Globe size={16} />,
    label: 'Exploration',
    active: false
  },
  {
    icon: <Radio size={16} />,
    label: 'Communications',
    active: false
  },
  {
    icon: <Users size={16} />,
    label: 'Astronauts',
    active: false
  },
  {
    icon: <Calendar size={16} />,
    label: 'Schedule',
    active: false
  }];

  // Handle clicks outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user menu if click is outside
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      // Close overflow menu if click is outside
      if (
      overflowMenuRef.current &&
      !overflowMenuRef.current.contains(event.target))
      {
        setOverflowMenuOpen(false);
      }
      // We don't auto-close the mobile menu when clicking outside
      // as it's a primary navigation element
    };
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-4">
      <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800/50 shadow-xl w-full max-w-6xl px-4 py-2 rounded-full hover:bg-gray-900/80 transition-colors duration-300">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 hover:opacity-90 transition-opacity">

            <div className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden shadow-lg shadow-orange-600/20 group hover:scale-110 transition-transform duration-300">
              <img
                src="/eye2.png"
                alt="Orbverflow Logo"
                className="w-full h-full object-cover" />

            </div>
            <div className="text-xl font-bold tracking-tight text-white">
              Orbverflow
            </div>
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 mx-4">
            {/* Primary menu items always visible */}
            {primaryMenuItems.map((item, index) =>
            <NavItem
              key={index}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={
              location.pathname === item.path ||
              item.path !== '/' && location.pathname.startsWith(item.path)
              } />

            )}
            {/* Overflow menu dropdown */}
            <div className="relative" ref={overflowMenuRef}>
              <button
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all duration-200 hover:scale-105"
                onClick={() => setOverflowMenuOpen(!overflowMenuOpen)}>

                <MoreHorizontal
                  size={16}
                  className={`transition-transform duration-300 ${overflowMenuOpen ? 'rotate-90' : ''}`} />

                <span className="text-sm">More</span>
              </button>
              {/* Overflow Menu Dropdown */}
              {overflowMenuOpen &&
              <div className="absolute left-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-gray-800/50 z-50 animate-fade-in">
                  <div className="py-2">
                    {overflowMenuItems.map((item, index) =>
                  <UserMenuItem
                    key={index}
                    icon={item.icon}
                    label={item.label} />

                  )}
                  </div>
                </div>
              }
            </div>
          </div>
          {/* User Profile and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-800/50 transition-all duration-200 hover:scale-105 group"
                onClick={() => setUserMenuOpen(!userMenuOpen)}>

                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-sm font-medium shadow-lg shadow-orange-600/20 group-hover:shadow-orange-600/40 transition-shadow">
                  AG
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-white">
                    Airbus Ground Station Admin
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`hidden md:block text-gray-400 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />

              </button>
              {/* User Dropdown Menu */}
              {userMenuOpen &&
              <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-gray-800/50 z-50 animate-fade-in">
                  <div className="py-2">
                    <UserMenuItem
                    icon={<Settings size={16} />}
                    label="Settings" />

                    <UserMenuItem
                    icon={<HelpCircle size={16} />}
                    label="Help" />

                    <UserMenuItem
                    icon={<LogOut size={16} />}
                    label="Sign Out" />

                  </div>
                </div>
              }
            </div>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-800/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>

              {mobileMenuOpen ?
              <X size={18} className="animate-fade-in" /> :

              <Menu size={18} className="animate-fade-in" />
              }
            </button>
          </div>
        </div>
        {/* Mobile Navigation */}
        {mobileMenuOpen &&
        <div
          className="md:hidden py-3 mt-2 border-t border-gray-800/50 animate-slide-down"
          ref={mobileMenuRef}>

            <div className="space-y-1 px-2">
              {/* Include all menu items in mobile view */}
              <MobileNavItem
              icon={<Home size={16} />}
              label="Dashboard"
              path="/"
              active={location.pathname === '/'} />

              <MobileNavItem
              icon={<Radar size={16} />}
              label="Detection"
              path="/orbverflow"
              active={location.pathname.startsWith('/orbverflow')} />

              <MobileNavItem
              icon={<Rocket size={16} />}
              label="Missions"
              path="/missions" />

              <MobileNavItem
              icon={<Globe size={16} />}
              label="Exploration"
              path="/exploration" />

              <MobileNavItem
              icon={<Radio size={16} />}
              label="Communications"
              path="/communications" />

              <MobileNavItem
              icon={<Users size={16} />}
              label="Astronauts"
              path="/astronauts" />

              <MobileNavItem
              icon={<Calendar size={16} />}
              label="Schedule"
              path="/schedule" />

              <div className="pt-2 mt-2 border-t border-gray-800/50">
                <MobileNavItem icon={<Settings size={16} />} label="Settings" />
                <MobileNavItem icon={<HelpCircle size={16} />} label="Help" />
                <MobileNavItem icon={<LogOut size={16} />} label="Sign Out" />
              </div>
            </div>
          </div>
        }
      </div>
    </nav>);

};
const NavItem = ({ icon, label, path, active = false }) => {
  return (
    <Link
      to={path}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>

      <div className="transition-transform duration-300 hover:rotate-12">
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </Link>);

};
const MobileNavItem = ({ icon, label, path, active = false }) => {
  return (
    <Link
      to={path}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>

      <div className="transition-transform duration-300 hover:rotate-12">
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </Link>);

};
const UserMenuItem = ({ icon, label }) => {
  return (
    <div className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 hover:scale-105">
      <div className="transition-transform duration-300 hover:rotate-12">
        {icon}
      </div>
      <span>{label}</span>
    </div>);

};
export default Sidebar;