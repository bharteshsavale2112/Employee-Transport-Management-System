import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import pg from 'pg';
import { createServer as createViteServer } from 'vite';
import { pool as cloudSqlPool } from './src/db/index.ts';

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Database Pool configuration (Supports Cloud SQL, Azure PostgreSQL and Local fallback)
let pool: pg.Pool | null = null;

if (process.env.SQL_HOST) {
  console.log('Connecting to Cloud SQL database...');
  pool = cloudSqlPool;
} else if (process.env.DATABASE_URL) {
  console.log('Connecting to fallback PostgreSQL database...');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('azure') || isProd ? { rejectUnauthorized: false } : undefined
  });
} else {
  console.warn('Neither SQL_HOST nor DATABASE_URL environment variables are detected. Server will run in local storage simulation mode.');
}

// Ensure database tables exist on server startup
async function ensureTables() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    console.log('Successfully connected to database. Setting up tables...');

    // 1. Employees table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        employee_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        department VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(50),
        password VARCHAR(100),
        shift VARCHAR(50),
        route_number VARCHAR(100),
        bus_stop VARCHAR(100),
        address TEXT,
        joined_date VARCHAR(50)
      )
    `);

    // 2. Pass requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pass_requests (
        request_id VARCHAR(50) PRIMARY KEY,
        employee_id VARCHAR(50),
        employee_name VARCHAR(100),
        department VARCHAR(100),
        route VARCHAR(255),
        pass_type VARCHAR(50),
        requested_date VARCHAR(50),
        status VARCHAR(50),
        admin_comments TEXT,
        category VARCHAR(50),
        bus_stop VARCHAR(100),
        reason TEXT,
        travel_date_time VARCHAR(100),
        mobile VARCHAR(50)
      )
    `);

    // 3. Passes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS passes (
        pass_id VARCHAR(50) PRIMARY KEY,
        employee_id VARCHAR(50),
        employee_name VARCHAR(100),
        route VARCHAR(255),
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        status VARCHAR(50),
        pass_type VARCHAR(50),
        qr_code_content TEXT
      )
    `);

    // 4. Scan logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS scan_logs (
        id VARCHAR(50) PRIMARY KEY,
        timestamp VARCHAR(100),
        pass_id VARCHAR(50),
        employee_id VARCHAR(50),
        employee_name VARCHAR(100),
        route VARCHAR(255),
        status VARCHAR(50)
      )
    `);

    // 5. Route tracking links table
    await client.query(`
      CREATE TABLE IF NOT EXISTS route_tracking_links (
        route_name VARCHAR(255) PRIMARY KEY,
        tracking_link TEXT
      )
    `);

    // Check if seeding is required
    const empCheck = await client.query('SELECT COUNT(*) FROM employees');
    if (parseInt(empCheck.rows[0].count, 10) === 0) {
      console.log('Seeding initial records to database...');
      
      // Seed employees
      await client.query(`
        INSERT INTO employees (employee_id, name, department, email, phone, password, joined_date)
        VALUES 
        ('EMP1001', 'Alice Johnson', 'Software Engineering', 'alice.j@company.com', '555-0192', 'password123', '2025-01-15'),
        ('EMP1002', 'Robert Chen', 'Human Resources', 'robert.c@company.com', '555-0283', 'password123', '2025-02-10'),
        ('EMP1003', 'Sarah Smith', 'Finance & Accounts', 'sarah.s@company.com', '555-0374', 'password123', '2025-03-01')
      `);

      // Seed pass requests
      await client.query(`
        INSERT INTO pass_requests (request_id, employee_id, employee_name, department, route, pass_type, requested_date, status, admin_comments, category, bus_stop, mobile)
        VALUES 
        ('REQ2001', 'EMP1001', 'Alice Johnson', 'Software Engineering', 'Route 1 (LONI KALBHOR)', 'Monthly', '2026-07-01', 'Approved', 'Approved on schedule.', 'Permanent', 'Loni Gaon', '555-0192'),
        ('REQ2002', 'EMP1002', 'Robert Chen', 'Human Resources', 'Route 3 (SINHAGAD ROAD)', 'Quarterly', '2026-07-08', 'Pending', NULL, 'Permanent', 'Kolhewadi', '555-0283'),
        ('REQ2003', 'EMP1003', 'Sarah Smith', 'Finance & Accounts', 'Route 4 (WARJE)', 'Monthly', '2026-06-15', 'Rejected', 'Incorrect routing details selected.', 'Permanent', 'NDA', '555-0374')
      `);

      // Seed passes
      await client.query(`
        INSERT INTO passes (pass_id, employee_id, employee_name, route, start_date, end_date, status, pass_type, qr_code_content)
        VALUES 
        ('PASS3001', 'EMP1001', 'Alice Johnson', 'Route 1 (LONI KALBHOR)', '2026-07-01', '2026-07-31', 'Active', 'Monthly', 'PASS:PASS3001|EMP:EMP1001|ROUTE:R1|EXP:2026-07-31')
      `);

      // Seed scan logs
      await client.query(`
        INSERT INTO scan_logs (id, timestamp, pass_id, employee_id, employee_name, route, status)
        VALUES 
        ('SCAN4001', '2026-07-10T08:30:00-07:00', 'PASS3001', 'EMP1001', 'Alice Johnson', 'Route 1 (LONI KALBHOR)', 'Valid')
      `);

      // Seed tracking links
      const trackingLinks = [
        { name: 'Route 1 (LONI KALBHOR)', link: 'https://vms-livetrack.pragatiutrack.com/home?id=0409ae0f-58ea-42d6-aded-906e7441243f' },
        { name: 'Route 2 (NARAYANGAON)', link: 'https://vms-livetrack.pragatiutrack.com/home?id=0409ae0f-58ea-42d6-aded-906e7441243f' },
        { name: 'Route 3 (SINHAGAD ROAD)', link: 'https://vms-livetrack.pragatiutrack.com/home?id=0409ae0f-58ea-42d6-aded-906e7441243f' },
        { name: 'Route 4 (WARJE)', link: 'https://vms-livetrack.pragatiutrack.com/home?id=0409ae0f-58ea-42d6-aded-906e7441243f' },
        { name: 'Route 5 (WAGHOLI)', link: 'https://vms-livetrack.pragatiutrack.com/home?id=0409ae0f-58ea-42d6-aded-906e7441243f' }
      ];

      for (const track of trackingLinks) {
        await client.query(`
          INSERT INTO route_tracking_links (route_name, tracking_link)
          VALUES ($1, $2)
          ON CONFLICT (route_name) DO NOTHING
        `, [track.name, track.link]);
      }
      console.log('Database seeded successfully.');
    }

    client.release();
  } catch (err) {
    console.error('Error establishing database connection or setup:', err);
  }
}

ensureTables();

// ---- API ENDPOINTS ----

// Check if database is active
app.get('/api/db-status', (req, res) => {
  res.json({
    connected: !!pool,
    mode: pool ? (process.env.SQL_HOST ? 'cloudsql' : 'postgres') : 'localStorage-fallback',
    message: pool 
      ? (process.env.SQL_HOST ? 'Connected to Google Cloud SQL database' : 'Connected to Azure PostgreSQL database') 
      : 'Running with local storage simulation mode'
  });
});

// Fetch all database state in one call for dynamic synchronization
app.get('/api/all-data', async (req, res) => {
  if (!pool) {
    return res.status(200).json({ fallback: true });
  }

  try {
    const client = await pool.connect();
    
    const employeesRes = await client.query('SELECT * FROM employees');
    const requestsRes = await client.query('SELECT * FROM pass_requests');
    const passesRes = await client.query('SELECT * FROM passes');
    const logsRes = await client.query('SELECT * FROM scan_logs');
    const trackingRes = await client.query('SELECT * FROM route_tracking_links');
    
    client.release();

    // Map database columns (snake_case) to frontend models (camelCase)
    const employees = employeesRes.rows.map(row => ({
      employeeId: row.employee_id,
      name: row.name,
      department: row.department,
      email: row.email,
      phone: row.phone,
      password: row.password,
      shift: row.shift,
      routeNumber: row.route_number,
      busStop: row.bus_stop,
      address: row.address,
      joinedDate: row.joined_date
    }));

    const requests = requestsRes.rows.map(row => ({
      requestId: row.request_id,
      employeeId: row.employee_id,
      employeeName: row.employee_name,
      department: row.department,
      route: row.route,
      passType: row.pass_type,
      requestedDate: row.requested_date,
      status: row.status,
      adminComments: row.admin_comments,
      category: row.category,
      busStop: row.bus_stop,
      reason: row.reason,
      travelDateTime: row.travel_date_time,
      mobile: row.mobile
    }));

    const passes = passesRes.rows.map(row => ({
      passId: row.pass_id,
      employeeId: row.employee_id,
      employeeName: row.employee_name,
      route: row.route,
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      passType: row.pass_type,
      qrCodeContent: row.qr_code_content
    }));

    const scanLogs = logsRes.rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      passId: row.pass_id,
      employeeId: row.employee_id,
      employeeName: row.employee_name,
      route: row.route,
      status: row.status
    }));

    const routeTrackingLinks = trackingRes.rows.map(row => ({
      routeName: row.route_name,
      trackingLink: row.tracking_link
    }));

    res.json({
      fallback: false,
      employees,
      requests,
      passes,
      scan_logs: scanLogs,
      route_tracking_links: routeTrackingLinks
    });
  } catch (err: any) {
    console.error('Error reading database:', err);
    res.status(500).json({ error: err.message, fallback: true });
  }
});

// Sync employees list
app.post('/api/sync/employees', async (req, res) => {
  if (!pool) return res.json({ success: true, localOnly: true });
  const { employees } = req.body;
  if (!Array.isArray(employees)) return res.status(400).json({ error: 'Expected employees array' });

  try {
    const client = await pool.connect();
    for (const emp of employees) {
      await client.query(`
        INSERT INTO employees (employee_id, name, department, email, phone, password, shift, route_number, bus_stop, address, joined_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (employee_id) DO UPDATE SET
          name = EXCLUDED.name,
          department = EXCLUDED.department,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          password = EXCLUDED.password,
          shift = EXCLUDED.shift,
          route_number = EXCLUDED.route_number,
          bus_stop = EXCLUDED.bus_stop,
          address = EXCLUDED.address,
          joined_date = EXCLUDED.joined_date
      `, [
        emp.employeeId,
        emp.name,
        emp.department,
        emp.email,
        emp.phone,
        emp.password,
        emp.shift || null,
        emp.routeNumber || null,
        emp.busStop || null,
        emp.address || null,
        emp.joinedDate || null
      ]);
    }
    client.release();
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error syncing employees:', err);
    res.status(500).json({ error: err.message });
  }
});

// Sync requests list
app.post('/api/sync/requests', async (req, res) => {
  if (!pool) return res.json({ success: true, localOnly: true });
  const { requests } = req.body;
  if (!Array.isArray(requests)) return res.status(400).json({ error: 'Expected requests array' });

  try {
    const client = await pool.connect();
    for (const r of requests) {
      await client.query(`
        INSERT INTO pass_requests (request_id, employee_id, employee_name, department, route, pass_type, requested_date, status, admin_comments, category, bus_stop, reason, travel_date_time, mobile)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (request_id) DO UPDATE SET
          employee_id = EXCLUDED.employee_id,
          employee_name = EXCLUDED.employee_name,
          department = EXCLUDED.department,
          route = EXCLUDED.route,
          pass_type = EXCLUDED.pass_type,
          requested_date = EXCLUDED.requested_date,
          status = EXCLUDED.status,
          admin_comments = EXCLUDED.admin_comments,
          category = EXCLUDED.category,
          bus_stop = EXCLUDED.bus_stop,
          reason = EXCLUDED.reason,
          travel_date_time = EXCLUDED.travel_date_time,
          mobile = EXCLUDED.mobile
      `, [
        r.requestId,
        r.employeeId,
        r.employeeName,
        r.department,
        r.route,
        r.passType,
        r.requestedDate,
        r.status,
        r.adminComments || null,
        r.category || 'Permanent',
        r.busStop || null,
        r.reason || null,
        r.travelDateTime || null,
        r.mobile || null
      ]);
    }
    client.release();
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error syncing requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// Sync passes list
app.post('/api/sync/passes', async (req, res) => {
  if (!pool) return res.json({ success: true, localOnly: true });
  const { passes } = req.body;
  if (!Array.isArray(passes)) return res.status(400).json({ error: 'Expected passes array' });

  try {
    const client = await pool.connect();
    for (const p of passes) {
      await client.query(`
        INSERT INTO passes (pass_id, employee_id, employee_name, route, start_date, end_date, status, pass_type, qr_code_content)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (pass_id) DO UPDATE SET
          employee_id = EXCLUDED.employee_id,
          employee_name = EXCLUDED.employee_name,
          route = EXCLUDED.route,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          status = EXCLUDED.status,
          pass_type = EXCLUDED.pass_type,
          qr_code_content = EXCLUDED.qr_code_content
      `, [
        p.passId,
        p.employeeId,
        p.employeeName,
        p.route,
        p.startDate,
        p.endDate,
        p.status,
        p.passType,
        p.qrCodeContent || null
      ]);
    }
    client.release();
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error syncing passes:', err);
    res.status(500).json({ error: err.message });
  }
});

// Sync scan logs
app.post('/api/sync/scan_logs', async (req, res) => {
  if (!pool) return res.json({ success: true, localOnly: true });
  const { scan_logs } = req.body;
  if (!Array.isArray(scan_logs)) return res.status(400).json({ error: 'Expected scan_logs array' });

  try {
    const client = await pool.connect();
    for (const log of scan_logs) {
      await client.query(`
        INSERT INTO scan_logs (id, timestamp, pass_id, employee_id, employee_name, route, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          timestamp = EXCLUDED.timestamp,
          pass_id = EXCLUDED.pass_id,
          employee_id = EXCLUDED.employee_id,
          employee_name = EXCLUDED.employee_name,
          route = EXCLUDED.route,
          status = EXCLUDED.status
      `, [
        log.id,
        log.timestamp,
        log.passId,
        log.employeeId,
        log.employeeName,
        log.route,
        log.status
      ]);
    }
    client.release();
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error syncing scan_logs:', err);
    res.status(500).json({ error: err.message });
  }
});

// Sync tracking links
app.post('/api/sync/tracking_links', async (req, res) => {
  if (!pool) return res.json({ success: true, localOnly: true });
  const { tracking_links } = req.body;
  if (!Array.isArray(tracking_links)) return res.status(400).json({ error: 'Expected tracking_links array' });

  try {
    const client = await pool.connect();
    for (const track of tracking_links) {
      await client.query(`
        INSERT INTO route_tracking_links (route_name, tracking_link)
        VALUES ($1, $2)
        ON CONFLICT (route_name) DO UPDATE SET
          tracking_link = EXCLUDED.tracking_link
      `, [
        track.routeName,
        track.trackingLink
      ]);
    }
    client.release();
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error syncing tracking links:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---- VITE MIDDLEWARE SETUP ----

async function setupVite() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('Vite Dev Middleware connected.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production build assets.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
