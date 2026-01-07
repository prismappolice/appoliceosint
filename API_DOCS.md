# API Documentation

## AP Police OSINT Portal

**Version:** 1.0  
**Base URL:** `https://www.appoliceosint.com` (Production) | `http://localhost:8080` (Development)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [Authentication Endpoints](#authentication-endpoints)
   - [Data Endpoints](#data-endpoints)
   - [Health Check](#health-check)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Examples](#examples)

---

## Overview

The AP Police OSINT Portal API provides endpoints for user authentication, session management, and visitor analytics. All API responses are in JSON format.

### Content Type

All requests should include:
```
Content-Type: application/json
```

### Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Authentication

The API uses **JWT (JSON Web Tokens)** for authentication. Tokens are stored in HTTP-only cookies and automatically included in subsequent requests.

### Token Lifecycle

| Property | Value |
|----------|-------|
| Token Type | JWT |
| Storage | HTTP-only Cookie (`auth_token`) |
| Expiry | 30 minutes |
| Auto-refresh | No (re-login required) |

### Protected Routes

All HTML pages except `index.html` require authentication. The server automatically redirects unauthenticated users to the login page.

---

## API Endpoints

### Authentication Endpoints

---

#### POST `/login`

Authenticate a user with username/password or email/password.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body (Username Login):**
```json
{
  "username": "prism",
  "password": "#Prism_2025"
}
```

**Request Body (Email Login):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful"
}
```

**Response Headers (on success):**
```
Set-Cookie: auth_token=<JWT_TOKEN>; HttpOnly; Path=/; Max-Age=1800; SameSite=Lax
```

**Error Responses:**

| Status | Response |
|--------|----------|
| 400 | `{"success": false, "message": "Username or email and password required"}` |
| 401 | `{"success": false, "message": "Invalid username or password"}` |
| 401 | `{"success": false, "message": "Please verify your email before logging in."}` |
| 401 | `{"success": false, "message": "Invalid password for this email"}` |
| 500 | `{"success": false, "message": "Server error"}` |

**cURL Example:**
```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username": "prism", "password": "#Prism_2025"}' \
  -c cookies.txt
```

**JavaScript Example:**
```javascript
const response = await fetch('/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    username: 'prism',
    password: '#Prism_2025'
  })
});

const data = await response.json();
if (data.success) {
  window.location.href = '/home';
}
```

---

#### POST `/logout`

End the user session and clear the authentication cookie.

**Request Headers:**
```
Content-Type: application/json
Cookie: auth_token=<JWT_TOKEN>
```

**Request Body (Optional):**
```json
{
  "username": "prism"
}
```
or
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

**Response Headers:**
```
Set-Cookie: auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/logout \
  -H "Content-Type: application/json" \
  -d '{"username": "prism"}' \
  -b cookies.txt
```

**JavaScript Example:**
```javascript
const response = await fetch('/logout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ username: currentUser })
});

const data = await response.json();
if (data.success) {
  window.location.href = '/';
}
```

---

#### GET `/auth/google`

Initiate Google OAuth 2.0 authentication flow.

**Description:**  
Redirects the user to Google's authentication page. After successful authentication, Google redirects back to `/auth/google/callback`.

**Response:**  
HTTP 302 Redirect to Google OAuth consent screen.

**Usage:**
```html
<a href="/auth/google">Login with Google</a>
```

**JavaScript Example:**
```javascript
function loginWithGoogle() {
  window.location.href = '/auth/google';
}
```

---

#### GET `/auth/google/callback`

Handle Google OAuth callback after user authentication.

**Query Parameters (set by Google):**
| Parameter | Description |
|-----------|-------------|
| code | Authorization code from Google |
| scope | Granted scopes |

**Success Response:**  
HTTP 302 Redirect to `/home` with `auth_token` cookie set.

**Failure Response:**  
HTTP 302 Redirect to `/` (login page).

> **Note:** This endpoint is called automatically by Google after user authentication. Do not call directly.

---

#### GET `/api/auth-status`

Check if the current user is authenticated.

**Request Headers:**
```
Cookie: auth_token=<JWT_TOKEN>
```

**Success Response (Authenticated - 200 OK):**
```json
{
  "authenticated": true,
  "username": "prism"
}
```

**Response (Not Authenticated - 200 OK):**
```json
{
  "authenticated": false
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:8080/api/auth-status \
  -b cookies.txt
```

**JavaScript Example:**
```javascript
async function checkAuthStatus() {
  const response = await fetch('/api/auth-status', {
    credentials: 'include'
  });
  const data = await response.json();
  
  if (data.authenticated) {
    console.log(`Logged in as: ${data.username}`);
  } else {
    window.location.href = '/';
  }
}
```

---

### Data Endpoints

---

#### GET `/api/visitor-stats`

Get visitor statistics for the portal.

**Request Headers:**
```
Cookie: auth_token=<JWT_TOKEN>
```

**Success Response (200 OK):**
```json
{
  "totalVisitors": 1250,
  "uniqueVisitors": 487,
  "todayVisitors": 45,
  "todayUniqueVisitors": 23,
  "dailyStats": {
    "2026-01-07": {
      "visits": 45,
      "uniques": 23,
      "uniqueIds": ["192.168.1.1", "192.168.1.2"]
    },
    "2026-01-06": {
      "visits": 52,
      "uniques": 28,
      "uniqueIds": ["192.168.1.3", "192.168.1.4"]
    }
  },
  "lastUpdated": "2026-01-07T14:30:00.000Z"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to get visitor statistics"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:8080/api/visitor-stats \
  -b cookies.txt
```

**JavaScript Example:**
```javascript
async function getVisitorStats() {
  const response = await fetch('/api/visitor-stats', {
    credentials: 'include'
  });
  const stats = await response.json();
  
  document.getElementById('total-visitors').textContent = stats.totalVisitors;
  document.getElementById('unique-visitors').textContent = stats.uniqueVisitors;
  document.getElementById('today-visitors').textContent = stats.todayVisitors;
}
```

---

#### GET `/api/users`

Get list of all registered users.

**Request Headers:**
```
Cookie: auth_token=<JWT_TOKEN>
```

**Success Response (200 OK):**
```json
[
  {
    "username": "ap_dgp",
    "password": "#Ap_DGP_2025"
  },
  {
    "username": "prism",
    "password": "#Prism_2025"
  }
]
```

**Error Response (500):**
```json
{
  "error": "Failed to get users"
}
```

> **Security Note:** This endpoint exposes user credentials. In production, this should be restricted to admin users only or removed.

**cURL Example:**
```bash
curl -X GET http://localhost:8080/api/users \
  -b cookies.txt
```

---

### Health Check

---

#### GET `/healthz`

Check if the server is running and healthy.

**Success Response (200 OK):**
```
ok
```

**cURL Example:**
```bash
curl -X GET http://localhost:8080/healthz
```

**Usage in Monitoring:**
```bash
# Health check script
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/healthz)
if [ $response -eq 200 ]; then
  echo "Server is healthy"
else
  echo "Server is down!"
  # Send alert
fi
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 302 | Redirect | Authentication redirect |
| 400 | Bad Request | Missing or invalid parameters |
| 401 | Unauthorized | Invalid credentials or session expired |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

### Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Username or email and password required" | Missing login credentials | Provide username/email and password |
| "Invalid username or password" | Wrong credentials | Check username and password |
| "Please verify your email before logging in" | Email not verified | Complete email verification |
| "Server error" | Internal error | Check server logs |

---

## Rate Limiting

Currently, no rate limiting is implemented. For production deployment, consider implementing:

| Endpoint | Recommended Limit |
|----------|-------------------|
| `/login` | 5 requests per minute per IP |
| `/api/*` | 100 requests per minute per user |
| `/auth/google` | 10 requests per minute per IP |

---

## Examples

### Complete Login Flow

```javascript
// 1. Check if already authenticated
async function init() {
  const authResponse = await fetch('/api/auth-status', {
    credentials: 'include'
  });
  const authData = await authResponse.json();
  
  if (authData.authenticated) {
    showDashboard(authData.username);
  } else {
    showLoginForm();
  }
}

// 2. Handle login form submission
async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      window.location.href = '/home';
    } else {
      showError(data.message);
    }
  } catch (error) {
    showError('Network error. Please try again.');
  }
}

// 3. Handle logout
async function handleLogout() {
  const response = await fetch('/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  
  const data = await response.json();
  if (data.success) {
    window.location.href = '/';
  }
}
```

### Visitor Stats Dashboard Widget

```javascript
async function loadVisitorWidget() {
  try {
    const response = await fetch('/api/visitor-stats', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    const stats = await response.json();
    
    // Update UI
    document.querySelector('.total-visitors').textContent = 
      stats.totalVisitors.toLocaleString();
    document.querySelector('.unique-visitors').textContent = 
      stats.uniqueVisitors.toLocaleString();
    document.querySelector('.today-visitors').textContent = 
      stats.todayVisitors.toLocaleString();
    
    // Update chart with daily stats
    updateChart(stats.dailyStats);
    
  } catch (error) {
    console.error('Error loading visitor stats:', error);
  }
}

function updateChart(dailyStats) {
  const dates = Object.keys(dailyStats).sort().slice(-7);
  const visits = dates.map(d => dailyStats[d].visits);
  const uniques = dates.map(d => dailyStats[d].uniques);
  
  // Render chart with dates, visits, uniques
}
```

### cURL Session Example

```bash
# 1. Login and save cookies
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username": "prism", "password": "#Prism_2025"}' \
  -c cookies.txt \
  -v

# 2. Check auth status
curl -X GET http://localhost:8080/api/auth-status \
  -b cookies.txt

# 3. Get visitor stats
curl -X GET http://localhost:8080/api/visitor-stats \
  -b cookies.txt

# 4. Logout
curl -X POST http://localhost:8080/logout \
  -H "Content-Type: application/json" \
  -d '{"username": "prism"}' \
  -b cookies.txt

# 5. Verify logged out
curl -X GET http://localhost:8080/api/auth-status \
  -b cookies.txt
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 7, 2026 | Initial API documentation |

---

**Document End**
