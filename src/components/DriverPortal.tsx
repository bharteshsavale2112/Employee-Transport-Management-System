/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  History, 
  Compass, 
  Smartphone, 
  ShieldAlert, 
  Database,
  CalendarDays
} from 'lucide-react';
import { BusPass, Employee, ScanLog } from '../types';
import { ExcelStore } from '../dbSim';
import { BajajHorizontalLogo, BajajFavouriteIndianLogo } from './BajajLogo';

interface DriverPortalProps {
  onBackToPortalSelection: () => void;
}

export default function DriverPortal({ onBackToPortalSelection }: DriverPortalProps) {
  const [passQuery, setPassQuery] = useState('');
  const [selectedScanPass, setSelectedScanPass] = useState<BusPass | null>(null);
  const [scanResult, setScanResult] = useState<{
    status: 'Valid' | 'Invalid' | 'Expired';
    message: string;
    employeeName?: string;
    employeeId?: string;
    route?: string;
    expiryDate?: string;
  } | null>(null);

  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [availablePasses, setAvailablePasses] = useState<BusPass[]>([]);

  useEffect(() => {
    setScanLogs(ExcelStore.getScanLogs());
    setAvailablePasses(ExcelStore.getPasses());
  }, []);

  const handleVerify = (passToVerify: BusPass | null, queryText: string) => {
    setScanResult(null);
    let targetPass: BusPass | undefined;

    if (passToVerify) {
      targetPass = passToVerify;
    } else {
      const passes = ExcelStore.getPasses();
      const query = queryText.trim().toUpperCase();
      
      // Match by Pass ID or Employee ID
      targetPass = passes.find(
        p => p.passId.toUpperCase() === query || p.employeeId.toUpperCase() === query
      );
    }

    if (!targetPass) {
      const employees = ExcelStore.getEmployees();
      const query = queryText.trim().toUpperCase();
      const employeeExists = employees.some(e => e.employeeId.toUpperCase() === query);

      const result = {
        status: 'Invalid' as const,
        message: employeeExists 
          ? `Employee is registered, but has NO approved active bus pass in passes.xlsx.`
          : `Credentials not found in employees.xlsx or passes.xlsx.`,
        employeeId: query
      };
      setScanResult(result);
      logScan('INVALID', query, 'Unknown Route', 'Invalid');
      return;
    }

    // Check expiration
    const todayStr = new Date().toISOString().split('T')[0];
    const isExpired = targetPass.endDate < todayStr;
    const isSuspended = targetPass.status === 'Suspended';

    if (isExpired) {
      const result = {
        status: 'Expired' as const,
        message: `Pass has expired on ${targetPass.endDate}.`,
        employeeName: targetPass.employeeName,
        employeeId: targetPass.employeeId,
        route: targetPass.route,
        expiryDate: targetPass.endDate
      };
      setScanResult(result);
      logScan(targetPass.passId, targetPass.employeeId, targetPass.route, 'Expired', targetPass.employeeName);
    } else if (isSuspended) {
      const result = {
        status: 'Invalid' as const,
        message: `Pass has been administrative suspended.`,
        employeeName: targetPass.employeeName,
        employeeId: targetPass.employeeId,
        route: targetPass.route,
        expiryDate: targetPass.endDate
      };
      setScanResult(result);
      logScan(targetPass.passId, targetPass.employeeId, targetPass.route, 'Invalid', targetPass.employeeName);
    } else {
      // Pass is Valid!
      const result = {
        status: 'Valid' as const,
        message: `Pass verified successfully! Commute approved.`,
        employeeName: targetPass.employeeName,
        employeeId: targetPass.employeeId,
        route: targetPass.route,
        expiryDate: targetPass.endDate
      };
      setScanResult(result);
      logScan(targetPass.passId, targetPass.employeeId, targetPass.route, 'Valid', targetPass.employeeName);
    }
  };

  const logScan = (passId: string, employeeId: string, route: string, status: 'Valid' | 'Invalid' | 'Expired', name?: string) => {
    const logs = ExcelStore.getScanLogs();
    const newLog: ScanLog = {
      id: 'SCAN' + Math.floor(4000 + Math.random() * 5000),
      timestamp: new Date().toISOString(),
      passId: passId,
      employeeId: employeeId,
      employeeName: name || 'Unknown Passenger',
      route: route,
      status: status
    };

    logs.unshift(newLog); // Put newest scans on top
    ExcelStore.saveScanLogs(logs);
    setScanLogs(logs);
  };

  const handleClearLogs = () => {
    ExcelStore.saveScanLogs([]);
    setScanLogs([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans antialiased">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3.5 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BajajFavouriteIndianLogo className="scale-75 sm:scale-90 origin-left border-none shadow-none p-0 bg-transparent" />
            <div className="border-l border-slate-200 pl-3 hidden sm:block">
              <h1 className="text-xs font-black text-[#005cb9] tracking-tight uppercase leading-none">Driver Portal</h1>
              <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold font-mono">Transit Verification</p>
            </div>
          </div>
          <div className="bg-emerald-50 px-3 py-1 rounded-full text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1.5 border border-emerald-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE TERMINAL
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="flex-grow p-4 sm:p-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SCANNER / VERIFIER TOOL */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h2 className="text-md font-bold text-slate-900 mb-1.5 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-500" />
              <span>Digital Passenger Verification</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Enter an Employee ID, Pass ID, or select one of the issued commuter passes below to simulate a QR scan.
            </p>

            {/* SCAN FORM */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter Employee ID (e.g., EMP1001) or Pass ID"
                    value={passQuery}
                    onChange={(e) => setPassQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleVerify(null, passQuery);
                    }}
                  />
                </div>
                <button
                  onClick={() => handleVerify(null, passQuery)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 sm:py-0 px-5 rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                >
                  Verify Commuter
                </button>
              </div>

              {/* DEMO SHORTCUTS (PASS SELECTOR) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Simulation Shortcut: Choose Issued Bus Pass
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1.5 border border-slate-200/60 rounded-lg bg-slate-50">
                  {availablePasses.length === 0 ? (
                    <div className="col-span-2 text-center py-4 text-xs text-slate-500">
                      No issued passes found in database.
                    </div>
                  ) : (
                    availablePasses.map((pass) => (
                      <button
                        key={pass.passId}
                        onClick={() => {
                          setPassQuery(pass.passId);
                          handleVerify(pass, '');
                        }}
                        className="text-left px-3 py-2 border border-slate-200 rounded bg-white hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-xs flex justify-between items-center group cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-slate-700">{pass.employeeName}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{pass.employeeId} • {pass.passId}</p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold uppercase border border-emerald-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
                          SCAN
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* REAL-TIME SCAN VERIFICATION DISPLAY */}
            {scanResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 border-t border-slate-200 pt-6"
              >
                <div className={`rounded-2xl p-5 border text-center ${
                  scanResult.status === 'Valid'
                    ? 'bg-emerald-50 border-emerald-200/80 text-emerald-900'
                    : scanResult.status === 'Expired'
                    ? 'bg-rose-50 border-rose-200/80 text-rose-900'
                    : 'bg-slate-100 border-slate-200/80 text-slate-800'
                }`}>
                  <div className="flex justify-center mb-3">
                    {scanResult.status === 'Valid' ? (
                      <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-pulse" />
                    ) : scanResult.status === 'Expired' ? (
                      <Clock className="w-12 h-12 text-rose-600 animate-pulse" />
                    ) : (
                      <XCircle className="w-12 h-12 text-slate-500" />
                    )}
                  </div>

                  <h3 className="text-lg font-black tracking-tight uppercase">
                    {scanResult.status === 'Valid' ? 'PASS VERIFIED' : scanResult.status === 'Expired' ? 'PASS EXPIRED' : 'ACCESS DENIED'}
                  </h3>
                  <p className="text-xs font-semibold mt-1 opacity-80">{scanResult.message}</p>

                  {/* COMMUTER METADATA */}
                  {scanResult.employeeId && (
                    <div className="mt-4 pt-4 border-t border-slate-200/50 text-left grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                      {scanResult.employeeName && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Commuter Name</p>
                          <p className="font-semibold text-slate-800 mt-0.5">{scanResult.employeeName}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Employee ID</p>
                        <p className="font-mono font-semibold text-slate-800 mt-0.5">{scanResult.employeeId}</p>
                      </div>
                      {scanResult.route && (
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase text-slate-400">Authorized Transit Route</p>
                          <p className="font-semibold text-slate-700 truncate mt-0.5" title={scanResult.route}>
                            {scanResult.route}
                          </p>
                        </div>
                      )}
                      {scanResult.expiryDate && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Valid Until</p>
                          <p className={`font-semibold mt-0.5 ${
                            scanResult.status === 'Expired' ? 'text-rose-600 font-extrabold' : 'text-slate-800'
                          }`}>
                            {scanResult.expiryDate}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: SCAN HISTORY LOGS */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col justify-between">
            <div className="p-6 sm:p-8 flex-grow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-md font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-500" />
                  <span>Terminal Activity Log</span>
                </h2>
                <span className="text-[10px] bg-slate-50 border border-slate-200/60 text-slate-400 px-2.5 py-0.5 rounded font-mono">
                  scan_logs.xlsx ({scanLogs.length} rows)
                </span>
              </div>

              {scanLogs.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-slate-400 text-xs">No commuter scan events logged yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {scanLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-3 rounded-lg border text-xs flex justify-between items-start gap-2.5 transition-all ${
                        log.status === 'Valid'
                          ? 'bg-emerald-50/40 border-emerald-100/40'
                          : log.status === 'Expired'
                          ? 'bg-amber-50/40 border-amber-100/40'
                          : 'bg-red-50/40 border-red-100/40'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 truncate">
                            {log.employeeName}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-100/80">
                            {log.employeeId}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate" title={log.route}>
                          {log.route}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span>•</span>
                          <span>Pass ID: {log.passId}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${
                        log.status === 'Valid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'Expired'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CLEAR ACTION */}
            {scanLogs.length > 0 && (
              <div className="bg-slate-50 border-t border-slate-100 p-4 text-right">
                <button
                  onClick={handleClearLogs}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold transition-colors cursor-pointer"
                >
                  Clear Logs Sheet
                </button>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 Shared Support Services Inc. All Rights Reserved.</p>
          <div className="flex items-center gap-2 text-[10px] font-mono bg-slate-50 border border-slate-200/60 px-2.5 py-0.5 rounded">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Store: scan_logs.xlsx</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
