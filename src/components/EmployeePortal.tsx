/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Lock, 
  UserPlus, 
  FileText, 
  Bus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  PlusCircle, 
  QrCode, 
  Printer, 
  Building2, 
  Mail, 
  Phone,
  ShieldAlert,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Employee, BusPass, PassRequest, BUS_ROUTES, SHIFT_ROUTES } from '../types';
import { ExcelStore } from '../dbSim';
import LiveTracking from './LiveTracking';
import QRCode from 'qrcode';
import { BajajHorizontalLogo, BajajFavouriteIndianLogo } from './BajajLogo';

// Dynamic, actual valid QR Code rendering using the standard 'qrcode' package
const DynamicQRCode = ({ text }: { text: string }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (text) {
      QRCode.toDataURL(
        text,
        {
          width: 256,
          margin: 1,
          color: {
            dark: '#0f172a', // Rich slate-900 color for maximum scan contrast
            light: '#ffffff'
          }
        },
        (err, url) => {
          if (!err) {
            setQrUrl(url);
          } else {
            console.error('QR code generation error:', err);
          }
        }
      );
    }
  }, [text]);

  if (!qrUrl) {
    return (
      <div className="w-32 h-32 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center border border-slate-200">
        <span className="text-[10px] text-slate-400 font-mono font-semibold">Generating QR...</span>
      </div>
    );
  }

  return (
    <img
      src={qrUrl}
      alt="Commuter Pass QR Code"
      className="w-32 h-32 border border-slate-200 p-1.5 rounded-lg bg-white shadow-xs"
      referrerPolicy="no-referrer"
    />
  );
};

// Beautiful vector replica of the uploaded Transport Authority Signature image
const AuthoritySignatureSVG = () => {
  return (
    <div className="flex flex-col items-center select-none">
      <svg viewBox="0 0 180 120" className="w-40 h-24" fill="none" stroke="currentColor">
        {/* Tall vertical looping cursive flourish */}
        <path 
          d="M 28,82 C 32,75 58,25 48,15 C 40,5 45,65 35,92" 
          stroke="#1d4ed8" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Loop structure on the right side */}
        <path 
          d="M 62,65 C 80,55 88,60 76,82 C 64,102 62,112 68,118 C 74,124 82,108 88,96" 
          stroke="#1d4ed8" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Rising underline */}
        <path 
          d="M 68,92 L 155,70" 
          stroke="#1d4ed8" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
        />
        {/* Number 64/23 sitting on the underline */}
        {/* 6 */}
        <path 
          d="M 94,78 C 96,74 94,66 90,67 C 88,68 88,74 92,74 C 94,74 96,72 96,70" 
          stroke="#1d4ed8" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* 4 */}
        <path 
          d="M 104,65 L 98,75 L 108,72" 
          stroke="#1d4ed8" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* / */}
        <path 
          d="M 112,71 L 118,58" 
          stroke="#1d4ed8" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        {/* 2 */}
        <path 
          d="M 121,63 C 124,59 127,61 121,67 L 128,65" 
          stroke="#1d4ed8" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* 3 */}
        <path 
          d="M 131,59 C 135,58 133,63 131,63 C 135,63 134,68 129,67" 
          stroke="#1d4ed8" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
      <div className="w-36 h-[1.5px] bg-slate-200 mt-1" />
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 text-center">Authority Signature</p>
    </div>
  );
};

const DEPARTMENTS = [
  "Production",
  "Quality",
  "Maintenance",
  "HR",
  "Administration",
  "Alluminium Shop",
  "BU HR -Operations",
  "Central Maintenance",
  "Assembly Planned Maint",
  "Chassis Sub Assembly Center",
  "Civil",
  "Dispensary",
  "Civil & Utility",
  "Engine Assembly Line-KTM",
  "Engine Assembly",
  "Export",
  "Exoprt Assembly CKD",
  "Export Open",
  "Facility Engineering",
  "Flying Start GT-OP",
  "HRD",
  "Machining",
  "Manufacturing Check",
  "Manufacturing Engine",
  "ME (E&T)",
  "ME(Vehicle)",
  "Paint Shop",
  "Personnel",
  "PPC",
  "Production Planning",
  "Vehicel Assembly-Pulsar",
  "Quality Assurance",
  "Reliability Sub Vehicle",
  "Reliability Supply Vehicle",
  "Safety",
  "Security",
  "Steel Shop",
  "Steel Shop (C-10)",
  "Time Office",
  "Tool Room",
  "TPM",
  "Utilities & Services",
  "Vehicle Assembly Electric",
  "Vehicle Dispatch",
  "Vehicle Assembly",
  "Works Admin (C-01)"
];

interface EmployeePortalProps {
  onBackToPortalSelection: () => void;
}

export default function EmployeePortal({ onBackToPortalSelection }: EmployeePortalProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loggedInEmp, setLoggedInEmp] = useState<Employee | null>(null);
  
  // Registration Form State
  const [regId, setRegId] = useState('');
  const [regName, setRegName] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShift, setRegShift] = useState('');
  const [regRoute, setRegRoute] = useState('');
  const [regBusStop, setRegBusStop] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [routeSearch, setRouteSearch] = useState('');
  const [stopSearch, setStopSearch] = useState('');
  const [isRouteDropdownOpen, setIsRouteDropdownOpen] = useState(false);
  const [isStopDropdownOpen, setIsStopDropdownOpen] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Login Form State
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Portal State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my-pass' | 'apply' | 'history' | 'emergency'>('dashboard');
  const [showRoutesModal, setShowRoutesModal] = useState(false);
  const [showLiveTracking, setShowLiveTracking] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>(undefined);
  const [routesSearchQuery, setRoutesSearchQuery] = useState('');
  const [employeePasses, setEmployeePasses] = useState<BusPass[]>([]);
  const [employeeRequests, setEmployeeRequests] = useState<PassRequest[]>([]);
  const [routeTrackings, setRouteTrackings] = useState<any[]>([]);

  // Load route tracking links on mount
  useEffect(() => {
    setRouteTrackings(ExcelStore.getRouteTracking());
  }, []);

  // Apply Form State
  const [selectedRoute, setSelectedRoute] = useState(BUS_ROUTES[0].name);
  const [selectedPassType, setSelectedPassType] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [startDate, setStartDate] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  // Permanent vs Temporary request states
  const [requestCategory, setRequestCategory] = useState<'Permanent' | 'Temporary'>('Permanent');
  const [busStop, setBusStop] = useState('');
  const [reason, setReason] = useState('');
  const [travelDateTime, setTravelDateTime] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [shift, setShift] = useState('1st Shift');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [dropLocation] = useState('Bajaj Chakan Plant 1');

  // Set default start date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(tomorrow.toISOString().split('T')[0]);
    
    // Default tomorrow travel time
    const tomorrowDateTime = new Date();
    tomorrowDateTime.setDate(tomorrowDateTime.getDate() + 1);
    tomorrowDateTime.setHours(9, 0, 0, 0);
    // Format to YYYY-MM-DDTHH:mm
    const pad = (num: number) => String(num).padStart(2, '0');
    const formattedDateTime = `${tomorrowDateTime.getFullYear()}-${pad(tomorrowDateTime.getMonth() + 1)}-${pad(tomorrowDateTime.getDate())}T${pad(tomorrowDateTime.getHours())}:${pad(tomorrowDateTime.getMinutes())}`;
    setTravelDateTime(formattedDateTime);
  }, []);

  // Fetch logged-in employee pass & request data
  const refreshEmployeeData = (empId: string) => {
    const allPasses = ExcelStore.getPasses();
    const allRequests = ExcelStore.getRequests();
    
    setEmployeePasses(allPasses.filter(p => p.employeeId === empId));
    setEmployeeRequests(allRequests.filter(r => r.employeeId === empId));
  };

  useEffect(() => {
    if (loggedInEmp) {
      refreshEmployeeData(loggedInEmp.employeeId);
      setCustomPhone(loggedInEmp.phone || '');
      if (loggedInEmp.shift) setShift(loggedInEmp.shift);
      if (loggedInEmp.busStop) setBusStop(loggedInEmp.busStop);
      if (loggedInEmp.address) setAddress(loggedInEmp.address);
      if (loggedInEmp.routeNumber) setSelectedRoute(loggedInEmp.routeNumber);
    }
  }, [loggedInEmp]);

  // Handle Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regId || !regName || !regDept || !regEmail || !regPhone || !regPassword) {
      setRegError('Please fill in all mandatory fields.');
      return;
    }

    if (!regShift) {
      setRegError('कृपया Shift निवडा. (Please select a Shift.)');
      return;
    }

    if (!regRoute) {
      setRegError('कृपया यादीतून Route Number निवडा. (Please select Route Number from the list.)');
      return;
    }

    if (!regBusStop) {
      setRegError('कृपया यादीतून Bus Stop निवडा. (Please select a Bus Stop.)');
      return;
    }

    const employees = ExcelStore.getEmployees();
    
    // VALIDATION: Check if employee ID already exists
    const idExists = employees.some(
      emp => emp.employeeId.trim().toLowerCase() === regId.trim().toLowerCase()
    );

    if (idExists) {
      setRegError(`Employee ID already exists. Please verify your ID or contact administrator.`);
      return;
    }

    const newEmp: Employee = {
      employeeId: regId.trim().toUpperCase(),
      name: regName.trim(),
      department: regDept.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPassword,
      shift: regShift,
      routeNumber: regRoute,
      busStop: regBusStop,
      address: regAddress.trim(),
      joinedDate: new Date().toISOString().split('T')[0]
    };

    employees.push(newEmp);
    ExcelStore.saveEmployees(employees);

    setRegSuccess('Registration successful! You can now log in.');
    // Clear registration state
    setRegId('');
    setRegName('');
    setRegDept('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setRegShift('');
    setRegRoute('');
    setRegBusStop('');
    setRegAddress('');
    setRouteSearch('');
    setStopSearch('');

    // Auto-switch to login after 1.5s
    setTimeout(() => {
      setIsRegistering(false);
      setRegSuccess('');
    }, 1500);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginId || !loginPassword) {
      setLoginError('Please enter both Employee ID and password.');
      return;
    }

    const employees = ExcelStore.getEmployees();
    const foundEmp = employees.find(
      emp => emp.employeeId.trim().toUpperCase() === loginId.trim().toUpperCase()
    );

    if (!foundEmp) {
      setLoginError('Employee ID not found.');
      return;
    }

    if (foundEmp.password !== loginPassword) {
      setLoginError('Incorrect password. Please try again.');
      return;
    }

    setLoggedInEmp(foundEmp);
  };

  // Handle Apply for New Pass
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError('');
    setApplySuccess('');

    if (!loggedInEmp) return;

    // Validate based on selected category
    if (requestCategory === 'Permanent') {
      const pendingPermanent = employeeRequests.find(r => r.status === 'Pending' && r.category !== 'Temporary');
      if (pendingPermanent) {
        setApplyError('You already have a pending permanent pass request. Please wait for Admin approval.');
        return;
      }
      const activePermanent = employeePasses.find(p => p.status === 'Active' && p.passType !== 'Temporary');
      if (activePermanent) {
        setApplyError('You already have an active permanent bus pass. You cannot apply for a new one until it expires.');
        return;
      }
      if (!busStop.trim()) {
        setApplyError('Please enter your preferred Bus Stop / Pickup Location.');
        return;
      }
    } else {
      const pendingTemporary = employeeRequests.find(r => r.status === 'Pending' && r.category === 'Temporary');
      if (pendingTemporary) {
        setApplyError('You already have a pending temporary pass request. Please wait for Admin approval.');
        return;
      }
      if (!reason.trim()) {
        setApplyError('Please enter a valid Reason for your Temporary travel.');
        return;
      }
      if (!travelDateTime) {
        setApplyError('Please select a valid Travel Date & Time.');
        return;
      }
    }

    if (!address.trim()) {
      setApplyError('Please enter your Residential Address.');
      return;
    }

    const requests = ExcelStore.getRequests();
    const newRequest: PassRequest = {
      requestId: 'REQ' + Math.floor(2000 + Math.random() * 8000),
      employeeId: loggedInEmp.employeeId,
      employeeName: loggedInEmp.name,
      department: loggedInEmp.department,
      route: selectedRoute,
      passType: requestCategory === 'Temporary' ? 'Temporary' : selectedPassType,
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      category: requestCategory,
      busStop: requestCategory === 'Permanent' ? busStop.trim() : undefined,
      pickupLocation: requestCategory === 'Permanent' ? busStop.trim() : undefined,
      dropLocation: dropLocation,
      reason: requestCategory === 'Temporary' ? reason.trim() : undefined,
      travelDateTime: requestCategory === 'Temporary' ? travelDateTime.replace('T', ' ') : undefined,
      mobile: customPhone.trim() || loggedInEmp.phone,
      shift,
      gender,
      address: address.trim()
    };

    requests.push(newRequest);
    ExcelStore.saveRequests(requests);

    setApplySuccess(`Your ${requestCategory.toLowerCase()} pass request has been submitted successfully for Admin review!`);
    refreshEmployeeData(loggedInEmp.employeeId);
    
    // Clear custom form fields on success
    if (requestCategory === 'Permanent') {
      setBusStop('');
    } else {
      setReason('');
    }
    setAddress('');

    // Switch to history tab after 1.5 seconds
    setTimeout(() => {
      setActiveTab('history');
      setApplySuccess('');
    }, 1500);
  };

  const handleLogout = () => {
    setLoggedInEmp(null);
    setLoginId('');
    setLoginPassword('');
    setActiveTab('my-pass');
  };

  const activePass = employeePasses.find(p => p.status === 'Active');
  const pendingRequest = employeeRequests.find(r => r.status === 'Pending');

  const handlePrintPass = () => {
    window.print();
  };

  return (
    <div id="employee-portal-root" className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans antialiased">
      
      {/* HEADER */}
      <header id="employee-header" className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3.5 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BajajFavouriteIndianLogo className="scale-75 sm:scale-90 origin-left border-none shadow-none p-0 bg-transparent" />
            <div className="border-l border-slate-200 pl-3 hidden sm:block">
              <h1 className="text-xs font-black text-[#005cb9] tracking-tight uppercase leading-none">Employee Portal</h1>
              <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold font-mono">Corporate Transit</p>
            </div>
          </div>

          {loggedInEmp && (
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="text-right">
                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate max-w-[120px] sm:max-w-[180px]">{loggedInEmp.name}</p>
                <p className="text-[9px] sm:text-[10px] text-indigo-600 font-mono tracking-wider font-semibold mt-0.5">{loggedInEmp.employeeId} <span className="hidden sm:inline">• {loggedInEmp.department}</span></p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-1.5 text-rose-600 hover:bg-rose-50 px-2 sm:px-3 py-1.5 rounded-lg border border-rose-100 bg-white hover:border-rose-200 transition-all text-[10px] sm:text-xs font-semibold shadow-xs cursor-pointer shrink-0"
              >
                <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* PORTAL INNER BODY */}
      <main className="flex-grow p-4 sm:p-6 max-w-5xl mx-auto w-full">
        {showLiveTracking ? (
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <LiveTracking 
              initialRouteId={selectedRouteId} 
              onBack={() => { 
                setShowLiveTracking(false); 
                setSelectedRouteId(undefined); 
              }} 
            />
          </div>
        ) : !loggedInEmp ? (
          /* LOGIN OR REGISTER CARD */
          <div className={`${isRegistering ? 'max-w-4xl' : 'max-w-md'} mx-auto my-8 transition-all duration-300`}>
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden"
            >
              <div className={`grid ${isRegistering ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                {isRegistering && (
                  <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white p-8 sm:p-10 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="h-20 w-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl mb-6 border border-white/10">
                      🚌
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-white uppercase leading-none">
                      Bajaj Auto
                    </h1>

                    <p className="mt-2 text-indigo-100 text-md font-semibold">
                      Employee Registration Portal
                    </p>

                    <div className="mt-8 space-y-4 text-xs font-medium text-indigo-100">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✓</span> Employee Transport Access
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✓</span> Bus Pass Management
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✓</span> Shift Wise Registration
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✓</span> Plant 1 Transport System
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-8 md:p-10">
                  {/* Header */}
                  {!isRegistering ? (
                    <div className="text-center pb-6">
                      <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-indigo-100">
                        🔑
                      </div>
                      <h2 className="text-xl font-black text-slate-800 tracking-tight">Employee Access Portal</h2>
                      <p className="text-slate-400 text-xs mt-1">Log in with your corporate credentials to view your active pass</p>
                    </div>
                  ) : (
                    <div className="pb-6">
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Account</h2>
                      <p className="text-slate-400 text-xs mt-1">Register to access Bajaj Auto Transport Services</p>
                    </div>
                  )}

                  {isRegistering ? (
                    /* REGISTER FORM */
                    <form onSubmit={handleRegister} className="space-y-4">
                      {regError && (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                          <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{regError}</span>
                        </div>
                      )}
                      {regSuccess && (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs">
                          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{regSuccess}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Employee Code <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Enter Employee Code"
                              value={regId}
                              onChange={(e) => setRegId(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shadow-xs"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Employee Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter Employee Name"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shadow-xs"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="tel"
                              placeholder="Mobile Number"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shadow-xs"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={regDept}
                            onChange={(e) => setRegDept(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shadow-xs bg-white cursor-pointer"
                            required
                          >
                            <option value="">Select Department</option>
                            {DEPARTMENTS.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="email"
                              placeholder="Enter Email Address"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shadow-xs"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Shift <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={regShift}
                            onChange={(e) => {
                              setRegShift(e.target.value);
                              setRegRoute('');
                              setRegBusStop('');
                              setRouteSearch('');
                              setStopSearch('');
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shadow-xs bg-white cursor-pointer"
                            required
                          >
                            <option value="">Select Shift</option>
                            <option value="1st Shift">1st Shift</option>
                            <option value="2nd Shift">2nd Shift</option>
                            <option value="3rd Shift">3rd Shift</option>
                            <option value="General Shift">General Shift</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Route Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder={regShift ? "Type to search Route Number" : "Select Shift first"}
                              value={regRoute ? regRoute : routeSearch}
                              disabled={!regShift}
                              onFocus={() => {
                                if (regShift) {
                                  setIsRouteDropdownOpen(true);
                                  setRouteSearch('');
                                }
                              }}
                              onBlur={() => {
                                setTimeout(() => {
                                  setIsRouteDropdownOpen(false);
                                }, 200);
                              }}
                              onChange={(e) => {
                                setRouteSearch(e.target.value);
                                setRegRoute('');
                                setRegBusStop('');
                              }}
                              className={`w-full px-3 py-2 border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shadow-xs ${!regShift ? 'bg-slate-50 cursor-not-allowed text-slate-400 border-slate-200' : 'bg-white cursor-pointer border-slate-200'}`}
                            />
                            {isRouteDropdownOpen && regShift && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg max-h-48 overflow-y-auto shadow-lg z-50 py-1">
                                {(() => {
                                  const routes = Object.keys(SHIFT_ROUTES[regShift] || {});
                                  const filtered = routes.filter(r => r.toLowerCase().includes(routeSearch.toLowerCase()));
                                  if (filtered.length === 0) {
                                    return <div className="px-3 py-2 text-xs text-slate-400">No route found for this shift</div>;
                                  }
                                  return filtered.map((route) => (
                                    <button
                                      key={route}
                                      type="button"
                                      onClick={() => {
                                        setRegRoute(route);
                                        setRouteSearch(route);
                                        setIsRouteDropdownOpen(false);
                                        setRegBusStop('');
                                        setStopSearch('');
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors"
                                    >
                                      {route}
                                    </button>
                                  ));
                                })()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Bus Stop <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder={regRoute ? "Type to search Bus Stop" : "Select Route Number first"}
                              value={regBusStop ? regBusStop : stopSearch}
                              disabled={!regRoute}
                              onFocus={() => {
                                if (regRoute) {
                                  setIsStopDropdownOpen(true);
                                  setStopSearch('');
                                }
                              }}
                              onBlur={() => {
                                setTimeout(() => {
                                  setIsStopDropdownOpen(false);
                                }, 200);
                              }}
                              onChange={(e) => {
                                setStopSearch(e.target.value);
                                setRegBusStop('');
                              }}
                              className={`w-full px-3 py-2 border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shadow-xs ${!regRoute ? 'bg-slate-50 cursor-not-allowed text-slate-400 border-slate-200' : 'bg-white cursor-pointer border-slate-200'}`}
                            />
                            {isStopDropdownOpen && regShift && regRoute && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg max-h-48 overflow-y-auto shadow-lg z-50 py-1">
                                {(() => {
                                  const stops = SHIFT_ROUTES[regShift][regRoute] || [];
                                  const filtered = stops.filter(s => s.toLowerCase().includes(stopSearch.toLowerCase()));
                                  if (filtered.length === 0) {
                                    return <div className="px-3 py-2 text-xs text-slate-400">No bus stop found for this route</div>;
                                  }
                                  return filtered.map((stop) => (
                                    <button
                                      key={stop}
                                      type="button"
                                      onClick={() => {
                                        setRegBusStop(stop);
                                        setStopSearch(stop);
                                        setIsStopDropdownOpen(false);
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors"
                                    >
                                      {stop}
                                    </button>
                                  ));
                                })()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="password"
                              placeholder="Create Password"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shadow-xs"
                              required
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Address
                          </label>
                          <textarea
                            placeholder="Enter Address"
                            value={regAddress}
                            onChange={(e) => setRegAddress(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shadow-xs resize-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2 text-xs shadow-md cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Register Employee</span>
                      </button>

                      <div className="text-center mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsRegistering(false);
                            setRegError('');
                          }}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          Already have an account? Login
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* LOGIN FORM */
                    <form onSubmit={handleLogin} className="space-y-4">
                      {loginError && (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                          <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Employee ID
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="e.g. EMP1001"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shadow-xs"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shadow-xs"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 text-xs shadow-sm cursor-pointer"
                      >
                        <span>Sign In</span>
                      </button>

                      <div className="text-center mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsRegistering(true);
                            setLoginError('');
                          }}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          New to the system? Create an Account
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* LOGGED IN SYSTEM VIEW */
          <div className="space-y-6">
            {/* TABS NAVIGATION */}
            <div className="flex border-b border-slate-200/85 space-x-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-semibold text-xs tracking-tight transition-all cursor-pointer shrink-0 ${
                  activeTab === 'dashboard'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Employee Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('my-pass')}
                className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-semibold text-xs tracking-tight transition-all cursor-pointer shrink-0 ${
                  activeTab === 'my-pass'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>My Active Pass</span>
              </button>

              <button
                onClick={() => setActiveTab('apply')}
                className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-semibold text-xs tracking-tight transition-all cursor-pointer shrink-0 ${
                  activeTab === 'apply'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Request Bus Pass</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-semibold text-xs tracking-tight transition-all cursor-pointer shrink-0 ${
                  activeTab === 'history'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Request History</span>
              </button>

              <button
                onClick={() => setActiveTab('emergency')}
                className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-semibold text-xs tracking-tight transition-all cursor-pointer shrink-0 ${
                  activeTab === 'emergency'
                    ? 'border-red-600 text-red-600 bg-red-50/10'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse-subtle" />
                <span className="text-red-600 font-bold">Emergency Contacts</span>
              </button>
            </div>

            {/* TAB CONTENT PANEL */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden p-6 sm:p-8">
              
              {/* TAB 0: EMPLOYEE DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8 font-sans">
                  {/* Hero banner section */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-lg border border-slate-800">
                    {/* Background graphic */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay"
                      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop')` }}
                    />
                    <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center space-x-2 bg-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-300 border border-indigo-500/20 w-fit mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                        <span>BAJAJ TRANSPORT SERVICE</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Welcome Employee
                      </h2>
                      <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl">
                        Employee Transport Management Dashboard. Access schedules, check active QR passes, and request new shuttle permits seamlessly.
                      </p>
                    </div>
                  </div>

                  {/* Employee Profile Section */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-4xl shadow-sm shrink-0 border border-indigo-200/40">
                        👨
                      </div>
                      
                      <div className="flex-grow text-center md:text-left space-y-2">
                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center justify-center md:justify-start gap-2">
                          <span>{loggedInEmp.name}</span>
                          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-100 font-extrabold uppercase">
                            Active Session
                          </span>
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-600 font-medium">
                          <div className="flex items-center justify-center md:justify-start gap-2 bg-white/60 p-2 rounded border border-slate-200/40">
                            <span className="text-slate-400">Employee ID:</span>
                            <span className="font-mono font-bold text-slate-800">{loggedInEmp.employeeId}</span>
                          </div>
                          
                          <div className="flex items-center justify-center md:justify-start gap-2 bg-white/60 p-2 rounded border border-slate-200/40">
                            <span className="text-slate-400">Department:</span>
                            <span className="font-bold text-slate-800">{loggedInEmp.department}</span>
                          </div>

                          <div className="flex items-center justify-center md:justify-start gap-2 bg-white/60 p-2 rounded border border-slate-200/40">
                            <span className="text-slate-400">Join Date:</span>
                            <span className="font-mono font-semibold text-slate-700">{loggedInEmp.joinedDate || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Preferred stop or route if active */}
                        {activePass && (
                          <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2 border-t border-slate-200/50 text-[11px]">
                            <div className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                              <Bus className="w-3.5 h-3.5" />
                              <span>Route No: {activePass.route.split(':')[0]}</span>
                            </div>
                            <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Pickup Stops: {activePass.route.includes(' - ') ? activePass.route.split(' - ')[0].replace(/Route \d+:\s*/, '') : 'Assigned Stop'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Permanent Bus Pass Card */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                      <div>
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 w-fit">🎫</div>
                        <h4 className="text-sm font-extrabold text-slate-800">Permanent Bus Pass</h4>
                        <p className="text-[11px] text-slate-500 mt-1 mb-4 leading-relaxed">
                          Request or access your monthly, quarterly, or yearly continuous commuter pass.
                        </p>
                      </div>
                      
                      <div className="space-y-2 pt-2">
                        <button
                          onClick={() => {
                            setRequestCategory('Permanent');
                            setActiveTab('apply');
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Request Permanent Pass
                        </button>
                        <button
                          onClick={() => setActiveTab('my-pass')}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5 text-slate-500" />
                          <span>My Permanent Pass</span>
                        </button>
                      </div>
                    </div>

                    {/* Temp Pass Card */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                      <div>
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 w-fit">⏳</div>
                        <h4 className="text-sm font-extrabold text-slate-800">Temporary Pass</h4>
                        <p className="text-[11px] text-slate-500 mt-1 mb-4 leading-relaxed">
                          Request an ad-hoc 12-Hour temporary single-trip pass for overtime or change in shift.
                        </p>
                      </div>
                      
                      <div className="space-y-2 pt-2">
                        <button
                          onClick={() => {
                            setRequestCategory('Temporary');
                            setActiveTab('apply');
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Generate Pass
                        </button>
                        <button
                          onClick={() => setActiveTab('my-pass')}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>View My Temp Pass</span>
                        </button>
                      </div>
                    </div>

                    {/* View Routes Card */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                      <div>
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 w-fit">🚌</div>
                        <h4 className="text-sm font-extrabold text-slate-800">View Route Schedules</h4>
                        <p className="text-[11px] text-slate-500 mt-1 mb-4 leading-relaxed">
                          Check company shuttle routes, active stops, and estimated timing schedules.
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          onClick={() => setShowRoutesModal(true)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <span>View Routes</span>
                        </button>
                      </div>
                    </div>

                    {/* Live Tracking Card */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                      <div>
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 w-fit">📍</div>
                        <h4 className="text-sm font-extrabold text-slate-800">Live Shuttle Tracking</h4>
                        <p className="text-[11px] text-slate-500 mt-1 mb-4 leading-relaxed">
                          Track company buses in real-time. View geographic position and exact ETA.
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          onClick={() => setShowLiveTracking(true)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5 text-white animate-bounce" />
                          <span>Open Live Tracker</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pass Status Widgets */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Permanent Pass Status Widget */}
                    <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                        <h4 className="text-sm font-extrabold text-slate-800">Permanent Pass Status</h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly/Quarterly</span>
                      </div>
                      
                      {(() => {
                        const permPass = employeePasses.find(p => p.status === 'Active' && p.passType !== 'Temporary');
                        const pendingReq = employeeRequests.find(r => r.status === 'Pending' && r.category !== 'Temporary');

                        if (permPass) {
                          return (
                            <div className="space-y-2.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Pass Number</span>
                                <span className="font-mono font-extrabold text-slate-900">{permPass.passId}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Status</span>
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-extrabold border border-emerald-100">
                                  ACTIVE
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Valid Till</span>
                                <span className="font-bold text-slate-800">{permPass.endDate}</span>
                              </div>
                            </div>
                          );
                        } else if (pendingReq) {
                          return (
                            <div className="space-y-2.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Request ID</span>
                                <span className="font-mono font-extrabold text-slate-900">{pendingReq.requestId}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Status</span>
                                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-extrabold border border-amber-100 animate-pulse">
                                  PENDING APPROVAL
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Requested Route</span>
                                <span className="font-bold text-slate-800 truncate max-w-[180px]" title={pendingReq.route}>
                                  {pendingReq.route}
                                </span>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="py-4 text-center text-slate-400 space-y-1">
                              <p className="text-xs font-bold">No Active Permanent Pass</p>
                              <p className="text-[10px]">Submit a request to generate a monthly commuter pass</p>
                            </div>
                          );
                        }
                      })()}
                    </div>

                    {/* Temporary Pass Status Widget */}
                    <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                        <h4 className="text-sm font-extrabold text-slate-800">Temporary Pass Status</h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">12-Hour Permit</span>
                      </div>
                      
                      {(() => {
                        const tempPass = employeePasses.find(p => p.status === 'Active' && p.passType === 'Temporary');
                        const pendingReq = employeeRequests.find(r => r.status === 'Pending' && r.category === 'Temporary');

                        if (tempPass) {
                          return (
                            <div className="space-y-2.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Pass Number</span>
                                <span className="font-mono font-extrabold text-slate-900">{tempPass.passId}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Status</span>
                                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-[10px] font-extrabold border border-orange-100">
                                  EXPIRES IN 12 HOURS
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Expiry Time</span>
                                <span className="font-bold text-rose-500">{tempPass.endDate}</span>
                              </div>
                            </div>
                          );
                        } else if (pendingReq) {
                          return (
                            <div className="space-y-2.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Request ID</span>
                                <span className="font-mono font-extrabold text-slate-900">{pendingReq.requestId}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Status</span>
                                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-extrabold border border-amber-100 animate-pulse">
                                  PENDING APPROVAL
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Travel Date</span>
                                <span className="font-bold text-slate-800">{pendingReq.travelDateTime || 'Not Specified'}</span>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="py-4 text-center text-slate-400 space-y-1">
                              <p className="text-xs font-bold">No Active Temporary Pass</p>
                              <p className="text-[10px]">Generate a 12-hour pass for single trip commute</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: MY ACTIVE PASS */}
              {activeTab === 'my-pass' && (
                <div className="space-y-6">
                  {activePass ? (
                    <div className="flex flex-col items-center w-full">
                      {/* PHYSICAL BUS PASS CARD CONTAINER (PRINT-STYLING PRESERVES) */}
                      <div 
                        id="printable-bus-pass" 
                        className="w-full max-w-3xl bg-white rounded-[25px] overflow-hidden border-4 border-[#0047ab] shadow-xl text-slate-800 font-sans print:border-none print:shadow-none mx-auto"
                      >
                        {/* Header */}
                        <div className="bg-[#0047ab] text-white flex justify-between items-center px-6 py-5 sm:px-8 border-b border-[#0047ab]">
                          <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase m-0">Bajaj Auto</h1>
                          {/* Actual premium horizontal logo */}
                          <BajajHorizontalLogo inverted={true} className="h-10 px-2.5 py-1" />
                        </div>

                        {/* Centered Pass Title */}
                        <div className="text-center py-3.5 px-6 text-lg sm:text-xl font-black bg-[#0047ab] text-white mx-4 sm:mx-8 my-5 rounded-xl uppercase tracking-wider shadow-sm">
                          {activePass.passType === 'Temporary' ? 'Temporary Bus Pass' : 'Permanent Bus Pass'}
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 px-6 pb-6 sm:px-8 sm:pb-8 items-start">
                          
                          {/* Left Details Panel */}
                          <div className="md:col-span-7 space-y-3">
                            {[
                              { label: 'Name', value: activePass.employeeName },
                              { label: 'ID', value: activePass.employeeId },
                              { label: 'Dept', value: loggedInEmp.department },
                              { label: 'Shift', value: loggedInEmp.shift || activePass.passType },
                              { label: 'Route', value: activePass.route.split(':')[0] },
                              { label: 'Stop', value: loggedInEmp.busStop || 'Main Gate Chakan' },
                              { label: 'Mobile', value: loggedInEmp.phone || 'N/A' },
                              { label: 'Issue Date', value: activePass.startDate },
                            ].map((row, idx) => (
                              <div key={idx} className="grid grid-cols-12 text-sm sm:text-base font-semibold items-center border-b border-slate-100 pb-2">
                                <div className="col-span-4 text-[#003b82] font-black">{row.label}</div>
                                <div className="col-span-1 text-center text-[#003b82] font-black">:</div>
                                <div className="col-span-7 text-slate-800 font-extrabold break-words">{row.value}</div>
                              </div>
                            ))}
                          </div>

                          {/* Right Media Panel with Signature, QR, and Status */}
                          <div className="md:col-span-5 flex flex-col items-center justify-between h-full space-y-6 md:border-l md:border-slate-100 md:pl-6">
                            
                            {/* Dynamic Verification QR Code */}
                            <div className="flex flex-col items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-xs">
                              <DynamicQRCode text={activePass.qrCodeContent} />
                              <p className="text-slate-500 text-[10px] mt-2 font-mono font-bold text-center">
                                SCAN TO VERIFY: {activePass.qrCodeContent}
                              </p>
                            </div>

                            {/* Cursive Signature visual representation */}
                            <div className="text-center w-full flex justify-center">
                              <AuthoritySignatureSVG />
                            </div>

                            {/* Status Wrap Pill */}
                            <div className="text-center w-full">
                              <div className="bg-[#0a8f2f] text-white px-8 py-2 rounded-full inline-block font-black text-sm sm:text-md tracking-wider uppercase shadow-md border-2 border-green-600">
                                {activePass.status === 'Active' ? 'ACTIVE' : activePass.status}
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Footer branding */}
                        <div className="bg-[#0047ab] text-white text-center py-3.5 font-bold tracking-widest text-[11px] sm:text-xs uppercase border-t border-[#0047ab]/20">
                          BAJAJ AUTO TRANSPORT SYSTEM
                        </div>
                      </div>

                      {/* PREMIUM ACTIONS PANEL */}
                      {(() => {
                        const matchedTracking = activePass ? routeTrackings.find(t => t.routeName === activePass.route) : null;
                        const liveTrackingLink = matchedTracking?.trackingLink;

                        return (
                          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-3xl justify-center px-4 print:hidden">
                            <button
                              onClick={handlePrintPass}
                              className="flex-1 bg-[#0056b3] hover:bg-[#0047ab] text-white font-extrabold px-5 py-3 rounded-xl transition-all text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
                            >
                              <span className="text-sm">🖨️</span>
                              <span>Print Pass</span>
                            </button>
                            <button
                              onClick={handlePrintPass}
                              className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold px-5 py-3 rounded-xl transition-all text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
                            >
                              <span className="text-sm">⬇️</span>
                              <span>Download PDF</span>
                            </button>
                            {liveTrackingLink && (
                              <a
                                href={liveTrackingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-3 rounded-xl transition-all text-xs cursor-pointer shadow-md flex items-center justify-center gap-2 border border-indigo-500/35"
                              >
                                <MapPin className="w-3.5 h-3.5 text-white animate-pulse" />
                                <span>Track Shuttle Live</span>
                                <ExternalLink className="w-3 h-3 text-indigo-200" />
                              </a>
                            )}
                            <button
                              onClick={() => setActiveTab('dashboard')}
                              className="flex-1 bg-[#334155] hover:bg-[#1e293b] text-white font-extrabold px-5 py-3 rounded-xl transition-all text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
                            >
                              <span>← Back To Dashboard</span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  ) : pendingRequest ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="bg-amber-50 p-4 rounded-full text-amber-600 mb-4 border border-amber-100">
                        <Clock className="w-8 h-8" />
                      </div>
                      <h3 className="text-md font-bold text-slate-900">Pass Request Pending Approval</h3>
                      <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                        You requested a <strong>{pendingRequest.passType}</strong> pass on <strong>{pendingRequest.requestedDate}</strong> for:
                      </p>
                      <div className="mt-3 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-lg max-w-md text-xs font-semibold text-slate-700">
                        {pendingRequest.route}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                        Please check back shortly. An administrator is currently reviewing your submission.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <div className="bg-slate-50 p-4 rounded-full text-slate-400 mb-4 border border-slate-100">
                        <QrCode className="w-8 h-8" />
                      </div>
                      <h3 className="text-md font-bold text-slate-900">No Active Bus Pass</h3>
                      <p className="text-xs text-slate-500 max-w-sm mt-1.5 mb-6 leading-relaxed">
                        You do not currently possess an active commuter pass. Click below to submit a routing and pass type request.
                      </p>
                      <button
                        onClick={() => setActiveTab('apply')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors inline-flex items-center space-x-2 text-xs shadow-sm cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Apply For Bus Pass</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: APPLY FOR PASS */}
              {activeTab === 'apply' && (
                <div className="max-w-xl mx-auto py-2 font-sans">
                  <h3 className="text-md font-bold text-slate-900 mb-1.5">Commuter Pass Request Form</h3>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    Choose between a standard permanent commuter pass (Monthly, Quarterly, or Yearly) and an ad-hoc single-trip temporary transport permit.
                  </p>

                  {/* Segmented Category Selection */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => {
                        setRequestCategory('Permanent');
                        setApplyError('');
                      }}
                      className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        requestCategory === 'Permanent'
                          ? 'bg-white text-indigo-700 shadow-xs border border-indigo-50/50'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${requestCategory === 'Permanent' ? 'bg-indigo-600' : 'bg-slate-400'}`}></span>
                      <span>Permanent Pass</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRequestCategory('Temporary');
                        setApplyError('');
                      }}
                      className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        requestCategory === 'Temporary'
                          ? 'bg-white text-indigo-700 shadow-xs border border-indigo-50/50'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${requestCategory === 'Temporary' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                      <span>Temporary Pass</span>
                    </button>
                  </div>

                  <form onSubmit={handleApply} className="space-y-4">
                    {applyError && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex gap-2">
                        <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{applyError}</span>
                      </div>
                    )}
                    {applySuccess && (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs flex gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{applySuccess}</span>
                      </div>
                    )}

                    {/* Employee Identity Fields (Prefilled & Styled) */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Employee Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={loggedInEmp.employeeId}
                          disabled
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-xs font-mono font-bold cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Employee Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={loggedInEmp.name}
                          disabled
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-xs font-bold cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Department & Mobile */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={loggedInEmp.department}
                          disabled
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-xs font-semibold cursor-not-allowed"
                        >
                          <option value={loggedInEmp.department}>{loggedInEmp.department}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="Enter Mobile Number"
                          value={customPhone}
                          onChange={(e) => setCustomPhone(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-xs"
                          required
                        />
                      </div>
                    </div>

                    {/* Shift & Gender */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Shift <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={shift}
                          onChange={(e) => setShift(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-xs"
                          required
                        >
                          <option value="1st Shift">1st Shift</option>
                          <option value="2nd Shift">2nd Shift</option>
                          <option value="3rd Shift">3rd Shift</option>
                          <option value="OT">OT (Overtime)</option>
                          <option value="General Shift">General Shift</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-xs"
                          required
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    {/* Route Selection */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Select Commute Route <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedRoute}
                        onChange={(e) => setSelectedRoute(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-xs"
                      >
                        {BUS_ROUTES.map((route) => (
                          <option key={route.id} value={route.name}>
                            {route.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* PERMANENT vs TEMPORARY SPECIFIC FIELDS */}
                    {requestCategory === 'Permanent' ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                              Pass Duration Term <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={selectedPassType}
                              onChange={(e) => setSelectedPassType(e.target.value as any)}
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-xs cursor-pointer"
                            >
                              <option value="Monthly">Monthly Pass</option>
                              <option value="Quarterly">Quarterly Pass</option>
                              <option value="Yearly">Yearly Pass</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                              Requested Activation Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-xs"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                              Pickup Location (Preferred Stop) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Crossroad Junction 4"
                              value={busStop}
                              onChange={(e) => setBusStop(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-xs"
                              required={requestCategory === 'Permanent'}
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                              Drop Location <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={dropLocation}
                              disabled
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-xs font-semibold cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                              Travel Date & Time <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="datetime-local"
                              value={travelDateTime}
                              onChange={(e) => setTravelDateTime(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-xs"
                              required={requestCategory === 'Temporary'}
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                              Drop Location <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={dropLocation}
                              disabled
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-xs font-semibold cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Reason for Temporary Commute <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            placeholder="e.g. Attending on-site emergency system maintenance or late shift coverage"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-xs resize-none"
                            required={requestCategory === 'Temporary'}
                          />
                        </div>
                      </>
                    )}

                    {/* Residential Address Field */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Residential Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="Enter your full residential address details"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-xs resize-none"
                        required
                      />
                    </div>

                    <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 space-y-1.5 leading-relaxed">
                      <p className="font-bold text-indigo-950">Important Guidelines:</p>
                      {requestCategory === 'Permanent' ? (
                        <>
                          <p className="text-indigo-800/90">• Only registered employees with active corporate IDs are eligible for bus pass provisioning.</p>
                          <p className="text-indigo-800/90">• Approved passes will generate a real-time QR credential stored directly in your "My Active Pass" dashboard.</p>
                        </>
                      ) : (
                        <>
                          <p className="text-indigo-800/90">• Temporary shuttle access is issued strictly for single-trip travel on designated times.</p>
                          <p className="text-indigo-800/90">• Upon approval, your temporary pass will be active on the travel date and displayed with temporary credentials.</p>
                        </>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 text-xs shadow-sm cursor-pointer animate-pulse-subtle"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Submit {requestCategory} Request</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: REQUEST HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-bold text-slate-900">Your Request History</h3>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-50 border border-slate-200/60 rounded px-2.5 py-0.5">
                      Sheet: pass_requests.xlsx ({employeeRequests.length} rows)
                    </span>
                  </div>

                  {employeeRequests.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                      <p className="text-slate-500 text-xs">No historical requests found for your Employee ID.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 rounded-lg">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b border-slate-200/60 font-bold tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Request ID</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Route</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Comments</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {employeeRequests.map((req) => (
                            <tr key={req.requestId} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 font-mono font-semibold text-slate-900">{req.requestId}</td>
                              <td className="px-4 py-3 text-slate-500">{req.requestedDate}</td>
                              <td className="px-4 py-3 max-w-[200px] truncate text-slate-700" title={req.route}>
                                {req.route}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200/50">
                                  {req.passType}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center ${
                                  req.status === 'Approved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                    : req.status === 'Rejected'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200/50'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                                }`}>
                                  {req.status === 'Approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {req.status === 'Rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                  {req.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-400 italic max-w-[150px] truncate" title={req.adminComments || ''}>
                                {req.adminComments || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: EMERGENCY CONTACTS */}
              {activeTab === 'emergency' && (
                <div className="space-y-6">
                  {/* Banner header inside panel */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 sm:p-8 shadow-md border border-red-500/30">
                    {/* Background decorations */}
                    <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-black/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white border border-white/20 w-fit mb-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                          <span>Active Safety Protocol</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">🚨 Emergency Contacts</h2>
                        <p className="text-red-100 text-xs sm:text-sm mt-1.5 max-w-xl">
                          Quick, authorized access to critical support personnel, coordinators, and local authorities. Call directly from your mobile device.
                        </p>
                      </div>
                      
                      <div className="text-[10px] font-mono bg-black/20 px-3 py-2 rounded-lg text-red-200 border border-red-500/20 self-start sm:self-center">
                        <div>CHAKAN PLANT 1</div>
                        <div className="mt-0.5 text-white/90">HELPLINE: ACTIVE</div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Cards Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Supervisor */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-5 border border-slate-800 hover:border-slate-700 shadow-md transition-all group hover:-translate-y-0.5 duration-300">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono bg-slate-800/60 px-2 py-0.5 rounded">Primary Point-of-Contact</span>
                          <h3 className="text-md font-bold text-slate-100 pt-1 group-hover:text-white transition-colors">Supervisor</h3>
                          <p className="text-[10px] text-slate-400">On-site operations &amp; shift safety supervisor</p>
                          <div className="text-sm font-mono font-bold text-emerald-400 pt-2 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>+91 9876543210</span>
                          </div>
                        </div>
                        <a
                          href="tel:+919876543210"
                          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap self-center"
                        >
                          <span>📞 Call</span>
                        </a>
                      </div>
                    </div>

                    {/* Transport Department */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-5 border border-slate-800 hover:border-slate-700 shadow-md transition-all group hover:-translate-y-0.5 duration-300">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono bg-slate-800/60 px-2 py-0.5 rounded">Transit Coordinators</span>
                          <h3 className="text-md font-bold text-slate-100 pt-1 group-hover:text-white transition-colors">Transport Department</h3>
                          <p className="text-[10px] text-slate-400">Commute issues, timing changes, breakdown reports</p>
                          <div className="text-sm font-mono font-bold text-emerald-400 pt-2 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>+91 9876543211</span>
                          </div>
                        </div>
                        <a
                          href="tel:+919876543211"
                          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap self-center"
                        >
                          <span>📞 Call</span>
                        </a>
                      </div>
                    </div>

                    {/* Police Help */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-5 border border-slate-800 hover:border-slate-700 shadow-md transition-all group hover:-translate-y-0.5 duration-300">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-rose-400 font-extrabold font-mono bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/30">External Security</span>
                          <h3 className="text-md font-bold text-slate-100 pt-1 group-hover:text-white transition-colors">Police Department</h3>
                          <p className="text-[10px] text-slate-400">Local police control room emergency helpline</p>
                          <div className="text-sm font-mono font-bold text-rose-400 pt-2 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                            <span>100</span>
                          </div>
                        </div>
                        <a
                          href="tel:100"
                          className="bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-500/20 transition-all cursor-pointer whitespace-nowrap self-center"
                        >
                          <span>🚨 Call</span>
                        </a>
                      </div>
                    </div>

                    {/* Time Office */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-5 border border-slate-800 hover:border-slate-700 shadow-md transition-all group hover:-translate-y-0.5 duration-300">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono bg-slate-800/60 px-2 py-0.5 rounded">Plant Administration</span>
                          <h3 className="text-md font-bold text-slate-100 pt-1 group-hover:text-white transition-colors">Time Office</h3>
                          <p className="text-[10px] text-slate-400">Shift logging, badge updates, and attendance logs</p>
                          <div className="text-sm font-mono font-bold text-emerald-400 pt-2 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>+91 9876543213</span>
                          </div>
                        </div>
                        <a
                          href="tel:+919876543213"
                          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap self-center"
                        >
                          <span>📞 Call</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Safety Advice Box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-2 leading-relaxed">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>Employee Commute Safety Instructions</span>
                    </p>
                    <p className="text-slate-500">• In case of a vehicle breakdown or delay, report immediately to the **Transport Department** first so a replacement shuttle can be rerouted.</p>
                    <p className="text-slate-500">• Keep your live-tracked link open in your mobile browser during transit for safety awareness and ETA updates.</p>
                    <p className="text-slate-500">• Ensure your emergency contact number is correctly updated in your **Profile &amp; Bus Pass Request** form.</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 Shared Support Services Inc. All Rights Reserved.</p>
          <p className="font-mono bg-slate-50 border border-slate-200/60 px-2.5 py-0.5 rounded text-[10px] text-slate-400">
            Data Source: Local Storage Excel Simulation
          </p>
        </div>
      </footer>

      {/* ROUTES SCHEDULES MODAL */}
      {showRoutesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-md font-extrabold flex items-center gap-1.5">
                  <Bus className="w-5 h-5 text-indigo-400" />
                  <span>Company Shuttle Routes &amp; Schedules</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Authorized commuter routes for Chakan Plant employees</p>
              </div>
              <button 
                onClick={() => setShowRoutesModal(false)}
                className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search route, stop or shift..."
                  value={routesSearchQuery}
                  onChange={(e) => setRoutesSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {routesSearchQuery && (
                  <button 
                    onClick={() => setRoutesSearchQuery('')}
                    className="absolute right-3 top-2.5 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {Object.entries(SHIFT_ROUTES).map(([shiftName, routesObj]) => {
                  const filteredRoutes = Object.entries(routesObj).filter(([routeName, stops]) => {
                    return routeName.toLowerCase().includes(routesSearchQuery.toLowerCase()) || 
                           stops.some(stop => stop.toLowerCase().includes(routesSearchQuery.toLowerCase())) ||
                           shiftName.toLowerCase().includes(routesSearchQuery.toLowerCase());
                  });

                  if (filteredRoutes.length === 0) return null;

                  return (
                    <div key={shiftName} className="space-y-3">
                      <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest border-l-4 border-indigo-600 pl-2">
                        {shiftName}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredRoutes.map(([routeName, stops]) => {
                          const mappedRouteId = `${shiftName.replace(/\s+/g, '-')}-${routeName.replace(/[^a-zA-Z0-9]/g, '-')}`.toLowerCase();

                          return (
                            <div 
                              key={routeName} 
                              onClick={() => {
                                setSelectedRouteId(mappedRouteId);
                                setShowRoutesModal(false);
                                setShowLiveTracking(true);
                              }}
                              className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2 hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer transition-all duration-200 group/item relative overflow-hidden"
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                  <span>{routeName}</span>
                                </h4>
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                                  Track
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium">
                                {stops.slice(0, 3).join(' ➜ ')} {stops.length > 3 ? ' ➜ ...' : ''}
                              </p>
                              <div className="text-[10px] space-y-1 font-mono text-slate-600 bg-white p-2 rounded border border-slate-200/40">
                                <div>📍 {stops.length} Authorized Stops</div>
                                <div className="truncate text-slate-400">First: {stops[0]} ➜ Last: {stops[stops.length-1]}</div>
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
                      routeName.toLowerCase().includes(routesSearchQuery.toLowerCase()) || 
                      stops.some(stop => stop.toLowerCase().includes(routesSearchQuery.toLowerCase()))
                    )
                  );
                  if (!hasAny && routesSearchQuery) {
                    return (
                      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500 font-bold">No matching shuttle routes found</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Please check your spelling or search by another stop.</p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowRoutesModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
