// server.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");


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
function recordVisit(req) {
  const today = ymd();
  const id = getClientId(req);

  state.totalVisitors += 1;
  // uniques
  const wasNew = !state.uniqueVisitors.has(id);
  if (wasNew) state.uniqueVisitors.add(id);
  // daily stats
  if (!state.dailyStats[today]) {
    state.dailyStats[today] = { visits: 0, uniques: 0, uniqueIds: [] };
  }
  state.dailyStats[today].visits += 1;
  // Only increment uniques if this user hasn't visited today
  if (!state.dailyStats[today].uniqueIds) state.dailyStats[today].uniqueIds = [];
  if (!state.dailyStats[today].uniqueIds.includes(id)) {
    state.dailyStats[today].uniques += 1;
    state.dailyStats[today].uniqueIds.push(id);
  }
  state.lastUpdated = new Date().toISOString();
  console.log(`[VISITOR] recordVisit called. IP: ${req.ip}, UA: ${req.headers["user-agent"]}, ID: ${id}, totalVisitors: ${state.totalVisitors}, uniqueVisitors: ${state.uniqueVisitors.size}`);
  scheduleSave();
}

// ---------- Static files ----------
app.use(express.static(path.join(__dirname, "public")));

// ---------- Page view counter middleware ----------
// Count only for GET requests to non-API paths (i.e., actual page views)
app.use((req, res, next) => {
  console.log(`[MIDDLEWARE] ${req.method} ${req.path}`);
  if (req.method === "GET" && !req.path.startsWith("/api/")) {
    console.log(`[MIDDLEWARE] Calling recordVisit for: ${req.method} ${req.path}`);
    recordVisit(req);
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
    // Do NOT increment visitor count on API call
    const today = new Date().toISOString().slice(0, 10);
    let todayStats = state.dailyStats[today];
    // Always provide numbers, never N/A
    const todayVisitors = (todayStats && typeof todayStats.visits === 'number') ? todayStats.visits : 0;
    const todayUniqueVisitors = (todayStats && typeof todayStats.uniques === 'number') ? todayStats.uniques : 0;
    res.json({
      totalVisitors: state.totalVisitors,
      uniqueVisitors: state.uniqueVisitors.size,
      todayVisitors,
      todayUniqueVisitors,
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
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log("Missing credentials");
      return res.status(400).json({ success: false, message: "Username and password required" });
    }
    
    const file = path.join(__dirname, "users.json");
    if (!fs.existsSync(file)) {
      console.log("User database missing");
      return res.status(500).json({ success: false, message: "User database missing" });
    }
    
    const users = JSON.parse(fs.readFileSync(file, "utf-8"));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      console.log("Login successful for:", username);
      return res.json({ success: true, message: "Login successful" });
    } else {
      console.log("Invalid credentials for:", username);
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
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
