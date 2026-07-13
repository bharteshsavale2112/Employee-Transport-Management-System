/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee, BusPass, PassRequest, ScanLog } from './types';

// Pre-seeded Initial Data
const INITIAL_EMPLOYEES: Employee[] = [
  {
    employeeId: 'EMP1001',
    name: 'Alice Johnson',
    department: 'Software Engineering',
    email: 'alice.j@company.com',
    phone: '555-0192',
    joinedDate: '2025-01-15',
    password: 'password123'
  },
  {
    employeeId: 'EMP1002',
    name: 'Robert Chen',
    department: 'Human Resources',
    email: 'robert.c@company.com',
    phone: '555-0283',
    joinedDate: '2025-02-10',
    password: 'password123'
  },
  {
    employeeId: 'EMP1003',
    name: 'Sarah Smith',
    department: 'Finance & Accounts',
    email: 'sarah.s@company.com',
    phone: '555-0374',
    joinedDate: '2025-03-01',
    password: 'password123'
  }
];

const INITIAL_REQUESTS: PassRequest[] = [
  {
    requestId: 'REQ2001',
    employeeId: 'EMP1001',
    employeeName: 'Alice Johnson',
    department: 'Software Engineering',
    route: 'Route 101: Downtown Express (Main Terminal - Business Hub)',
    passType: 'Monthly',
    requestedDate: '2026-07-01',
    status: 'Approved',
    adminComments: 'Approved on schedule.',
    category: 'Permanent',
    busStop: 'Main Gate Terminal',
    mobile: '555-0192'
  },
  {
    requestId: 'REQ2002',
    employeeId: 'EMP1002',
    employeeName: 'Robert Chen',
    department: 'Human Resources',
    route: 'Route 103: East Valley (Metro Station - Tech Park)',
    passType: 'Quarterly',
    requestedDate: '2026-07-08',
    status: 'Pending',
    category: 'Permanent',
    busStop: 'Metro Crossing Stop',
    mobile: '555-0283'
  },
  {
    requestId: 'REQ2003',
    employeeId: 'EMP1003',
    employeeName: 'Sarah Smith',
    department: 'Finance & Accounts',
    route: 'Route 104: South Coast (Port Authority - Corporate HQ)',
    passType: 'Monthly',
    requestedDate: '2026-06-15',
    status: 'Rejected',
    adminComments: 'Incorrect routing details selected.',
    category: 'Permanent',
    busStop: 'Port Junction 2',
    mobile: '555-0374'
  },
  {
    requestId: 'REQ2004',
    employeeId: 'EMP1001',
    employeeName: 'Alice Johnson',
    department: 'Software Engineering',
    route: 'Route 102: North Suburbs (Industrial Area - Residential District)',
    passType: 'Temporary',
    requestedDate: '2026-07-10',
    status: 'Pending',
    category: 'Temporary',
    reason: 'Attending critical technical seminar in Industrial District',
    travelDateTime: '2026-07-14 09:30 AM',
    mobile: '555-0192'
  },
  {
    requestId: 'REQ2005',
    employeeId: 'EMP1003',
    employeeName: 'Sarah Smith',
    department: 'Finance & Accounts',
    route: 'Route 105: West Gate (Transit Center - Research Campus)',
    passType: 'Temporary',
    requestedDate: '2026-07-11',
    status: 'Pending',
    category: 'Temporary',
    reason: 'Monthly physical inventory audit at Research Campus',
    travelDateTime: '2026-07-16 02:00 PM',
    mobile: '555-0374'
  }
];

const INITIAL_PASSES: BusPass[] = [
  {
    passId: 'PASS3001',
    employeeId: 'EMP1001',
    employeeName: 'Alice Johnson',
    route: 'Route 101: Downtown Express (Main Terminal - Business Hub)',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    status: 'Active',
    passType: 'Monthly',
    qrCodeContent: 'PASS:PASS3001|EMP:EMP1001|ROUTE:R1|EXP:2026-07-31'
  }
];

const INITIAL_SCAN_LOGS: ScanLog[] = [
  {
    id: 'SCAN4001',
    timestamp: '2026-07-10T08:30:00-07:00',
    passId: 'PASS3001',
    employeeId: 'EMP1001',
    employeeName: 'Alice Johnson',
    route: 'Route 101: Downtown Express (Main Terminal - Business Hub)',
    status: 'Valid'
  }
];

export interface RouteTracking {
  routeName: string;
  trackingLink: string;
}

const INITIAL_TRACKING_LINKS: RouteTracking[] = [
  { routeName: 'Route 101: Downtown Express (Main Terminal - Business Hub)', trackingLink: 'https://vms-livetrack.pragatiutrack.com/home?id=0409ae0f-58ea-42d6-aded-906e7441243f' },
  { routeName: 'Route 102: North Suburbs (Industrial Area - Residential District)', trackingLink: 'https://vms-livetrack.pragatiutrack.com/home?id=0409ae0f-58ea-42d6-aded-906e7441243f' },
  { routeName: 'Route 103: East Valley (Metro Station - Tech Park)', trackingLink: 'https://vms-livetrack.pragatiutrack.com/home?id=0409ae0f-58ea-42d6-aded-906e7441243f' },
  { routeName: 'Route 104: South Coast (Port Authority - Corporate HQ)', trackingLink: 'https://vms-livetrack.pragatiutrack.com/home?id=0409ae0f-58ea-42d6-aded-906e7441243f' },
  { routeName: 'Route 105: West Gate (Transit Center - Research Campus)', trackingLink: 'https://vms-livetrack.pragatiutrack.com/home?id=0409ae0f-58ea-42d6-aded-906e7441243f' }
];

// Helper to initialize LocalStorage tables if they don't exist
export function initDb() {
  if (!localStorage.getItem('employees.xlsx')) {
    localStorage.setItem('employees.xlsx', JSON.stringify(INITIAL_EMPLOYEES));
  }
  if (!localStorage.getItem('pass_requests.xlsx')) {
    localStorage.setItem('pass_requests.xlsx', JSON.stringify(INITIAL_REQUESTS));
  }
  if (!localStorage.getItem('passes.xlsx')) {
    localStorage.setItem('passes.xlsx', JSON.stringify(INITIAL_PASSES));
  }
  if (!localStorage.getItem('scan_logs.xlsx')) {
    localStorage.setItem('scan_logs.xlsx', JSON.stringify(INITIAL_SCAN_LOGS));
  }
  // Always set or overwrite the tracking links to make sure the user sees the requested link
  localStorage.setItem('route_tracking_links.xlsx', JSON.stringify(INITIAL_TRACKING_LINKS));
}

// Background sync helper to push updates to the PostgreSQL database
async function postSync(endpoint: string, payload: any) {
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn(`Background push to ${endpoint} failed:`, err);
  }
}

// Background sync helper to pull updates from the PostgreSQL database
export async function syncFromDatabase() {
  try {
    const res = await fetch('/api/all-data');
    if (res.ok) {
      const data = await res.json();
      if (data && !data.fallback) {
        if (data.employees) localStorage.setItem('employees.xlsx', JSON.stringify(data.employees));
        if (data.requests) localStorage.setItem('pass_requests.xlsx', JSON.stringify(data.requests));
        if (data.passes) localStorage.setItem('passes.xlsx', JSON.stringify(data.passes));
        if (data.scan_logs) localStorage.setItem('scan_logs.xlsx', JSON.stringify(data.scan_logs));
        if (data.route_tracking_links) localStorage.setItem('route_tracking_links.xlsx', JSON.stringify(data.route_tracking_links));
        console.log('Successfully loaded state from Azure PostgreSQL database.');
        return true;
      }
    }
  } catch (err) {
    console.warn('Running in Local Offline-First mode (Database URL empty or unreachable).', err);
  }
  return false;
}

// Data store API mimicking Excel read/write
export const ExcelStore = {
  getEmployees(): Employee[] {
    initDb();
    const data = localStorage.getItem('employees.xlsx');
    return data ? JSON.parse(data) : [];
  },

  saveEmployees(employees: Employee[]) {
    localStorage.setItem('employees.xlsx', JSON.stringify(employees));
    postSync('/api/sync/employees', { employees });
  },

  getRequests(): PassRequest[] {
    initDb();
    const data = localStorage.getItem('pass_requests.xlsx');
    return data ? JSON.parse(data) : [];
  },

  saveRequests(requests: PassRequest[]) {
    localStorage.setItem('pass_requests.xlsx', JSON.stringify(requests));
    postSync('/api/sync/requests', { requests });
  },

  getPasses(): BusPass[] {
    initDb();
    const data = localStorage.getItem('passes.xlsx');
    return data ? JSON.parse(data) : [];
  },

  savePasses(passes: BusPass[]) {
    localStorage.setItem('passes.xlsx', JSON.stringify(passes));
    postSync('/api/sync/passes', { passes });
  },

  getScanLogs(): ScanLog[] {
    initDb();
    const data = localStorage.getItem('scan_logs.xlsx');
    return data ? JSON.parse(data) : [];
  },

  saveScanLogs(logs: ScanLog[]) {
    localStorage.setItem('scan_logs.xlsx', JSON.stringify(logs));
    postSync('/api/sync/scan_logs', { scan_logs: logs });
  },

  getRouteTracking(): RouteTracking[] {
    initDb();
    const data = localStorage.getItem('route_tracking_links.xlsx');
    return data ? JSON.parse(data) : [];
  },

  saveRouteTracking(trackings: RouteTracking[]) {
    localStorage.setItem('route_tracking_links.xlsx', JSON.stringify(trackings));
    postSync('/api/sync/tracking_links', { tracking_links: trackings });
  },

  resetDb() {
    localStorage.removeItem('employees.xlsx');
    localStorage.removeItem('pass_requests.xlsx');
    localStorage.removeItem('passes.xlsx');
    localStorage.removeItem('scan_logs.xlsx');
    localStorage.removeItem('route_tracking_links.xlsx');
    initDb();
  }
};
