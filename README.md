# AP Police OSINT Portal

A comprehensive Open Source Intelligence (OSINT) web portal developed for the Andhra Pradesh Police under the **PRISM** initiative. This platform serves as a centralized resource hub for law enforcement officers to access curated tools and links for various digital investigation needs.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Security Features](#security-features)

---

## 🎯 Overview

**appolice-osint** is a web-based OSINT toolkit directory designed specifically for police investigators, providing quick access to various intelligence-gathering resources in a single organized portal.

### Key Highlights:
- 17 static HTML pages with OSINT tool categories
- Secure authentication (Local + Google OAuth)
- Session management with JWT tokens
- Visitor tracking and analytics
- Mobile responsive design

---

## ✨ Features

| Category | Description |
|----------|-------------|
| **Breach Data** | Resources for checking data breaches |
| **Cyber Tools** | Cybersecurity investigation utilities |
| **Darkweb Tools** | Dark web monitoring resources |
| **Social Media Intel** | Social media investigation tools |
| **Phone/Email Intel** | Phone number and email lookup resources |
| **Domain Intelligence** | Domain and IP investigation tools |
| **Blockchain Tools** | Cryptocurrency tracking utilities |
| **AI Tools** | AI-powered investigation tools |
| **Fact Check** | Misinformation verification resources |
| **Learning Resources** | OSINT training and books |
| **GitHub Resources** | GitHub-based OSINT tools |

---

## 🛠️ Tech Stack

### Server-Side Technologies
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| SQLite3 | Database |
| Passport.js | Authentication (Google OAuth 2.0) |
| JWT | Token-based session management |
| Nodemailer | Email service (OTP/notifications) |
| dotenv | Environment configuration |
| cookie-parser | Cookie handling |
| express-session | Session management |

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

---

## 📁 Project Structure

```
appoliceosint/
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
├── users.json             # User credentials (migrated to SQLite)
├── users.db               # SQLite database
├── visitor-data.json      # Visitor tracking data
├── CNAME                  # Custom domain configuration
├── .env                   # Environment variables
└── public/                # Static files
    ├── index.html         # Login page
    ├── home.html          # Dashboard
    ├── aitools.html       # AI Tools page
    ├── blockchain-tools.html
    ├── breach-data.html
    ├── contact.html
    ├── cyber.html
    ├── darkweb-tools.html
    ├── domain-intel.html
    ├── emailintelligence.html
    ├── factcheck.html
    ├── github.html
    ├── learning.html
    ├── osint-books.html
    ├── phone-intel.html
    ├── social-media.html
    ├── common.js          # Shared JavaScript
    ├── *.css              # Stylesheets
    └── cyber/             # PDF manuals
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/prismappolice/appoliceosint.git
   cd appoliceosint
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback

   # JWT
   JWT_SECRET=your_jwt_secret_key

   # Email (Nodemailer)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=your_email@gmail.com

   # Server
   PORT=8080
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   Open `http://localhost:8080` in your browser.

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Yes |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `EMAIL_USER` | SMTP email username | Yes |
| `EMAIL_PASS` | SMTP email password/app password | Yes |
| `EMAIL_FROM` | Sender email address | No |
| `PORT` | Server port (default: 8080) | No |
| `NODE_ENV` | Environment (development/production) | No |

---

## 📡 API Documentation

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/login` | POST | Local login with username/password |
| `/logout` | POST | User logout |
| `/auth/google` | GET | Initiate Google OAuth login |
| `/auth/google/callback` | GET | Google OAuth callback |
| `/api/auth-status` | GET | Check authentication status |

### Data Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/visitor-stats` | GET | Get visitor statistics |
| `/api/users` | GET | List all users |
| `/healthz` | GET | Health check |

### Request/Response Examples

#### Login
```http
POST /login
Content-Type: application/json

{
  "username": "prism",
  "password": "#Prism_2025"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login successful"
}
```

#### Auth Status
```http
GET /api/auth-status
```

**Response:**
```json
{
  "authenticated": true,
  "username": "prism"
}
```

---

## 👥 User Roles

### Number of Roles: 1 (Single Role)

| State | Access Level |
|-------|--------------|
| **Guest (Not logged in)** | Can only view login page |
| **Authenticated User** | Full access to all OSINT resource pages |

The application follows a binary authentication model – users are either logged in with full access or logged out with no access to protected pages.

---

## 🔒 Security Features

1. **JWT Authentication** – Token-based auth with 30-minute expiry
2. **HTTP-Only Cookies** – Prevents XSS attacks on auth tokens
3. **Google OAuth 2.0** – Secure social login
4. **Email Verification** – OTP-based email verification for new users
5. **Password Hashing** – Secure credential storage
6. **Protected Routes** – Middleware-based route protection
7. **Session Timeout** – Auto-logout after 30 minutes of inactivity
8. **Login/Logout Logging** – Activity tracking with timestamps

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  email TEXT,
  password TEXT,
  email_verified INTEGER DEFAULT 0,
  verification_code TEXT
);
```

### Login Logs Table
```sql
CREATE TABLE login_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  username TEXT,
  email TEXT,
  login_time TEXT,
  logout_time TEXT,
  duration_seconds INTEGER
);
```

---

## 🌐 Deployment

The application is configured for deployment at:
- **Domain**: www.appoliceosint.com
- **Port**: 8080 (configurable)

---

## 📝 License

This project is developed for the Andhra Pradesh Police Department.

---

## 👨‍💻 Developed By

**PRISM Team** - Andhra Pradesh Police