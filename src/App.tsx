/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bus, Users, Shield, Smartphone, ArrowRight, Database, Phone, Route, MapPin, X, HelpCircle, CheckCircle2, Menu } from 'lucide-react';
import EmployeePortal from './components/EmployeePortal';
import DriverPortal from './components/DriverPortal';
import AdminPortal from './components/AdminPortal';
import LiveTracking from './components/LiveTracking';
import { initDb, syncFromDatabase } from './dbSim';
import { SHIFT_ROUTES } from './types';
import { BajajFavouriteIndianLogo, BajajHorizontalLogo } from './components/BajajLogo';

type PortalRole = 'select' | 'employee' | 'driver' | 'admin' | 'tracking';

export default function App() {
  const [activePortal, setActivePortal] = useState<PortalRole>('select');
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modal states
  const [isRoutesModalOpen, setIsRoutesModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [routesFilter, setRoutesFilter] = useState('');

  // Initialize Excel-like database upon mount
  useEffect(() => {
    initDb();
    syncFromDatabase();
  }, []);

  if (activePortal === 'employee') {
    return <EmployeePortal onBackToPortalSelection={() => setActivePortal('select')} />;
  }

  if (activePortal === 'driver') {
    return <DriverPortal onBackToPortalSelection={() => setActivePortal('select')} />;
  }

  if (activePortal === 'admin') {
    return <AdminPortal onBackToPortalSelection={() => setActivePortal('select')} />;
  }

  if (activePortal === 'tracking') {
    return (
      <LiveTracking 
        initialRouteId={selectedRouteId} 
        onBack={() => { 
          setActivePortal('select'); 
          setSelectedRouteId(undefined); 
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans antialiased">
      
      {/* HEADER */}
      <header className="bg-white shadow-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BajajFavouriteIndianLogo className="scale-90 sm:scale-100 origin-left border-none shadow-none p-0 bg-transparent" />
            <div className="border-l border-slate-200 pl-4 hidden md:block">
              <span className="text-[10px] tracking-widest text-blue-900 uppercase font-black font-sans block">
                Employee Transport
              </span>
              <span className="text-[9px] tracking-wider text-slate-400 uppercase font-bold mt-0.5 block font-mono">
                Management System
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-bold text-xs uppercase tracking-wider text-slate-600">
            <button 
              onClick={() => {
                setIsRoutesModalOpen(false);
                setIsContactModalOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => setIsRoutesModalOpen(true)} 
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Routes Lookup
            </button>
            <button 
              onClick={() => setIsContactModalOpen(true)} 
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Emergency Contact
            </button>
            <button 
              onClick={() => setActivePortal('tracking')} 
              className="hover:text-emerald-600 text-emerald-600 font-extrabold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Tracking</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-md animate-in slide-in-from-top duration-200">
            <div className="flex flex-col p-4 space-y-3 text-xs font-bold uppercase tracking-wider text-slate-600">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className="text-left py-2 px-3 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
              >
                Home
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsRoutesModalOpen(true);
                }} 
                className="text-left py-2 px-3 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
              >
                Routes Lookup
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsContactModalOpen(true);
                }} 
                className="text-left py-2 px-3 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
              >
                Emergency Contact
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActivePortal('tracking');
                }} 
                className="text-left py-2 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer flex items-center gap-2 font-extrabold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Tracking</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16 sm:py-20 md:py-24 overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 bottom-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 border border-blue-400/20 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Smart Employee Transport System
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              Employee <span className="text-blue-400">Transport</span> Management
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Manage employee routes, shuttle buses, active drivers, and shift-wise transport schedules with a modern, high-precision ecosystem.
            </p>


          </div>

        </div>
      </section>

      {/* THREE INTEGRATED ACCESS CHANNELS */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight uppercase">
            Select Your Workspace
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Access secure Excel simulated database registries and tracking feeds
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* EMPLOYEE WORKSPACE CARD */}
          <div 
            onClick={() => setActivePortal('employee')}
            className="group relative bg-white border border-slate-200 rounded-2xl p-6 text-left hover:border-blue-500 cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="bg-blue-50 text-blue-600 p-3.5 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-md font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">Employee Portal</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Register with your unique Employee Code, search shift routes, request smart bus passes, and view approved commuter passes.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-blue-600 font-bold group-hover:translate-x-1 transition-transform mt-6">
              <span>Enter Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* DRIVER TERMINAL CARD */}
          <div 
            onClick={() => setActivePortal('driver')}
            className="group relative bg-white border border-slate-200 rounded-2xl p-6 text-left hover:border-emerald-500 cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-md font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">Driver Portal</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Verify pass validity in real-time. Enter commuter IDs to instant-check route clearances and log shuttle boards.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 font-bold group-hover:translate-x-1 transition-transform mt-6">
              <span>Open Driver Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* ADMIN CONSOLE CARD */}
          <div 
            onClick={() => setActivePortal('admin')}
            className="group relative bg-white border border-slate-200 rounded-2xl p-6 text-left hover:border-indigo-500 cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-md font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">Admin Console</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Audit route configurations, review employee registers, approve or reject bus pass requests, and export raw spreadsheets.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-indigo-600 font-bold group-hover:translate-x-1 transition-transform mt-6">
              <span>Access Admin Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* LIVE BUS TRACKING CARD */}
          <div 
            onClick={() => setActivePortal('tracking')}
            className="group relative bg-white border border-slate-200 rounded-2xl p-6 text-left hover:border-amber-500 cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-4">
              <div className="bg-amber-50 text-amber-600 p-3.5 rounded-xl w-fit group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-md font-extrabold text-slate-900 group-hover:text-amber-500 transition-colors">Live Bus Tracking</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Track company shuttle buses in real-time. View geographic position, driver details, active stops, and exact ETA.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-amber-600 font-bold group-hover:translate-x-1 transition-transform mt-6">
              <span>Open Satellite Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES OVERVIEW GRID SECTION */}
      <section className="py-16 bg-slate-100 border-t border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight uppercase">
              Our Services
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Professional transport management features for seamless plant commuting
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* SERVICE 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-xs hover:translate-y-[-4px] transition-transform duration-200">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-4 font-bold">
                🚌
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight mb-2">
                Route Management
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Seamlessly organize corporate plant routes and coordinate passenger assignments for production lines.
              </p>
            </div>

            {/* SERVICE 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-xs hover:translate-y-[-4px] transition-transform duration-200">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4 font-bold">
                📍
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight mb-2">
                Commute Pass Checking
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Active pass checking systems with live driver dashboards ensuring authenticated commuter check-ins.
              </p>
            </div>

            {/* SERVICE 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-xs hover:translate-y-[-4px] transition-transform duration-200">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-4 font-bold">
                👨‍✈️
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight mb-2">
                Driver Registries
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Maintain high-fidelity driver schedules and contacts to support all three continuous shifts.
              </p>
            </div>

            {/* SERVICE 4 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-xs hover:translate-y-[-4px] transition-transform duration-200">
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mb-4 font-bold">
                📞
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight mb-2">
                Emergency Support
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Quick-dial helpline listings and real-time support desks to guarantee commuter and shift safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SPREADSHEET ENGINE FOOTER DECORATOR */}
      <div className="py-4 text-center bg-white border-b border-slate-200">
        <div className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-xs text-slate-500 font-mono shadow-2xs">
          <Database className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>Simulation Engine: employees.xlsx • passes.xlsx • pass_requests.xlsx</span>
        </div>
      </div>

      {/* MAIN FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-8 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            © 2026 Bajaj Auto Transport Management System. All Rights Reserved.
          </div>
          <div className="flex gap-6 font-bold uppercase tracking-wider text-[10px]">
            <button onClick={() => setIsRoutesModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">
              Routes Table
            </button>
            <button onClick={() => setIsContactModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">
              Helplines
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">Plant 1 Gateways</span>
          </div>
        </div>
      </footer>

      {/* ========================================================
          ROUTES LOOKUP MODAL
          ======================================================== */}
      {isRoutesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-999 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
          >
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🗺️</span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Bajaj Auto Bus Routes Table</h3>
                  <p className="text-[10px] text-slate-300 font-semibold font-mono">Shift Wise Registered Transports</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRoutesModalOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SEARCH AND FILTER BAR */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by Route name or Bus Stop..."
                value={routesFilter}
                onChange={(e) => setRoutesFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
              />
              {routesFilter && (
                <button 
                  onClick={() => setRoutesFilter('')}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {Object.entries(SHIFT_ROUTES).map(([shiftName, routesObj]) => {
                const filteredRoutes = Object.entries(routesObj).filter(([routeName, stops]) => {
                  return routeName.toLowerCase().includes(routesFilter.toLowerCase()) || 
                         stops.some(stop => stop.toLowerCase().includes(routesFilter.toLowerCase()));
                });

                if (routesFilter && filteredRoutes.length === 0) return null;

                return (
                  <div key={shiftName} className="space-y-3">
                    <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest border-l-4 border-blue-600 pl-2">
                      {shiftName}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {filteredRoutes.map(([routeName, stops]) => {
                        // Use exact dynamic route ID matching the Live Tracking list
                        const mappedRouteId = `${shiftName.replace(/\s+/g, '-')}-${routeName.replace(/[^a-zA-Z0-9]/g, '-')}`.toLowerCase();

                        return (
                          <div 
                            key={routeName} 
                            onClick={() => {
                              setSelectedRouteId(mappedRouteId);
                              setIsRoutesModalOpen(false);
                              setActivePortal('tracking');
                            }}
                            className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1.5 hover:border-blue-500 hover:bg-blue-50/20 cursor-pointer transition-all duration-200 group/route relative overflow-hidden"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-slate-800">
                                <Route className="w-3.5 h-3.5 text-blue-600 group-hover/route:text-blue-700" />
                                <span className="font-extrabold text-xs group-hover/route:text-blue-900">{routeName}</span>
                              </div>
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 opacity-0 group-hover/route:opacity-100 transition-opacity">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                                Track Live
                              </span>
                            </div>
                            <div className="flex items-start gap-1">
                              <MapPin className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                {stops.join(' ➔ ')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {(() => {
                const hasAny = Object.values(SHIFT_ROUTES).some(routesObj => 
                  Object.entries(routesObj).some(([routeName, stops]) => 
                    routeName.toLowerCase().includes(routesFilter.toLowerCase()) || 
                    stops.some(stop => stop.toLowerCase().includes(routesFilter.toLowerCase()))
                  )
                );
                if (!hasAny && routesFilter) {
                  return (
                    <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                      No matching routes or bus stops found.
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right shrink-0">
              <button
                onClick={() => setIsRoutesModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Table
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================
          EMERGENCY CONTACT MODAL
          ======================================================== */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-999 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col"
          >
            <div className="bg-gradient-to-r from-red-700 to-rose-600 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📞</span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Emergency Transport Contacts</h3>
                  <p className="text-[10px] text-red-100 font-semibold font-mono">Bajaj Auto Safety & Helpdesks</p>
                </div>
              </div>
              <button 
                onClick={() => setIsContactModalOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3.5">
                {/* CONTACT 1 */}
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Transport Helpdesk (Plant 1)</h4>
                    <p className="text-[10px] text-slate-400 font-semibold font-mono">Main Office Helpline</p>
                  </div>
                  <a href="tel:+912027472851" className="text-blue-600 font-bold font-mono text-xs hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                    <Phone className="w-3 h-3" /> +91 20 2747 2851
                  </a>
                </div>

                {/* CONTACT 2 */}
                <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">Emergency Breakdowns</h4>
                    <p className="text-[10px] text-rose-400 font-semibold font-mono">24/7 Breakdown Dispatcher</p>
                  </div>
                  <a href="tel:+919876543210" className="text-rose-700 font-bold font-mono text-xs hover:underline flex items-center gap-1 bg-white border border-rose-200 px-2.5 py-1.5 rounded-lg">
                    <Phone className="w-3 h-3" /> +91 98765 43210
                  </a>
                </div>

                {/* CONTACT 3 */}
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Shift A Transport Head</h4>
                    <p className="text-[10px] text-slate-400 font-semibold font-mono">Coordinator Desk</p>
                  </div>
                  <a href="tel:+919876543211" className="text-blue-600 font-bold font-mono text-xs hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                    <Phone className="w-3 h-3" /> +91 98765 43211
                  </a>
                </div>

                {/* CONTACT 4 */}
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Shift B Transport Head</h4>
                    <p className="text-[10px] text-slate-400 font-semibold font-mono">Coordinator Desk</p>
                  </div>
                  <a href="tel:+919876543212" className="text-blue-600 font-bold font-mono text-xs hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                    <Phone className="w-3 h-3" /> +91 98765 43212
                  </a>
                </div>

                {/* CONTACT 5 */}
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Security Command Desk</h4>
                    <p className="text-[10px] text-slate-400 font-semibold font-mono">Incident Dispatch Center</p>
                  </div>
                  <a href="tel:+912027479999" className="text-blue-600 font-bold font-mono text-xs hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                    <Phone className="w-3 h-3" /> +91 20 2747 9999
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right shrink-0">
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Support
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
