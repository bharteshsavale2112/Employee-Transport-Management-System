import { pgTable, text, serial, timestamp } from 'drizzle-orm/pg-core';

// User tracking table linked to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Employees table
export const employees = pgTable('employees', {
  employeeId: text('employee_id').primaryKey(),
  name: text('name').notNull(),
  department: text('department'),
  email: text('email'),
  phone: text('phone'),
  password: text('password'),
  shift: text('shift'),
  routeNumber: text('route_number'),
  busStop: text('bus_stop'),
  address: text('address'),
  joinedDate: text('joined_date'),
});

// Pass Requests table
export const passRequests = pgTable('pass_requests', {
  requestId: text('request_id').primaryKey(),
  employeeId: text('employee_id'),
  employeeName: text('employee_name'),
  department: text('department'),
  route: text('route'),
  passType: text('pass_type'),
  requestedDate: text('requested_date'),
  status: text('status'),
  adminComments: text('admin_comments'),
  category: text('category'),
  busStop: text('bus_stop'),
  reason: text('reason'),
  travelDateTime: text('travel_date_time'),
  mobile: text('mobile'),
});

// Passes table
export const passes = pgTable('passes', {
  passId: text('pass_id').primaryKey(),
  employeeId: text('employee_id'),
  employeeName: text('employee_name'),
  route: text('route'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  status: text('status'),
  passType: text('pass_type'),
  qrCodeContent: text('qr_code_content'),
});

// Scan logs table
export const scanLogs = pgTable('scan_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp'),
  passId: text('pass_id'),
  employeeId: text('employee_id'),
  employeeName: text('employee_name'),
  route: text('route'),
  status: text('status'),
});

// Route tracking links table
export const routeTrackingLinks = pgTable('route_tracking_links', {
  routeName: text('route_name').primaryKey(),
  trackingLink: text('tracking_link'),
});
