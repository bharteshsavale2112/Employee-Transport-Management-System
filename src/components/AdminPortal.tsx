/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  FileCheck, 
  Clock, 
  XCircle, 
  CheckCircle, 
  Search, 
  Filter, 
  Trash2, 
  Database, 
  Download, 
  ExternalLink,
  MessageSquare,
  Bus,
  RefreshCw,
  TrendingUp,
  Award,
  MapPin,
  Settings,
  Grid,
  Map,
  ShieldCheck,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Employee, BusPass, PassRequest, ScanLog, BUS_ROUTES } from '../types';
import { ExcelStore, RouteTracking } from '../dbSim';
import { BajajHorizontalLogo, BajajFavouriteIndianLogo } from './BajajLogo';

interface AdminPortalProps {
  onBackToPortalSelection: () => void;
}

export default function AdminPortal({ onBackToPortalSelection }: AdminPortalProps) {
  // Database Tables State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [requests, setRequests] = useState<PassRequest[]>([]);
  const [passes, setPasses] = useState<BusPass[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [routeTrackings, setRouteTrackings] = useState<RouteTracking[]>([]);

  // Active Tab: overview (Dashboard), employees, routes, requests (Pass Requests), passes (Generated Passes), live-tracking, settings (Excel Store)
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'routes' | 'requests' | 'passes' | 'live-tracking' | 'settings'>('overview');

  // Mobile Sidebar open/close
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Live Tracking Links state
  const [editingRoute, setEditingRoute] = useState<string | null>(null);
  const [editLinkValue, setEditLinkValue] = useState('');

  // Modal / Inline Reject State
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionComments, setRejectionComments] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load and refresh state
  const refreshAllData = () => {
    setEmployees(ExcelStore.getEmployees());
    setRequests(ExcelStore.getRequests());
    setPasses(ExcelStore.getPasses());
    setScanLogs(ExcelStore.getScanLogs());
    setRouteTrackings(ExcelStore.getRouteTracking());
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Approve Request
  const handleApprove = (req: PassRequest) => {
    const startDate = new Date().toISOString().split('T')[0];
    const end = new Date(startDate);
    
    if (req.passType === 'Monthly') {
      end.setDate(end.getDate() + 30);
    } else if (req.passType === 'Quarterly') {
      end.setDate(end.getDate() + 90);
    } else {
      end.setDate(end.getDate() + 365);
    }
    const endDate = end.toISOString().split('T')[0];

    const newPass: BusPass = {
      passId: 'PASS' + Math.floor(3000 + Math.random() * 6000),
      employeeId: req.employeeId,
      employeeName: req.employeeName,
      route: req.route,
      startDate,
      endDate,
      status: 'Active',
      passType: req.passType,
      qrCodeContent: `PASS:PASS${Math.floor(3000 + Math.random() * 6000)}|EMP:${req.employeeId}|ROUTE:${req.route.split(':')[0]}|EXP:${endDate}`
    };

    const allPasses = ExcelStore.getPasses();
    const updatedPasses = allPasses.map(p => {
      if (p.employeeId === req.employeeId && p.status === 'Active') {
        return { ...p, status: 'Expired' as const };
      }
      return p;
    });
    updatedPasses.push(newPass);
    ExcelStore.savePasses(updatedPasses);

    const allRequests = ExcelStore.getRequests();
    const updatedRequests = allRequests.map(r => {
      if (r.requestId === req.requestId) {
        return { ...r, status: 'Approved' as const, adminComments: 'Approved and issued by administrator.' };
      }
      return r;
    });
    ExcelStore.saveRequests(updatedRequests);

    triggerToast(`Request ${req.requestId} approved! Pass ${newPass.passId} created successfully.`);
    refreshAllData();
  };

  // Handle Reject Request Submission
  const submitReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequestId) return;

    const allRequests = ExcelStore.getRequests();
    const updatedRequests = allRequests.map(r => {
      if (r.requestId === rejectingRequestId) {
        return { 
          ...r, 
          status: 'Rejected' as const, 
          adminComments: rejectionComments.trim() || 'Rejected by Administrator.' 
        };
      }
      return r;
    });
    ExcelStore.saveRequests(updatedRequests);

    triggerToast(`Request ${rejectingRequestId} has been rejected.`, 'error');
    setRejectingRequestId(null);
    setRejectionComments('');
    refreshAllData();
  };

  // Handle Save Tracking Link
  const handleSaveTrackingLink = (routeName: string, trackingLink: string) => {
    const updated = routeTrackings.map(t => {
      if (t.routeName === routeName) {
        return { ...t, trackingLink };
      }
      return t;
    });
    ExcelStore.saveRouteTracking(updated);
    setEditingRoute(null);
    triggerToast(`Live GPS tracking link updated for route!`);
    refreshAllData();
  };

  // Export any of our Excel simulator sheets to standard CSV
  const exportToCSV = (filename: string, dataset: any[]) => {
    if (!dataset || dataset.length === 0) {
      triggerToast('No rows found to export.', 'error');
      return;
    }

    const headers = Object.keys(dataset[0]);
    const csvContent = [
      headers.join(','), 
      ...dataset.map(row => 
        headers.map(fieldName => {
          let value = row[fieldName];
          if (value === undefined || value === null) value = '';
          const strVal = String(value).replace(/"/g, '""');
          return strVal.includes(',') || strVal.includes('\n') ? `"${strVal}"` : strVal;
        }).join(',')
      )
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    triggerToast(`Exported ${filename}.xlsx successfully as CSV!`);
  };

  const handleResetDatabase = () => {
    if (window.confirm('Are you sure you want to reset the database? This will restore original pre-seeded employee accounts, active passes, and pending requests.')) {
      ExcelStore.resetDb();
      refreshAllData();
      triggerToast('Database fully reset to pre-seeded Excel spreadsheets.');
    }
  };

  // Calculation statistics for overview cards
  const totalRoutesCount = BUS_ROUTES.length;
  const activePassesCount = passes.filter(p => p.status === 'Active').length;
  const pendingRequestsCount = requests.filter(r => r.status === 'Pending').length;
  const totalEmployeesCount = employees.length;

  // Department counts computed dynamically
  const deptStats: { name: string; count: number }[] = [];
  employees.forEach(emp => {
    const existing = deptStats.find(d => d.name === emp.department);
    if (existing) {
      existing.count += 1;
    } else {
      deptStats.push({ name: emp.department, count: 1 });
    }
  });

  // Passenger volume per route (number of active passes per route)
  const routeStats = BUS_ROUTES.map(route => {
    const activePassCountOnRoute = passes.filter(p => p.status === 'Active' && p.route === route.name).length;
    return {
      routeNameShort: route.name.split(':')[0],
      routeNameFull: route.name,
      activeCount: activePassCountOnRoute
    };
  });

  // Live GPS Coverage coverage
  const coveredRoutesCount = routeTrackings.filter(t => t.trackingLink && t.trackingLink.trim() !== '').length;
  const coveragePercent = totalRoutesCount > 0 ? Math.round((coveredRoutesCount / totalRoutesCount) * 100) : 0;

  return (
    <div id="admin-portal-root" className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans antialiased">
      
      {/* MOBILE HEADER (Only shows on small screens) */}
      <div className="md:hidden bg-gradient-to-r from-[#0056b3] to-[#003b80] text-white px-4 py-3.5 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🚍</span>
          <span className="font-extrabold text-sm tracking-wide">BAJAJ AUTO ADMIN</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* PERSISTENT LEFT SIDEBAR */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      <aside 
        id="sidebar"
        className={`fixed inset-y-0 left-0 w-[270px] bg-gradient-to-b from-[#0056b3] to-[#003b80] text-white p-6 flex flex-col justify-between transition-all duration-300 z-40 overflow-y-auto shadow-2xl
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:sticky md:h-screen md:top-0 md:shrink-0`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="logo mb-8 flex flex-col border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <BajajHorizontalLogo inverted={true} className="h-10 px-3 py-1.5 rounded-xl shrink-0" />
            </div>
            <span className="text-[11px] font-black text-blue-100 tracking-wider uppercase mt-3 opacity-80 font-sans">
              Transport Admin Panel
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="menu flex flex-col gap-1.5">
            <button
              onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white/15 text-white font-extrabold shadow-sm border-l-4 border-white'
                  : 'text-blue-50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab('employees'); setMobileSidebarOpen(false); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'employees'
                  ? 'bg-white/15 text-white font-extrabold shadow-sm border-l-4 border-white'
                  : 'text-blue-50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Employee Directory</span>
            </button>

            <button
              onClick={() => { setActiveTab('routes'); setMobileSidebarOpen(false); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'routes'
                  ? 'bg-white/15 text-white font-extrabold shadow-sm border-l-4 border-white'
                  : 'text-blue-50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>Transit Routes</span>
            </button>

            <button
              onClick={() => { setActiveTab('requests'); setMobileSidebarOpen(false); }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-white/15 text-white font-extrabold shadow-sm border-l-4 border-white'
                  : 'text-blue-50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4" />
                <span>Pass Requests</span>
              </div>
              {pendingRequestsCount > 0 && (
                <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('passes'); setMobileSidebarOpen(false); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'passes'
                  ? 'bg-white/15 text-white font-extrabold shadow-sm border-l-4 border-white'
                  : 'text-blue-50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Generated Passes</span>
            </button>

            <button
              onClick={() => { setActiveTab('live-tracking'); setMobileSidebarOpen(false); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'live-tracking'
                  ? 'bg-white/15 text-white font-extrabold shadow-sm border-l-4 border-white'
                  : 'text-blue-50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Live GPS Links</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white/15 text-white font-extrabold shadow-sm border-l-4 border-white'
                  : 'text-blue-50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Spreadsheets & DB</span>
            </button>
          </nav>

          {/* Quick Exports Section */}
          <div className="mt-8 border-t border-white/10 pt-6 hidden md:block">
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest block mb-3 opacity-60">
              Quick CSV Downloads
            </span>
            <div className="flex flex-col gap-1.5 text-xs text-blue-100">
              <button 
                onClick={() => exportToCSV('employees', employees)}
                className="hover:text-white flex items-center gap-2 hover:bg-white/5 py-2 px-3 rounded-lg transition-colors text-left"
              >
                <Download className="w-3.5 h-3.5 text-blue-200" />
                <span>Employees Sheet</span>
              </button>
              <button 
                onClick={() => exportToCSV('passes', passes)}
                className="hover:text-white flex items-center gap-2 hover:bg-white/5 py-2 px-3 rounded-lg transition-colors text-left"
              >
                <Download className="w-3.5 h-3.5 text-blue-200" />
                <span>Active Passes Sheet</span>
              </button>
              <button 
                onClick={() => exportToCSV('pass_requests', requests)}
                className="hover:text-white flex items-center gap-2 hover:bg-white/5 py-2 px-3 rounded-lg transition-colors text-left"
              >
                <Download className="w-3.5 h-3.5 text-blue-200" />
                <span>Requests Sheet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer buttons */}
        <div className="border-t border-white/10 pt-6 mt-6 flex flex-col gap-2.5">
          <button
            onClick={handleResetDatabase}
            className="flex items-center space-x-2.5 w-full px-4 py-2.5 bg-rose-700/50 hover:bg-rose-700 text-rose-100 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer border border-rose-500/10 hover:border-rose-500/20"
          >
            <Trash2 className="w-4 h-4 text-rose-300" />
            <span>Reset Database</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE Area */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* TOPBAR HEADER */}
        <header className="bg-white border-b border-slate-200/85 sticky top-0 z-30 px-6 py-4.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">
              {activeTab === 'overview' && 'Admin Dashboard'}
              {activeTab === 'employees' && 'Employee Directory'}
              {activeTab === 'routes' && 'Transit Routes Manager'}
              {activeTab === 'requests' && 'Commuter Pass Request Manager'}
              {activeTab === 'passes' && 'Commuter Pass Database'}
              {activeTab === 'live-tracking' && 'Live GPS Fleet Tracker'}
              {activeTab === 'settings' && 'Simulated Spreadsheets'}
            </h1>
            <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-semibold font-mono">
              Bajaj Auto Transport Management System
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={refreshAllData}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh Sheets Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            {/* Administrator Profile Card */}
            <div className="bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-left hidden sm:flex items-center space-x-2.5">
              <div className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                A
              </div>
              <div>
                <p className="text-xs font-black text-slate-700 leading-none">Admin User</p>
                <p className="text-[9px] text-slate-400 mt-0.5 font-mono font-bold">Transport Division</p>
              </div>
            </div>
          </div>
        </header>

        {/* TOAST NOTIFICATION SYSTEM */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 animate-bounce">
            <div className={`px-4 py-3.5 rounded-xl shadow-xl text-white font-semibold text-xs flex items-center gap-2 ${
              toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}>
              {toastMessage.type === 'success' ? <CheckCircle className="w-4.5 h-4.5" /> : <XCircle className="w-4.5 h-4.5" />}
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* SCROLLABLE MODULE BODY CONTAINER */}
        <main className="flex-grow p-6 space-y-6 overflow-y-auto">

          {/* OPERATIONAL METRICS CARDS */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Employees */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/70 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Employees</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{totalEmployeesCount}</p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="text-green-500 font-bold">✓</span> Registered profiles
                </p>
              </div>
              <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl">
                <Users className="w-5.5 h-5.5" />
              </div>
            </div>

            {/* Total Routes */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/70 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Routes</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{totalRoutesCount}</p>
                <p className="text-[10px] text-indigo-600 font-mono font-semibold">
                  {coveragePercent}% GPS coverage
                </p>
              </div>
              <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl">
                <Bus className="w-5.5 h-5.5" />
              </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/70 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending Requests</p>
                <p className="text-2xl font-black text-slate-900 leading-none">
                  {pendingRequestsCount > 0 ? (
                    <span className="text-amber-500 animate-pulse">{pendingRequestsCount}</span>
                  ) : (
                    pendingRequestsCount
                  )}
                </p>
                <p className="text-[10px] text-slate-400">
                  {pendingRequestsCount > 0 ? 'Requires attention' : 'All clear'}
                </p>
              </div>
              <div className={`p-3.5 rounded-2xl ${pendingRequestsCount > 0 ? 'bg-amber-50 text-amber-500 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
                <Clock className="w-5.5 h-5.5" />
              </div>
            </div>

            {/* Active Bus Passes */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/70 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Bus Passes</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{activePassesCount}</p>
                <p className="text-[10px] text-slate-400">
                  Authorized commuters
                </p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl">
                <FileCheck className="w-5.5 h-5.5" />
              </div>
            </div>

          </section>

          {/* MAIN MODULE TAB PANEL DISPLAYS */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 min-h-[400px]">
            
            {/* TAB 1: DASHBOARD OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                
                {/* 4 GRAPHICAL INTERACTIVE CHARTS BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* CHART A: Commuters by Department (Bar Chart) */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                      <span>Employees by Department</span>
                      <span className="text-[10px] font-mono font-bold text-blue-600">Dynamic Count</span>
                    </h4>
                    
                    {deptStats.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs italic">
                        No department data found.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {deptStats.map((dept, idx) => {
                          const maxCount = Math.max(...deptStats.map(d => d.count), 1);
                          const barWidthPercent = Math.round((dept.count / maxCount) * 100);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-700">{dept.name}</span>
                                <span className="font-mono font-bold text-slate-500">{dept.count}</span>
                              </div>
                              <div className="w-full bg-slate-200/60 rounded-full h-3.5 overflow-hidden">
                                <div 
                                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${barWidthPercent}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* CHART B: Pass Requests by Status (Status Indicators) */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                      <span>Pass Requests Distribution</span>
                      <span className="text-[10px] font-mono font-bold text-blue-600">Total: {requests.length}</span>
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {/* Approved */}
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Approved</span>
                        <p className="text-lg font-black text-emerald-950 mt-1">
                          {requests.filter(r => r.status === 'Approved').length}
                        </p>
                      </div>
                      {/* Pending */}
                      <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pending</span>
                        <p className="text-lg font-black text-amber-950 mt-1">
                          {requests.filter(r => r.status === 'Pending').length}
                        </p>
                      </div>
                      {/* Rejected */}
                      <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Rejected</span>
                        <p className="text-lg font-black text-rose-950 mt-1">
                          {requests.filter(r => r.status === 'Rejected').length}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-3.5 rounded-xl">
                      <p className="font-bold text-slate-800 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Instant Credential Pipeline</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        When requests are Approved, active passes with secure cryptographic QR configurations are compiled instantly and deployed to employees.
                      </p>
                    </div>
                  </div>

                  {/* CHART C: Employees by Route (Horizontal Load Bars) */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                      <span>Route Commuter Volume (Passenger Load)</span>
                      <span className="text-[10px] font-mono font-bold text-blue-600">Active Commuters</span>
                    </h4>

                    <div className="space-y-3.5">
                      {routeStats.map((stat, idx) => {
                        const totalActiveOnRoutes = Math.max(...routeStats.map(s => s.activeCount), 1);
                        const loadPercent = Math.round((stat.activeCount / totalActiveOnRoutes) * 100);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-medium text-slate-700 truncate max-w-[200px]" title={stat.routeNameFull}>
                                {stat.routeNameFull}
                              </span>
                              <span className="font-mono font-bold text-blue-700">{stat.activeCount} active</span>
                            </div>
                            <div className="w-full bg-slate-200/50 rounded-full h-2.5 overflow-hidden">
                              <div 
                                className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                                style={{ width: `${loadPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* CHART D: Live GPS Coverage Coverage (Donut representation) */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                        <span>Live GPS Fleet Tracking Coverage</span>
                        <span className="text-[10px] font-mono font-bold text-blue-600">Real-time status</span>
                      </h4>

                      <div className="flex items-center space-x-6 py-2">
                        {/* Circle Dial */}
                        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-200"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-blue-600 transition-all duration-1000"
                              strokeDasharray={`${coveragePercent}, 100`}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-lg font-black text-slate-800 leading-none">{coveragePercent}%</span>
                            <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Covered</span>
                          </div>
                        </div>

                        {/* Coverage Details */}
                        <div className="space-y-1.5 text-xs">
                          <p className="font-semibold text-slate-700">GPS Fleet Connections</p>
                          <p className="text-slate-500 leading-relaxed text-[11px]">
                            {coveredRoutesCount} of {totalRoutesCount} corporate bus routes are currently equipped with a live tracking link.
                          </p>
                          <button
                            onClick={() => setActiveTab('live-tracking')}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5 mt-1"
                          >
                            <span>Manage links</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200/80 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                      <span>GPS Protocol Version: TLS 1.3</span>
                      <span>Simulated Tracking</span>
                    </div>
                  </div>

                </div>

                {/* DUAL TABLES FOR DETAILED OVERVIEW */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Recent Commuters List (1/3 width) */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-white xl:col-span-1">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center">
                      <span>Recent Employees</span>
                      <button 
                        onClick={() => setActiveTab('employees')}
                        className="text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        All Profiles
                      </button>
                    </h4>

                    {employees.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">No registered profiles.</div>
                    ) : (
                      <div className="space-y-3">
                        {employees.slice(-4).reverse().map((emp) => (
                          <div key={emp.employeeId} className="flex items-center space-x-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                              {emp.name.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 truncate">{emp.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{emp.employeeId} • {emp.department}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Live Scan Boarding Logs (2/3 width) */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-white xl:col-span-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center">
                      <span>Recent Boarding Scans</span>
                      <button 
                        onClick={() => setActiveTab('settings')}
                        className="text-[10px] font-bold text-blue-600 hover:underline font-mono"
                      >
                        scan_logs.xlsx
                      </button>
                    </h4>

                    {scanLogs.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">No scan events recorded.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold">
                              <th className="pb-2">Commuter</th>
                              <th className="pb-2">Route</th>
                              <th className="pb-2">Time</th>
                              <th className="pb-2 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {scanLogs.slice(0, 4).map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/40">
                                <td className="py-2.5 font-semibold text-slate-800">
                                  {log.employeeName}
                                  <span className="text-[10px] text-slate-400 font-mono block">{log.employeeId}</span>
                                </td>
                                <td className="py-2.5 text-slate-500 truncate max-w-[150px]" title={log.route}>
                                  {log.route}
                                </td>
                                <td className="py-2.5 text-[10px] font-mono text-slate-400">
                                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-2.5 text-right">
                                  <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                                    log.status === 'Valid' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                                  }`}>
                                    {log.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: EMPLOYEE DIRECTORY */}
            {activeTab === 'employees' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                  <div>
                    <h3 className="text-md font-bold text-slate-800">Commuter Registry</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Accounts logged in employees.xlsx spreadsheet database.</p>
                  </div>

                  {/* SEARCH bar */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by ID, name, or department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>
                </div>

                {employees.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">No employees registered.</div>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b border-slate-100 font-bold tracking-wider">
                        <tr>
                          <th className="px-5 py-3.5">Employee ID</th>
                          <th className="px-5 py-3.5">Full Name</th>
                          <th className="px-5 py-3.5">Department</th>
                          <th className="px-5 py-3.5">Corporate Email</th>
                          <th className="px-5 py-3.5">Phone Number</th>
                          <th className="px-5 py-3.5">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {employees
                          .filter(e => 
                            e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            e.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            e.department.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((emp) => (
                            <tr key={emp.employeeId} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{emp.employeeId}</td>
                              <td className="px-5 py-3.5 font-bold text-slate-900">{emp.name}</td>
                              <td className="px-5 py-3.5 text-slate-600">{emp.department}</td>
                              <td className="px-5 py-3.5 text-slate-500">{emp.email}</td>
                              <td className="px-5 py-3.5 font-mono text-slate-500">{emp.phone}</td>
                              <td className="px-5 py-3.5 font-mono text-slate-400">{emp.joinedDate}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TRANSIT ROUTES PANEL */}
            {activeTab === 'routes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-bold text-slate-800">Transit Routes Database</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Review route distributions and physical passenger loads.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left list of routes */}
                  <div className="space-y-4">
                    {BUS_ROUTES.map((route) => {
                      const activePassOnRoute = passes.filter(p => p.status === 'Active' && p.route === route.name);
                      const matchingLink = routeTrackings.find(t => t.routeName === route.name);
                      
                      return (
                        <div key={route.id} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-mono text-[10px] font-bold text-blue-600 uppercase bg-blue-50 border border-blue-200/50 px-2 py-0.5 rounded-md">
                                {route.id}
                              </span>
                              <h4 className="text-xs font-bold text-slate-800 mt-2">{route.name}</h4>
                            </div>
                            <span className="bg-white border border-slate-200/80 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-700 shadow-2xs shrink-0">
                              {activePassOnRoute.length} Commuters
                            </span>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 text-xs">
                            <span className="text-slate-500 text-[11px] font-semibold">
                              GPS Status:{' '}
                              {matchingLink?.trackingLink ? (
                                <span className="text-emerald-600 font-bold">● Active Fleet GPS Link</span>
                              ) : (
                                <span className="text-slate-400">No Live GPS link</span>
                              )}
                            </span>

                            {matchingLink?.trackingLink && (
                              <a 
                                href={matchingLink.trackingLink} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1 shrink-0 text-[11px]"
                              >
                                <span>Track Live Fleet</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right side helper info */}
                  <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Route Analytics & Optimization</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Transit routes represent the geographic distribution of your corporate commuter shuttle network. Use passenger metrics to optimize vehicle allocations and fleet size.
                      </p>
                      
                      <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-2.5 text-xs text-slate-700">
                        <p className="font-bold text-slate-800">Operational Guideline:</p>
                        <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
                          <li>Assign route-tracking URLs in the <strong>Live GPS Links</strong> tab.</li>
                          <li>When live tracking is configured, commuters see a dynamic GPS map link directly on their electronic boarding pass!</li>
                          <li>Scan logs update instantly with the corresponding route details for real-time validation.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs text-blue-900 mt-6">
                      <p className="font-bold">Did you know?</p>
                      <p className="text-blue-800/90 text-[11px] mt-0.5">
                        Route 101 is historically the highest-demand commuter transit line, carrying software developers to the main office hub daily.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PASS REQUESTS PANEL */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-md font-bold text-slate-800">Pass Request Manager</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Review, approve, or reject employee commuters' transport requests.</p>
                  </div>
                  
                  {/* Status Filters */}
                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Requests</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Reject Input modal drawer */}
                {rejectingRequestId && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-50 border border-rose-200/80 rounded-2xl p-5 max-w-lg shadow-sm"
                  >
                    <form onSubmit={submitReject} className="space-y-3">
                      <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wide flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-rose-600" />
                        <span>Enter Rejection Reason for Request: {rejectingRequestId}</span>
                      </h4>
                      <input
                        type="text"
                        placeholder="e.g. Invalid corporate ID or route mismatch"
                        value={rejectionComments}
                        onChange={(e) => setRejectionComments(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-2xs"
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors shadow-sm"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingRequestId(null);
                            setRejectionComments('');
                          }}
                          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors shadow-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {requests.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">No requests found.</div>
                ) : (
                  (() => {
                    const filteredRequests = requests.filter(r => statusFilter === 'All' ? true : r.status === statusFilter);
                    const permanentRequests = filteredRequests.filter(r => r.category !== 'Temporary');
                    const temporaryRequests = filteredRequests.filter(r => r.category === 'Temporary');

                    return (
                      <div className="space-y-8">
                        {/* Section 1: Permanent Pass Requests */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                              <span>Permanent Pass Requests ({permanentRequests.length})</span>
                            </h4>
                            <span className="text-[10px] text-slate-500 font-medium">Sheet: pass_requests.xlsx (Permanent)</span>
                          </div>
                          {permanentRequests.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white text-xs">
                              No permanent pass requests match the selected status filter.
                            </div>
                          ) : (
                            <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-xs">
                              <table className="w-full text-left text-xs text-slate-600">
                                <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/70 border-b border-slate-100 font-bold tracking-wider">
                                  <tr>
                                    <th className="px-5 py-3.5">Req ID</th>
                                    <th className="px-5 py-3.5">Commuter Passenger</th>
                                    <th className="px-5 py-3.5">Department</th>
                                    <th className="px-5 py-3.5">Mobile</th>
                                    <th className="px-5 py-3.5">Transit Route</th>
                                    <th className="px-5 py-3.5">Bus Stop</th>
                                    <th className="px-5 py-3.5">Pass Term</th>
                                    <th className="px-5 py-3.5">Request Date</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                  {permanentRequests.map((req) => (
                                    <tr key={req.requestId} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{req.requestId}</td>
                                      <td className="px-5 py-3.5 font-bold text-slate-900">
                                        <div>{req.employeeName}</div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{req.employeeId}</div>
                                        {(req.gender || req.shift) && (
                                          <div className="text-[9px] text-indigo-600 font-bold mt-1 bg-indigo-50 inline-block px-1.5 py-0.5 rounded border border-indigo-100/50">
                                            {req.gender || 'Male'} • {req.shift || 'General Shift'}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-5 py-3.5 text-slate-600">{req.department}</td>
                                      <td className="px-5 py-3.5 font-mono text-slate-500">{req.mobile || req.phone || '-'}</td>
                                      <td className="px-5 py-3.5 max-w-[150px] truncate text-slate-700" title={req.route}>
                                        <div>{req.route}</div>
                                        {req.address && (
                                          <div className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-[140px]" title={req.address}>
                                            Addr: {req.address}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-5 py-3.5 text-slate-600 font-medium">
                                        <div className="text-slate-800 font-semibold">{req.busStop || req.pickupLocation || 'Not Specified'}</div>
                                        {req.dropLocation && (
                                          <div className="text-[10px] text-slate-400 mt-0.5">Drop: {req.dropLocation}</div>
                                        )}
                                      </td>
                                      <td className="px-5 py-3.5">
                                        <span className="bg-slate-100 text-slate-700 border border-slate-200/40 px-2 py-0.5 rounded font-semibold text-[10px]">
                                          {req.passType}
                                        </span>
                                      </td>
                                      <td className="px-5 py-3.5 font-mono text-slate-500">{req.requestedDate}</td>
                                      <td className="px-5 py-3.5">
                                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider ${
                                          req.status === 'Approved'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                            : req.status === 'Rejected'
                                            ? 'bg-rose-50 text-rose-700 border border-rose-200/50'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                                        }`}>
                                          {req.status}
                                        </span>
                                      </td>
                                      <td className="px-5 py-3.5 text-right">
                                        {req.status === 'Pending' ? (
                                          <div className="flex justify-end gap-1.5">
                                            <button
                                              onClick={() => handleApprove(req)}
                                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-xl text-[10px] transition-colors flex items-center gap-0.5 cursor-pointer shadow-xs"
                                            >
                                              <CheckCircle className="w-3.5 h-3.5" />
                                              <span>Approve</span>
                                            </button>
                                            <button
                                              onClick={() => setRejectingRequestId(req.requestId)}
                                              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded-xl text-[10px] transition-colors flex items-center gap-0.5 cursor-pointer shadow-xs"
                                            >
                                              <XCircle className="w-3.5 h-3.5" />
                                              <span>Reject</span>
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="text-[10px] text-slate-400 italic font-medium max-w-[120px] truncate block" title={req.adminComments || ''}>
                                            {req.adminComments || 'Processed.'}
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Section 2: Temporary Pass Requests */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                              <span>Temporary Pass Requests ({temporaryRequests.length})</span>
                            </h4>
                            <span className="text-[10px] text-slate-500 font-medium">Sheet: temp_pass_requests.xlsx (Temporary)</span>
                          </div>
                          {temporaryRequests.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white text-xs">
                              No temporary pass requests match the selected status filter.
                            </div>
                          ) : (
                            <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-xs">
                              <table className="w-full text-left text-xs text-slate-600">
                                <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/70 border-b border-slate-100 font-bold tracking-wider">
                                  <tr>
                                    <th className="px-5 py-3.5">Req ID</th>
                                    <th className="px-5 py-3.5">Commuter Passenger</th>
                                    <th className="px-5 py-3.5">Department</th>
                                    <th className="px-5 py-3.5">Mobile</th>
                                    <th className="px-5 py-3.5">Transit Route</th>
                                    <th className="px-5 py-3.5">Reason for Travel</th>
                                    <th className="px-5 py-3.5">Travel Date & Time</th>
                                    <th className="px-5 py-3.5">Request Date</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                  {temporaryRequests.map((req) => (
                                    <tr key={req.requestId} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{req.requestId}</td>
                                      <td className="px-5 py-3.5 font-bold text-slate-900">
                                        <div>{req.employeeName}</div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{req.employeeId}</div>
                                        {(req.gender || req.shift) && (
                                          <div className="text-[9px] text-indigo-600 font-bold mt-1 bg-indigo-50 inline-block px-1.5 py-0.5 rounded border border-indigo-100/50">
                                            {req.gender || 'Male'} • {req.shift || 'General Shift'}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-5 py-3.5 text-slate-600">{req.department}</td>
                                      <td className="px-5 py-3.5 font-mono text-slate-500">{req.mobile || req.phone || '-'}</td>
                                      <td className="px-5 py-3.5 max-w-[150px] truncate text-slate-700" title={req.route}>
                                        <div>{req.route}</div>
                                        {req.address && (
                                          <div className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-[140px]" title={req.address}>
                                            Addr: {req.address}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-5 py-3.5 text-slate-500 max-w-[180px] truncate" title={req.reason || ''}>
                                        <div>{req.reason || 'No reason provided'}</div>
                                        {req.dropLocation && (
                                          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Drop: {req.dropLocation}</div>
                                        )}
                                      </td>
                                      <td className="px-5 py-3.5 text-amber-700 font-semibold">{req.travelDateTime || 'Not specified'}</td>
                                      <td className="px-5 py-3.5 font-mono text-slate-500">{req.requestedDate}</td>
                                      <td className="px-5 py-3.5">
                                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider ${
                                          req.status === 'Approved'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                            : req.status === 'Rejected'
                                            ? 'bg-rose-50 text-rose-700 border border-rose-200/50'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                                        }`}>
                                          {req.status}
                                        </span>
                                      </td>
                                      <td className="px-5 py-3.5 text-right">
                                        {req.status === 'Pending' ? (
                                          <div className="flex justify-end gap-1.5">
                                            <button
                                              onClick={() => handleApprove(req)}
                                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-xl text-[10px] transition-colors flex items-center gap-0.5 cursor-pointer shadow-xs"
                                            >
                                              <CheckCircle className="w-3.5 h-3.5" />
                                              <span>Approve</span>
                                            </button>
                                            <button
                                              onClick={() => setRejectingRequestId(req.requestId)}
                                              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded-xl text-[10px] transition-colors flex items-center gap-0.5 cursor-pointer shadow-xs"
                                            >
                                              <XCircle className="w-3.5 h-3.5" />
                                              <span>Reject</span>
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="text-[10px] text-slate-400 italic font-medium max-w-[120px] truncate block" title={req.adminComments || ''}>
                                            {req.adminComments || 'Processed.'}
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            {/* TAB 5: GENERATED PASSES */}
            {activeTab === 'passes' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-md font-bold text-slate-800">Commuter Pass Database</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Authorized, expired, or suspended commuter credentials stored in passes.xlsx.</p>
                </div>

                {passes.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">No pass records found.</div>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b border-slate-100 font-bold tracking-wider">
                        <tr>
                          <th className="px-5 py-3.5">Pass ID</th>
                          <th className="px-5 py-3.5">Employee ID</th>
                          <th className="px-5 py-3.5">Passenger</th>
                          <th className="px-5 py-3.5">Authorized Route</th>
                          <th className="px-5 py-3.5">Type</th>
                          <th className="px-5 py-3.5">Start Date</th>
                          <th className="px-5 py-3.5">End Date</th>
                          <th className="px-5 py-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {passes.map((pass) => (
                          <tr key={pass.passId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3.5 font-mono font-bold text-blue-600">{pass.passId}</td>
                            <td className="px-5 py-3.5 font-mono text-slate-700">{pass.employeeId}</td>
                            <td className="px-5 py-3.5 font-bold text-slate-900">{pass.employeeName}</td>
                            <td className="px-5 py-3.5 max-w-[200px] truncate text-slate-700" title={pass.route}>
                              {pass.route}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="bg-slate-100 text-slate-700 border border-slate-200/40 px-2 py-0.5 rounded font-semibold text-[10px]">
                                {pass.passType}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-slate-500">{pass.startDate}</td>
                            <td className="px-5 py-3.5 font-mono text-slate-800 font-extrabold">{pass.endDate}</td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider ${
                                pass.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {pass.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: LIVE GPS FLEET LINKS MANAGER */}
            {activeTab === 'live-tracking' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-md font-bold text-slate-800">Live GPS Tracking Fleet Links</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paste live sharing URLs (Google Maps, GPS tracker, or fleet dispatch link) for each transit route. Employees will immediately see a GPS tracking button on their active pass.
                  </p>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b border-slate-100 font-bold tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Route</th>
                        <th className="px-5 py-3.5">Current Fleet GPS Tracking Link</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {BUS_ROUTES.map((route) => {
                        const tracking = routeTrackings.find(t => t.routeName === route.name);
                        const isEditing = editingRoute === route.name;
                        
                        return (
                          <tr key={route.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3.5 max-w-xs">
                              <span className="font-mono text-[9px] font-bold text-blue-600 uppercase bg-blue-50 border border-blue-200/50 px-1.5 py-0.5 rounded mr-2">
                                {route.id}
                              </span>
                              <span className="font-semibold text-slate-800">{route.name}</span>
                            </td>
                            
                            <td className="px-5 py-3.5">
                              {isEditing ? (
                                <input
                                  type="url"
                                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                                  placeholder="e.g. https://maps.google.com/?q=LiveBusGPS"
                                  value={editLinkValue}
                                  onChange={(e) => setEditLinkValue(e.target.value)}
                                />
                              ) : (
                                <div className="flex items-center space-x-2">
                                  {tracking?.trackingLink ? (
                                    <span className="text-slate-700 truncate max-w-md font-mono text-[11px] bg-slate-50 border border-slate-200/60 px-2 py-1 rounded">
                                      {tracking.trackingLink}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">No Link Configured</span>
                                  )}
                                  {tracking?.trackingLink && (
                                    <a 
                                      href={tracking.trackingLink} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-slate-100"
                                      title="Open / Test Link"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="px-5 py-3.5 text-right shrink-0">
                              {isEditing ? (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleSaveTrackingLink(route.name, editLinkValue)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer shadow-xs transition-colors"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingRoute(null)}
                                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer shadow-xs transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingRoute(route.name);
                                    setEditLinkValue(tracking?.trackingLink || '');
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer shadow-xs transition-colors inline-flex items-center gap-1"
                                >
                                  <span>Edit GPS Link</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 7: SIMULATED EXCEL SHEET DATASTORE VIEW */}
            {activeTab === 'settings' && (
              <div className="space-y-6 font-sans">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="text-md font-bold text-emerald-950 flex items-center gap-1.5">
                        <Database className="w-5 h-5 text-emerald-600" />
                        <span>Excel Spreadsheet Database Simulation</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        This view represents the raw content of your local Excel database spreadsheets (which mimic server storage). Exports CSV instantly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  
                  {/* SHEET 1: employees.xlsx */}
                  <div className="border border-emerald-100 rounded-2xl bg-white shadow-2xs overflow-hidden">
                    <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
                        employees.xlsx
                      </span>
                      <button
                        onClick={() => exportToCSV('employees', employees)}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Row CSV</span>
                      </button>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-left font-mono text-[11px] text-slate-700 divide-y divide-slate-100">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400">
                            <th className="px-3 py-2 font-semibold uppercase">employeeId</th>
                            <th className="px-3 py-2 font-semibold uppercase">name</th>
                            <th className="px-3 py-2 font-semibold uppercase">department</th>
                            <th className="px-3 py-2 font-semibold uppercase">email</th>
                            <th className="px-3 py-2 font-semibold uppercase">phone</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {employees.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="px-3 py-1.5 font-bold text-slate-900">{row.employeeId}</td>
                              <td className="px-3 py-1.5">{row.name}</td>
                              <td className="px-3 py-1.5">{row.department}</td>
                              <td className="px-3 py-1.5">{row.email}</td>
                              <td className="px-3 py-1.5">{row.phone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SHEET 2: pass_requests.xlsx */}
                  <div className="border border-emerald-100 rounded-2xl bg-white shadow-2xs overflow-hidden">
                    <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
                        pass_requests.xlsx
                      </span>
                      <button
                        onClick={() => exportToCSV('pass_requests', requests)}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Row CSV</span>
                      </button>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-left font-mono text-[11px] text-slate-700 divide-y divide-slate-100">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400">
                            <th className="px-3 py-2 font-semibold uppercase">requestId</th>
                            <th className="px-3 py-2 font-semibold uppercase">employeeId</th>
                            <th className="px-3 py-2 font-semibold uppercase">employeeName</th>
                            <th className="px-3 py-2 font-semibold uppercase">route</th>
                            <th className="px-3 py-2 font-semibold uppercase">passType</th>
                            <th className="px-3 py-2 font-semibold uppercase">requestedDate</th>
                            <th className="px-3 py-2 font-semibold uppercase">status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {requests.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="px-3 py-1.5 font-bold text-slate-900">{row.requestId}</td>
                              <td className="px-3 py-1.5">{row.employeeId}</td>
                              <td className="px-3 py-1.5 font-medium">{row.employeeName}</td>
                              <td className="px-3 py-1.5 truncate max-w-xs">{row.route}</td>
                              <td className="px-3 py-1.5 font-bold">{row.passType}</td>
                              <td className="px-3 py-1.5">{row.requestedDate}</td>
                              <td className={`px-3 py-1.5 font-bold ${
                                row.status === 'Approved' ? 'text-green-600' : row.status === 'Rejected' ? 'text-red-500' : 'text-amber-500'
                              }`}>{row.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SHEET 3: passes.xlsx */}
                  <div className="border border-emerald-100 rounded-2xl bg-white shadow-2xs overflow-hidden">
                    <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
                        passes.xlsx
                      </span>
                      <button
                        onClick={() => exportToCSV('passes', passes)}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Row CSV</span>
                      </button>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-left font-mono text-[11px] text-slate-700 divide-y divide-slate-100">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400">
                            <th className="px-3 py-2 font-semibold uppercase">passId</th>
                            <th className="px-3 py-2 font-semibold uppercase">employeeId</th>
                            <th className="px-3 py-2 font-semibold uppercase">employeeName</th>
                            <th className="px-3 py-2 font-semibold uppercase">route</th>
                            <th className="px-3 py-2 font-semibold uppercase">passType</th>
                            <th className="px-3 py-2 font-semibold uppercase">startDate</th>
                            <th className="px-3 py-2 font-semibold uppercase">endDate</th>
                            <th className="px-3 py-2 font-semibold uppercase">status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {passes.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="px-3 py-1.5 font-bold text-emerald-700">{row.passId}</td>
                              <td className="px-3 py-1.5 font-semibold">{row.employeeId}</td>
                              <td className="px-3 py-1.5">{row.employeeName}</td>
                              <td className="px-3 py-1.5 truncate max-w-xs">{row.route}</td>
                              <td className="px-3 py-1.5">{row.passType}</td>
                              <td className="px-3 py-1.5">{row.startDate}</td>
                              <td className="px-3 py-1.5 font-bold text-slate-900">{row.endDate}</td>
                              <td className="px-3 py-1.5 text-green-600 font-bold">{row.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SHEET 4: route_tracking_links.xlsx */}
                  <div className="border border-emerald-100 rounded-2xl bg-white shadow-2xs overflow-hidden">
                    <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
                        route_tracking_links.xlsx
                      </span>
                      <button
                        onClick={() => exportToCSV('route_tracking_links', routeTrackings)}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Row CSV</span>
                      </button>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-left font-mono text-[11px] text-slate-700 divide-y divide-slate-100">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400">
                            <th className="px-3 py-2 font-semibold uppercase">routeName</th>
                            <th className="px-3 py-2 font-semibold uppercase">trackingLink</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {routeTrackings.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="px-3 py-1.5 font-bold text-slate-900">{row.routeName}</td>
                              <td className="px-3 py-1.5 text-blue-600 font-mono text-[10px] truncate max-w-sm" title={row.trackingLink}>
                                {row.trackingLink || <span className="text-slate-400 italic">None</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SHEET 5: scan_logs.xlsx */}
                  <div className="border border-emerald-100 rounded-2xl bg-white shadow-2xs overflow-hidden">
                    <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
                        scan_logs.xlsx
                      </span>
                      <button
                        onClick={() => exportToCSV('scan_logs', scanLogs)}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Row CSV</span>
                      </button>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-left font-mono text-[11px] text-slate-700 divide-y divide-slate-100">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400">
                            <th className="px-3 py-2 font-semibold uppercase">id</th>
                            <th className="px-3 py-2 font-semibold uppercase">timestamp</th>
                            <th className="px-3 py-2 font-semibold uppercase">passId</th>
                            <th className="px-3 py-2 font-semibold uppercase">employeeId</th>
                            <th className="px-3 py-2 font-semibold uppercase">employeeName</th>
                            <th className="px-3 py-2 font-semibold uppercase">status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {scanLogs.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="px-3 py-1.5 font-bold text-slate-900">{row.id}</td>
                              <td className="px-3 py-1.5 text-[10px] text-slate-400">{row.timestamp}</td>
                              <td className="px-3 py-1.5">{row.passId}</td>
                              <td className="px-3 py-1.5">{row.employeeId}</td>
                              <td className="px-3 py-1.5 font-semibold">{row.employeeName}</td>
                              <td className={`px-3 py-1.5 font-bold ${
                                row.status === 'Valid' ? 'text-emerald-600' : 'text-red-500'
                              }`}>{row.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

        </main>

        {/* WORKSPACE FOOTER */}
        <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-400 mt-auto">
          <p>© 2026 Bajaj Auto Transport Management System. Simulated Database Admin Console.</p>
        </footer>

      </div>
    </div>
  );
}
