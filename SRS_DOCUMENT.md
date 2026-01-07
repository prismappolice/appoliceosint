# Software Requirements Specification (SRS)

## AP Police OSINT Portal

**Version:** 1.0  
**Date:** January 7, 2026  
**Prepared By:** PRISM Team, Andhra Pradesh Police

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Database Requirements](#6-database-requirements)
7. [Appendix](#7-appendix)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document describes the functional and non-functional requirements for the **AP Police OSINT Portal**. This document is intended for developers, testers, project managers, and stakeholders involved in the development and maintenance of the system.

### 1.2 Scope

The AP Police OSINT Portal is a web-based application that provides a centralized platform for law enforcement officers to access Open Source Intelligence (OSINT) tools and resources. The system enables authenticated users to browse curated links across various investigation categories including breach data, social media intelligence, phone/email lookups, and more.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| OSINT | Open Source Intelligence |
| JWT | JSON Web Token |
| OAuth | Open Authorization |
| API | Application Programming Interface |
| PRISM | Police Research & Intelligence System Module |
| SRS | Software Requirements Specification |
| UI | User Interface |
| CRUD | Create, Read, Update, Delete |

### 1.4 References

- IEEE 830-1998 Standard for Software Requirements Specification
- Express.js Documentation
- Passport.js Documentation
- SQLite Documentation

### 1.5 Overview

This document is organized into the following sections:
- **Section 2**: Overall system description and constraints
- **Section 3**: Detailed functional requirements
- **Section 4**: External interface requirements
- **Section 5**: Non-functional requirements
- **Section 6**: Database requirements

---

## 2. Overall Description

### 2.1 Product Perspective

The AP Police OSINT Portal is a standalone web application designed to serve as a knowledge base and toolkit directory for police investigators. It operates as a client-server architecture with:

- **Frontend**: Static HTML/CSS/JavaScript pages
- **Backend**: Node.js with Express.js framework
- **Database**: SQLite for user and session management

### 2.2 Product Functions

The main functions of the system are:

1. **User Authentication**
   - Local login (username/password)
   - Google OAuth 2.0 login
   - Email-based registration with OTP verification

2. **OSINT Resource Access**
   - Browse categorized OSINT tools
   - Search functionality within each category
   - Access external tool links

3. **Visitor Analytics**
   - Track total and unique visitors
   - Daily visitor statistics
   - Session duration tracking

4. **Session Management**
   - JWT-based authentication
   - Auto-logout after timeout
   - Login/logout activity logging

### 2.3 User Classes and Characteristics

| User Class | Description | Technical Expertise |
|------------|-------------|---------------------|
| **Police Officers** | Primary users who access OSINT tools for investigations | Basic to Intermediate |
| **Investigators** | Use advanced tools for digital forensics | Intermediate to Advanced |
| **Administrators** | System maintainers (future scope) | Advanced |

### 2.4 Operating Environment

| Component | Requirement |
|-----------|-------------|
| **Server OS** | Linux/Windows/macOS |
| **Runtime** | Node.js v16+ |
| **Database** | SQLite 3.x |
| **Browser Support** | Chrome, Firefox, Edge, Safari (latest versions) |
| **Mobile Support** | Responsive design for mobile browsers |

### 2.5 Design and Implementation Constraints

1. Must use Node.js as the runtime environment
2. Must support Google OAuth 2.0 for social login
3. Must maintain backward compatibility with users.json format
4. Session timeout fixed at 30 minutes
5. Must work without internet for cached pages (future PWA scope)

### 2.6 Assumptions and Dependencies

**Assumptions:**
- Users have valid police department credentials
- Users have access to modern web browsers
- Email service (Gmail SMTP) is available for OTP delivery

**Dependencies:**
- Google OAuth API availability
- Gmail SMTP service
- Internet connectivity for external OSINT tool links

---

## 3. System Features

### 3.1 User Authentication

#### 3.1.1 Description
The system shall provide secure authentication mechanisms for users to access protected resources.

#### 3.1.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-001 | System shall allow users to login with username and password | High |
| FR-AUTH-002 | System shall support Google OAuth 2.0 authentication | High |
| FR-AUTH-003 | System shall generate JWT tokens upon successful authentication | High |
| FR-AUTH-004 | System shall store JWT tokens in HTTP-only cookies | High |
| FR-AUTH-005 | System shall expire sessions after 30 minutes of inactivity | Medium |
| FR-AUTH-006 | System shall allow users to logout and clear session | High |
| FR-AUTH-007 | System shall send OTP via email for new user verification | Medium |
| FR-AUTH-008 | System shall redirect unauthenticated users to login page | High |

### 3.2 OSINT Resource Pages

#### 3.2.1 Description
The system shall provide categorized pages containing curated OSINT tool links.

#### 3.2.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-OSINT-001 | System shall display 17 static HTML pages with OSINT resources | High |
| FR-OSINT-002 | System shall provide search functionality on each tool page | Medium |
| FR-OSINT-003 | System shall open external tool links in new browser tabs | Medium |
| FR-OSINT-004 | System shall display tool descriptions and categories | Low |
| FR-OSINT-005 | System shall provide navigation between all pages via navbar | High |

#### 3.2.3 OSINT Categories

| # | Category | Page | Description |
|---|----------|------|-------------|
| 1 | Home | home.html | Dashboard with all categories |
| 2 | AI Tools | aitools.html | AI-powered investigation tools |
| 3 | Blockchain | blockchain-tools.html | Cryptocurrency tracking |
| 4 | Breach Data | breach-data.html | Data breach lookup resources |
| 5 | Contact | contact.html | Contact information |
| 6 | Cyber Tools | cyber.html | Cybersecurity utilities |
| 7 | Darkweb | darkweb-tools.html | Dark web monitoring |
| 8 | Domain Intel | domain-intel.html | Domain/IP investigation |
| 9 | Email Intel | emailintelligence.html | Email lookup tools |
| 10 | Fact Check | factcheck.html | Misinformation verification |
| 11 | GitHub | github.html | GitHub-based OSINT tools |
| 12 | Learning | learning.html | Training resources |
| 13 | OSINT Books | osint-books.html | Reference books |
| 14 | Phone Intel | phone-intel.html | Phone number lookup |
| 15 | Social Media | social-media.html | Social media investigation |

### 3.3 Visitor Analytics

#### 3.3.1 Description
The system shall track and report visitor statistics.

#### 3.3.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ANALYTICS-001 | System shall track total page visits | Medium |
| FR-ANALYTICS-002 | System shall track unique visitors by IP | Medium |
| FR-ANALYTICS-003 | System shall maintain daily visitor statistics | Low |
| FR-ANALYTICS-004 | System shall expose visitor stats via API endpoint | Low |
| FR-ANALYTICS-005 | System shall persist visitor data to disk | Medium |

### 3.4 User Management

#### 3.4.1 Description
The system shall manage user accounts and credentials.

#### 3.4.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-USER-001 | System shall store user credentials in SQLite database | High |
| FR-USER-002 | System shall migrate users from users.json to SQLite on first run | Medium |
| FR-USER-003 | System shall support email-based user registration | Medium |
| FR-USER-004 | System shall log all login/logout activities with timestamps | Medium |
| FR-USER-005 | System shall calculate session duration for each login | Low |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 Login Page (index.html)
- Username input field
- Password input field
- Login button
- Google OAuth login button
- Error message display area

#### 4.1.2 Dashboard (home.html)
- Navigation bar with all category links
- Search bar for filtering tools
- Category cards with tool counts
- Logout button

#### 4.1.3 Tool Pages
- Navigation bar (consistent across all pages)
- Search bar for filtering tools
- Tool cards with:
  - Tool name
  - Description
  - External link button
- Responsive grid layout

### 4.2 Hardware Interfaces

No specific hardware interfaces required. The system runs on standard web server hardware.

### 4.3 Software Interfaces

| Interface | Description |
|-----------|-------------|
| **Google OAuth API** | For user authentication via Google accounts |
| **Gmail SMTP** | For sending OTP emails |
| **SQLite** | For database operations |
| **File System** | For reading/writing JSON files |

### 4.4 Communication Interfaces

| Protocol | Usage |
|----------|-------|
| **HTTP/HTTPS** | Web communication |
| **SMTP** | Email delivery |
| **OAuth 2.0** | Google authentication flow |

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-001 | Page load time | < 3 seconds |
| NFR-PERF-002 | API response time | < 500ms |
| NFR-PERF-003 | Concurrent users | 100+ |
| NFR-PERF-004 | Database query time | < 100ms |

### 5.2 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-SEC-001 | All passwords shall be stored securely | High |
| NFR-SEC-002 | JWT tokens shall expire after 30 minutes | High |
| NFR-SEC-003 | Authentication cookies shall be HTTP-only | High |
| NFR-SEC-004 | CORS headers shall be properly configured | Medium |
| NFR-SEC-005 | All API endpoints shall validate input | High |
| NFR-SEC-006 | Session cookies shall use SameSite attribute | Medium |
| NFR-SEC-007 | Production environment shall use HTTPS | High |

### 5.3 Reliability Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-REL-001 | System uptime | 99.5% |
| NFR-REL-002 | Data persistence on server restart | 100% |
| NFR-REL-003 | Graceful error handling | All endpoints |

### 5.4 Availability Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-AVL-001 | System shall be available 24/7 | Continuous availability |
| NFR-AVL-002 | Health check endpoint shall respond | /healthz returns "ok" |

### 5.5 Maintainability Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-MNT-001 | Code shall follow consistent formatting | ESLint standards |
| NFR-MNT-002 | All API endpoints shall be documented | README.md |
| NFR-MNT-003 | Environment variables shall be used for config | .env file |

### 5.6 Scalability Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-SCL-001 | System shall support horizontal scaling | Stateless design |
| NFR-SCL-002 | Database shall handle 10,000+ users | SQLite capacity |

### 5.7 Usability Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-USE-001 | UI shall be responsive | Mobile-friendly |
| NFR-USE-002 | Navigation shall be consistent | Same navbar on all pages |
| NFR-USE-003 | Search shall filter results in real-time | Client-side filtering |

---

## 6. Database Requirements

### 6.1 Database Schema

#### 6.1.1 Users Table

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

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user identifier |
| username | TEXT | - | User's login username |
| email | TEXT | - | User's email address |
| password | TEXT | - | Hashed password or 'GOOGLE_OAUTH' |
| email_verified | INTEGER | DEFAULT 0 | Email verification status (0/1) |
| verification_code | TEXT | - | OTP for email verification |

#### 6.1.2 Login Logs Table

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

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Unique log entry identifier |
| user_id | INTEGER | Reference to users.id |
| username | TEXT | Username at time of login |
| email | TEXT | Email at time of login |
| login_time | TEXT | ISO timestamp of login |
| logout_time | TEXT | ISO timestamp of logout |
| duration_seconds | INTEGER | Session duration in seconds |

### 6.2 Data Files

#### 6.2.1 visitor-data.json

```json
{
    "totalVisitors": 0,
    "uniqueVisitors": [],
    "dailyStats": {
        "YYYY-MM-DD": {
            "visits": 0,
            "uniques": 0,
            "uniqueIds": []
        }
    },
    "lastUpdated": "ISO_TIMESTAMP"
}
```

---

## 7. Appendix

### 7.1 API Endpoints Summary

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/` | GET | No | Serve login page |
| `/login` | POST | No | Authenticate user |
| `/logout` | POST | No | End user session |
| `/auth/google` | GET | No | Initiate Google OAuth |
| `/auth/google/callback` | GET | No | Google OAuth callback |
| `/api/auth-status` | GET | No | Check auth status |
| `/api/visitor-stats` | GET | No | Get visitor statistics |
| `/api/users` | GET | No | List all users |
| `/healthz` | GET | No | Health check |
| `/:page` | GET | Yes | Serve protected pages |

### 7.2 Protected Pages

The following pages require authentication:
- home.html
- factcheck.html
- social-media.html
- phone-intel.html
- emailintelligence.html
- domain-intel.html
- breach-data.html
- darkweb-tools.html
- blockchain-tools.html
- aitools.html
- learning.html
- github.html
- contact.html
- osint-books.html
- cyber.html

### 7.3 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 8080 | Server port |
| NODE_ENV | No | development | Environment mode |
| GOOGLE_CLIENT_ID | Yes | - | Google OAuth client ID |
| GOOGLE_CLIENT_SECRET | Yes | - | Google OAuth client secret |
| GOOGLE_CALLBACK_URL | Yes | localhost:8080/... | OAuth callback URL |
| JWT_SECRET | Yes | - | JWT signing secret |
| EMAIL_USER | Yes | - | SMTP username |
| EMAIL_PASS | Yes | - | SMTP password |
| EMAIL_FROM | No | EMAIL_USER | Sender email |

### 7.4 Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | Jan 7, 2026 | PRISM Team | Initial SRS document |

---

**Document End**
