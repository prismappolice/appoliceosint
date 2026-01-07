// --- Login Logging Helper ---
function logLogin(user) {
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO login_logs (user_id, username, email, login_time) VALUES (?, ?, ?, ?)',
    [user.id || null, user.username || null, user.email || null, now]
  );
}

function logLogout(user) {
  // Find the latest login for this user with no logout_time
  db.get(
    'SELECT id, login_time FROM login_logs WHERE (user_id = ? OR username = ? OR email = ?) AND logout_time IS NULL ORDER BY login_time DESC LIMIT 1',
    [user.id || null, user.username || null, user.email || null],
    (err, row) => {
      if (row) {
        const logoutTime = new Date().toISOString();
        const loginTime = new Date(row.login_time);
        const duration = Math.floor((new Date(logoutTime) - loginTime) / 1000);
        db.run(
          'UPDATE login_logs SET logout_time = ?, duration_seconds = ? WHERE id = ?',
          [logoutTime, duration, row.id]
        );
      }
    }
  );
}
// server.js
const nodemailer = require('nodemailer');
// --- Email (nodemailer) Setup ---
// Configure these with your SMTP provider or Gmail (for demo, using environment variables)
const EMAIL_USER = process.env.EMAIL_USER || 'your_email@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your_email_password';
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

const transporter = nodemailer.createTransport({
  service: 'gmail', // Change to your provider if not using Gmail
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
app.use(cookieParser());
// --- Google OAuth Setup ---
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

require('dotenv').config();
// Use environment variables for Google OAuth credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/auth/google/callback';

// JWT secret key (use a strong secret in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Session timeout (30 minutes in milliseconds)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Function to generate JWT token for a user
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, loginTime: Date.now() }, JWT_SECRET, { expiresIn: '30m' });
}

// Middleware to verify JWT token from cookie
function authenticateToken(req, res, next) {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.redirect('/');
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.clearCookie('auth_token');
      return res.redirect('/');
    }
    req.user = user;
    next();
  });
}

// List of protected pages that require login
const PROTECTED_PAGES = [
  'home', 'factcheck', 'social-media', 'phone-intel', 'emailintelligence',
  'domain-intel', 'breach-data', 'darkweb-tools', 'blockchain-tools',
  'aitools', 'learning', 'github', 'contact', 'osint-books', 'cyber'
];
app.use(session({
  secret: 'ap-police-osint-secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) return done(err);
    done(null, row);
  });
});

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  // Find or create user in SQLite
  db.get('SELECT * FROM users WHERE email = ?', [profile.emails[0].value], (err, row) => {
    if (err) return done(err);
    if (row) {
      // User exists
      return done(null, row);
    } else {
      // Create new user
      db.run('INSERT INTO users (username, email, password, email_verified) VALUES (?, ?, ?, 1)', [profile.displayName, profile.emails[0].value, 'GOOGLE_OAUTH'], function (insertErr) {
          const token = generateToken(row);
          return res.json({ success: true, token });
        if (insertErr) return done(insertErr);
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err2, newRow) => {
          if (err2) return done(err2);
          return done(null, newRow);
        });
      });
    }
  });
}));

// Google OAuth routes

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Successful authentication, log login and set JWT cookie
  if (req.user) {
    logLogin(req.user);
    // Generate JWT token and set as HTTP-only cookie
    const token = generateToken(req.user);
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_TIMEOUT,
      sameSite: 'lax'
    });
  }
  // Redirect directly to home - no auth-success.html needed
  res.redirect('/home');
});


// --- SQLite Setup ---
const sqlite3 = require('sqlite3').verbose();
const DB_FILE = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite DB:', err);
  } else {
    console.log('Connected to SQLite database.');
  }
});
// Create users table if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT,
    password TEXT,
    email_verified INTEGER DEFAULT 0,
    verification_code TEXT
  )`);
});

// --- Migrate users.json to SQLite if DB is empty ---
const migrateUsersToSQLite = () => {
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) return console.error('Error checking users table:', err);
    if (row.count === 0) {
      const usersFile = path.join(__dirname, 'users.json');
      if (fs.existsSync(usersFile)) {
        try {
          const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
          const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
          users.forEach(u => {
            stmt.run(u.username, u.password);
          });
          stmt.finalize();
          console.log('Migrated users from users.json to SQLite.');
        } catch (e) {
          console.error('Failed to migrate users.json to SQLite:', e);
        }
      }
    }
  });
};
migrateUsersToSQLite();


// ---------- Config ----------
app.set("trust proxy", true); // so req.ip respects X-Forwarded-For behind nginx/proxy

// CORS middleware for mobile compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ---------- Data file (local/dev only) ----------
const VISITOR_DATA_FILE = path.join(__dirname, "visitor-data.json");



// ---------- Load, keep in-memory state ----------
function safeReadJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (e) {
    console.error("Error reading JSON:", e);
    return fallback;
  }
}



// State is loaded from disk locally
let diskData = {
  totalVisitors: 0,
  uniqueVisitors: [],
  dailyStats: {},
  lastUpdated: new Date().toISOString(),
};
if (fs.existsSync(VISITOR_DATA_FILE)) {
  diskData = safeReadJSON(VISITOR_DATA_FILE, diskData);
}
let state = {
  totalVisitors: Number(diskData.totalVisitors) || 0,
  uniqueVisitors: new Set(diskData.uniqueVisitors || []),
  dailyStats: diskData.dailyStats || {},
  lastUpdated: diskData.lastUpdated || new Date().toISOString(),
};


function scheduleSave() {
  // Local/dev only: write to disk
  try {
    fs.writeFileSync(VISITOR_DATA_FILE, JSON.stringify({
      totalVisitors: state.totalVisitors,
      uniqueVisitors: Array.from(state.uniqueVisitors),
      dailyStats: state.dailyStats,
      lastUpdated: state.lastUpdated,
    }, null, 2));
  } catch (e) {
    console.error('Error saving visitor data locally:', e);
  }
}

function persistSync() {
  // Local/dev only: write to disk
  try {
    fs.writeFileSync(VISITOR_DATA_FILE, JSON.stringify({
      totalVisitors: state.totalVisitors,
      uniqueVisitors: Array.from(state.uniqueVisitors),
      dailyStats: state.dailyStats,
      lastUpdated: state.lastUpdated,
    }, null, 2));
  } catch (e) {
    console.error('Error saving visitor data locally:', e);
  }
}

process.on("SIGINT", () => { persistSync(); process.exit(0); });
process.on("SIGTERM", () => { persistSync(); process.exit(0); });

// ---------- Helpers ----------
function ymd(date = new Date()) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getClientId(req) {
  // Use IP + UA; hash for privacy
  const ip = req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  const raw = `${ip}|${ua}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}


// Count a visit (call this for page views, not for every API hit)
function recordVisit(req, res) {
  const today = ymd();
  const id = getClientId(req);
  if (!state.dailyStats[today]) {
    state.dailyStats[today] = { visits: 0, uniques: 0, uniqueIds: [] };
  }
  // Only increment today's visits and uniques if this device hasn't visited today
  if (!state.dailyStats[today].uniqueIds.includes(id)) {
    state.totalVisitors += 1;
    if (!state.uniqueVisitors.has(id)) {
      state.uniqueVisitors.add(id);
    }
    state.dailyStats[today].visits += 1;
    state.dailyStats[today].uniques += 1;
    state.dailyStats[today].uniqueIds.push(id);
    state.lastUpdated = new Date().toISOString();
    scheduleSave();
    console.log(`[VISITOR] NEW unique visit for today. IP: ${req.ip}, UA: ${req.headers["user-agent"]}, ID: ${id}, totalVisitors: ${state.totalVisitors}, uniqueVisitors: ${state.uniqueVisitors.size}`);
  } else {
    // Already visited today, do not increment
    console.log(`[VISITOR] Repeat visit ignored for today. IP: ${req.ip}, UA: ${req.headers["user-agent"]}, ID: ${id}`);
  }
}

// ---------- Clean URLs (remove .html extension) ----------
// Redirect .html URLs to clean URLs
app.use((req, res, next) => {
  // Skip API routes and static files
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) {
    return next();
  }
  
  // If URL ends with .html, redirect to clean URL
  if (req.path.endsWith('.html')) {
    const cleanPath = req.path.slice(0, -5); // Remove .html
    // For index.html, redirect to root
    if (cleanPath === '/index' || cleanPath === '') {
      return res.redirect(301, '/');
    }
    return res.redirect(301, cleanPath);
  }
  next();
});

// ---------- Protected Pages Authentication ----------
// Check JWT cookie for all protected pages
app.use((req, res, next) => {
  // Skip API routes, auth routes, and static files with extensions
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/') || req.path.includes('.')) {
    return next();
  }
  
  // Root path (login page) - always allow
  if (req.path === '/') {
    return next();
  }
  
  // Check if this is a protected page
  const pageName = req.path.slice(1); // Remove leading /
  if (PROTECTED_PAGES.includes(pageName)) {
    const token = req.cookies.auth_token;
    if (!token) {
      console.log(`[AUTH] No token for protected page: ${pageName}`);
      return res.redirect('/');
    }
    try {
      const user = jwt.verify(token, JWT_SECRET);
      req.user = user;
      // Refresh the cookie to extend session
      const newToken = generateToken(user);
      res.cookie('auth_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_TIMEOUT,
        sameSite: 'lax'
      });
    } catch (err) {
      console.log(`[AUTH] Invalid token for protected page: ${pageName}`);
      res.clearCookie('auth_token');
      return res.redirect('/');
    }
  }
  next();
});

// Serve HTML files without extension
app.use((req, res, next) => {
  // Skip API routes, static files with extensions, and auth routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/') || req.path.includes('.')) {
    return next();
  }
  
  // Root path serves index.html
  if (req.path === '/') {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  
  // Try to serve the corresponding .html file
  const htmlFile = path.join(__dirname, 'public', req.path + '.html');
  const fs = require('fs');
  
  if (fs.existsSync(htmlFile)) {
    return res.sendFile(htmlFile);
  }
  
  next();
});

// ---------- Static files ----------
app.use(express.static(path.join(__dirname, "public")));

// ---------- Page view counter middleware ----------
// Count only for GET requests to non-API paths (i.e., actual page views)
// (MUST be after Google OAuth routes)
app.use((req, res, next) => {
  // Don't interfere with OAuth endpoints
  if (req.path.startsWith('/auth/google')) return next();
  console.log(`[MIDDLEWARE] ${req.method} ${req.path}`);
  if (req.method === "GET" && !req.path.startsWith("/api/")) {
    console.log(`[MIDDLEWARE] Calling recordVisit for: ${req.method} ${req.path}`);
    recordVisit(req, res);
  }
  next();
});

// ---------- Health check ----------
app.get("/healthz", (_req, res) => {
  res.status(200).send("ok");
});

// ---------- API: visitor stats ----------
app.get("/api/visitor-stats", (req, res) => {
  try {
    const today = ymd();
    if (!state.dailyStats[today]) {
      state.dailyStats[today] = { visits: 0, uniques: 0, uniqueIds: [] };
    }
    const todayStats = state.dailyStats[today];
    res.json({
      totalVisitors: state.totalVisitors,
      uniqueVisitors: Array.isArray(state.uniqueVisitors) ? state.uniqueVisitors.length : (state.uniqueVisitors?.size || 0),
      todayVisitors: todayStats.visits,
      todayUniqueVisitors: todayStats.uniques,
      dailyStats: state.dailyStats,
      lastUpdated: state.lastUpdated,
    });
  } catch (error) {
    console.error("Error getting visitor stats:", error);
    res.status(500).json({ error: "Failed to get visitor statistics" });
  }
});

// ---------- API: users ----------
app.get("/api/users", (_req, res) => {
  try {
    const file = path.join(__dirname, "users.json");
    if (!fs.existsSync(file)) {
      // Optional: return empty list if file absent
      return res.json([]);
    }
    const users = JSON.parse(fs.readFileSync(file, "utf-8"));
    res.json(users);
  } catch (error) {
    console.error("Error reading users.json:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

// ---------- API: login ----------
app.post("/login", (req, res) => {
  // Add CORS headers for mobile compatibility
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  
  try {
    console.log("Login attempt from:", req.ip, "User-Agent:", req.headers["user-agent"]);
    console.log("Request body:", req.body);
    
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) {
      console.log("Missing credentials");
      return res.status(400).json({ success: false, message: "Username or email and password required" });
    }
    // Use SQLite for authentication
    let query, params;
    if (username) {
      query = 'SELECT * FROM users WHERE username = ? AND password = ?';
      params = [username, password];
      db.get(query, params, (err, row) => {
        if (err) {
          console.error('SQLite login error:', err);
          return res.status(500).json({ success: false, message: 'Server error' });
        }
        if (row) {
          console.log('Login successful for:', username);
          logLogin(row);
          // Generate JWT token and set as HTTP-only cookie
          const token = generateToken(row);
          res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: SESSION_TIMEOUT,
            sameSite: 'lax'
          });
          return res.json({ success: true, message: 'Login successful' });
        } else {
          console.log('Invalid credentials for:', username);
          return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
      });
    } else if (email) {
      // Try to find user by email and password
      query = 'SELECT * FROM users WHERE email = ? AND password = ?';
      params = [email, password];
      db.get(query, params, (err, row) => {
        if (err) {
          console.error('SQLite login error:', err);
          return res.status(500).json({ success: false, message: 'Server error' });
        }
        if (row) {
          if (row.email_verified) {
            console.log('Login successful for:', email);
            logLogin(row);
            // Generate JWT token and set as HTTP-only cookie
            const token = generateToken(row);
            res.cookie('auth_token', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: SESSION_TIMEOUT,
              sameSite: 'lax'
            });
            return res.json({ success: true, message: 'Login successful' });
          } else {
            return res.status(401).json({ success: false, message: 'Please verify your email before logging in.' });
          }
        } else {
          // If email exists but password is wrong, reject
          db.get('SELECT * FROM users WHERE email = ?', [email], (err2, row2) => {
            if (err2) {
              console.error('SQLite email check error:', err2);
              return res.status(500).json({ success: false, message: 'Server error' });
            }
            if (row2) {
              // Email exists, wrong password
              console.log('Invalid password for email:', email);
              return res.status(401).json({ success: false, message: 'Invalid password for this email' });
            } else {
              // Email does not exist, create new user with verification code
              const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
              db.run('INSERT INTO users (email, password, email_verified, verification_code) VALUES (?, ?, 0, ?)', [email, password, verificationCode], function (insertErr) {
                if (insertErr) {
                  console.error('SQLite insert error:', insertErr);
                  return res.status(500).json({ success: false, message: 'Server error' });
                }
                // Send verificationCode to user's email
                const mailOptions = {
                  from: EMAIL_FROM,
                  to: email,
                  subject: 'Your Verification Code',
                  text: `Your verification code is: ${verificationCode}`
                };
                transporter.sendMail(mailOptions, (mailErr, info) => {
                  if (mailErr) {
                    console.error('Failed to send verification email:', mailErr);
                    return res.status(500).json({ success: false, message: 'Failed to send verification email.' });
                  }
                  console.log('Verification email sent:', info.response);
                  return res.status(401).json({ success: false, message: 'A verification code has been sent to your email. Please verify to activate your account.' });
                });
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- Logout API (clears cookie and logs logout) ---
app.post('/logout', (req, res) => {
  // Clear the auth cookie first
  res.clearCookie('auth_token');
  
  const { username, email } = req.body;
  if (username || email) {
    // Find user by username or email
    let query, param;
    if (username) {
      query = 'SELECT * FROM users WHERE username = ?';
      param = username;
    } else {
      query = 'SELECT * FROM users WHERE email = ?';
      param = email;
    }
    db.get(query, [param], (err, user) => {
      if (!err && user) {
        logLogout(user);
      }
    });
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// --- API: Check auth status ---
app.get('/api/auth-status', (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.json({ authenticated: false });
  }
  try {
    const user = jwt.verify(token, JWT_SECRET);
    return res.json({ authenticated: true, username: user.username });
  } catch (err) {
    res.clearCookie('auth_token');
    return res.json({ authenticated: false });
  }
});

// ---------- Routes ----------
// Route for index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes for all other HTML pages in public/
const htmlPages = [
  'blockchain-tools.html',
  'breach-data.html',
  'darkweb-tools.html',
  'home.html',
  'domain-intel.html',
  'factcheck.html',
  'learning.html',
  'mobile-test.html',
  'osinttools.html',
  'social-media.html'
];
htmlPages.forEach(page => {
  app.get('/' + page, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', page));
  });
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

// Log process exit events for debugging
process.on('exit', (code) => {
  console.log(`Process exit event with code: ${code}`);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
