# Contributing to AP Police OSINT Portal

Thank you for your interest in contributing to the AP Police OSINT Portal! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Development Setup](#development-setup)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Issue Guidelines](#issue-guidelines)
9. [Security Vulnerabilities](#security-vulnerabilities)

---

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Prioritize the security and integrity of the system
- Maintain confidentiality of sensitive information

### Unacceptable Behavior

- Harassment or discrimination
- Sharing sensitive police data or credentials
- Introducing malicious code
- Violating security protocols

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- [ ] Node.js v16 or higher installed
- [ ] Git installed and configured
- [ ] A GitHub account
- [ ] Basic understanding of JavaScript/Node.js
- [ ] Familiarity with Express.js framework

### Repository Structure

```
appoliceosint/
├── server.js              # Main Express server
├── package.json           # Dependencies
├── users.json             # User credentials (legacy)
├── users.db               # SQLite database
├── visitor-data.json      # Visitor tracking
├── .env                   # Environment variables (not in repo)
├── .gitignore             # Git ignore rules
├── README.md              # Project documentation
├── SRS_DOCUMENT.md        # Software Requirements Specification
├── API_DOCS.md            # API documentation
├── CONTRIBUTING.md        # This file
└── public/                # Static frontend files
    ├── *.html             # HTML pages
    ├── *.css              # Stylesheets
    ├── *.js               # JavaScript files
    └── cyber/             # PDF resources
```

---

## How to Contribute

### Types of Contributions

We welcome the following types of contributions:

| Type | Description |
|------|-------------|
| 🐛 **Bug Fixes** | Fix bugs and issues |
| ✨ **New Features** | Add new OSINT tools or functionality |
| 📝 **Documentation** | Improve docs, comments, README |
| 🎨 **UI/UX** | Improve design, accessibility, responsiveness |
| 🔒 **Security** | Security improvements and patches |
| 🧪 **Testing** | Add or improve tests |
| 🔧 **Refactoring** | Code cleanup and optimization |

### Contribution Workflow

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a new branch for your feature/fix
4. **Make** your changes
5. **Test** your changes thoroughly
6. **Commit** with clear messages
7. **Push** to your fork
8. **Submit** a Pull Request

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/appoliceosint.git
cd appoliceosint
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
# Server
PORT=8080
NODE_ENV=development

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback

# JWT
JWT_SECRET=your_development_secret_key

# Email (optional for development)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### 4. Start Development Server

```bash
npm start
```

### 5. Access the Application

Open `http://localhost:8080` in your browser.

### Test Credentials

For development, use these credentials:
- **Username:** `prism`
- **Password:** `#Prism_2025`

---

## Coding Standards

### JavaScript Style Guide

We follow these conventions:

```javascript
// ✅ Good: Use const for constants
const PORT = 8080;

// ✅ Good: Use let for variables that change
let userCount = 0;

// ❌ Bad: Avoid var
var oldStyle = true;

// ✅ Good: Use arrow functions for callbacks
app.get('/api/data', (req, res) => {
  res.json({ data: 'value' });
});

// ✅ Good: Use template literals
const message = `User ${username} logged in`;

// ❌ Bad: String concatenation
const message = 'User ' + username + ' logged in';

// ✅ Good: Use async/await for promises
async function fetchData() {
  try {
    const result = await db.query('SELECT * FROM users');
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ✅ Good: Destructuring
const { username, email } = req.body;

// ❌ Bad: Repetitive access
const username = req.body.username;
const email = req.body.email;
```

### HTML/CSS Standards

```html
<!-- ✅ Good: Semantic HTML -->
<nav class="navbar">
  <ul class="nav-links">
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

<!-- ✅ Good: Accessibility attributes -->
<input type="text" id="search" aria-label="Search tools" placeholder="Search...">

<!-- ✅ Good: Responsive classes -->
<div class="container responsive-grid">
  <div class="card">...</div>
</div>
```

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| HTML pages | kebab-case | `breach-data.html` |
| CSS files | kebab-case | `dashboard.css` |
| JS files | camelCase | `common.js` |
| Documentation | UPPERCASE | `README.md`, `CONTRIBUTING.md` |

### Code Comments

```javascript
// ✅ Good: Explain WHY, not WHAT
// Rate limit login attempts to prevent brute force attacks
const MAX_LOGIN_ATTEMPTS = 5;

// ✅ Good: Document complex logic
/**
 * Generate JWT token for authenticated user
 * @param {Object} user - User object from database
 * @returns {string} JWT token valid for 30 minutes
 */
function generateToken(user) {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30m' });
}

// ❌ Bad: Obvious comments
// Set port to 8080
const PORT = 8080;
```

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `security` | Security improvements |

### Examples

```bash
# Feature
git commit -m "feat(auth): add email OTP verification"

# Bug fix
git commit -m "fix(login): resolve session timeout issue"

# Documentation
git commit -m "docs(readme): add installation instructions"

# Security
git commit -m "security(auth): implement rate limiting on login"

# With body
git commit -m "feat(osint): add new blockchain analysis tools

Added 5 new blockchain investigation tools:
- Chainalysis
- Elliptic
- CipherTrace
- BlockExplorer
- Etherscan

Closes #42"
```

### Commit Best Practices

- ✅ Write commits in present tense ("Add feature" not "Added feature")
- ✅ Keep subject line under 50 characters
- ✅ Reference issue numbers when applicable
- ✅ One logical change per commit
- ❌ Don't commit sensitive data (passwords, API keys)
- ❌ Don't commit node_modules or .env files

---

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] Self-reviewed the code changes
- [ ] Added/updated documentation if needed
- [ ] Tested changes locally
- [ ] No sensitive data in commits
- [ ] Branch is up to date with `master`

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Security improvement
- [ ] Other (describe):

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
Describe how you tested the changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Tested on multiple browsers (if UI change)

## Related Issues
Closes #issue_number
```

### Review Process

1. **Automated Checks** - Ensure all checks pass
2. **Code Review** - Wait for maintainer review
3. **Address Feedback** - Make requested changes
4. **Approval** - Get approval from maintainer
5. **Merge** - Maintainer merges the PR

---

## Issue Guidelines

### Bug Reports

Use this template:

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node Version: [e.g., 18.17.0]

## Additional Context
Any other relevant information
```

### Feature Requests

Use this template:

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should it work?

## Alternatives Considered
Other solutions you've considered

## Additional Context
Any other relevant information
```

### Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature request |
| `documentation` | Documentation improvements |
| `security` | Security-related issues |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `wontfix` | Won't be worked on |
| `duplicate` | Already exists |

---

## Security Vulnerabilities

### Reporting Security Issues

⚠️ **Do NOT report security vulnerabilities through public GitHub issues.**

For security vulnerabilities, please:

1. **Email** the maintainers directly
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

3. **Wait** for acknowledgment (within 48 hours)
4. **Coordinate** disclosure timeline

### Security Best Practices

When contributing, ensure:

- [ ] No hardcoded credentials
- [ ] No sensitive data in logs
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection where applicable
- [ ] Secure cookie settings

---

## Recognition

Contributors will be recognized in:

- GitHub Contributors list
- README.md (for significant contributions)
- Release notes

---

## Questions?

If you have questions:

1. Check existing documentation
2. Search existing issues
3. Create a new issue with the `question` label

---

## Thank You! 🙏

Your contributions help make this tool better for law enforcement officers across Andhra Pradesh. Every contribution, no matter how small, is valued and appreciated.

---

**Document End**
