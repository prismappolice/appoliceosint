# Security Configuration for AP Police OSINT Portal

## Server Hardening Guide

### 1. File Permissions (Linux)

```bash
# Set proper ownership
sudo chown -R www-data:www-data /path/to/appoliceosint

# Set directory permissions (755 = rwxr-xr-x)
find /path/to/appoliceosint -type d -exec chmod 755 {} \;

# Set file permissions (644 = rw-r--r--)
find /path/to/appoliceosint -type f -exec chmod 644 {} \;

# Make server.js executable
chmod 755 /path/to/appoliceosint/server.js

# Protect sensitive files (600 = rw-------)
chmod 600 /path/to/appoliceosint/.env
chmod 600 /path/to/appoliceosint/users.json
chmod 600 /path/to/appoliceosint/users.db

# Make node_modules read-only (prevents tampering)
chmod -R 555 /path/to/appoliceosint/node_modules
```

### 2. Firewall Configuration (UFW)

```bash
# Enable firewall
sudo ufw enable

# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Deny all other incoming traffic
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Check status
sudo ufw status verbose
```

### 3. Fail2Ban Configuration

Create `/etc/fail2ban/jail.local`:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[appolice-login]
enabled = true
port = http,https
filter = appolice-login
logpath = /path/to/appoliceosint/logs/access.log
maxretry = 5
bantime = 900
```

Create `/etc/fail2ban/filter.d/appolice-login.conf`:

```ini
[Definition]
failregex = ^<HOST> .* "POST /login.*" 401
ignoreregex =
```

### 4. Nginx Security Configuration

Add to `/etc/nginx/sites-available/appoliceosint`:

```nginx
server {
    listen 443 ssl http2;
    server_name appoliceosint.com www.appoliceosint.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/appoliceosint.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/appoliceosint.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # Security Headers (additional to Express)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Block common attack patterns
    location ~ /\. {
        deny all;
    }

    location ~* \.(git|env|sql|bak|old|backup)$ {
        deny all;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    location /login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:8080;
    }

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name appoliceosint.com www.appoliceosint.com;
    return 301 https://$server_name$request_uri;
}
```

### 5. Environment Variables Security

Update `.env` file:

```env
# Production settings
NODE_ENV=production

# Strong JWT secret (generate with: openssl rand -base64 64)
JWT_SECRET=your_very_long_random_secret_at_least_64_characters

# Session timeout (30 minutes)
SESSION_TIMEOUT=1800000

# Secure cookie settings
COOKIE_SECURE=true
COOKIE_HTTPONLY=true
COOKIE_SAMESITE=strict
```

### 6. Cron Jobs for Security

Add to crontab (`crontab -e`):

```bash
# File integrity check every hour
0 * * * * cd /path/to/appoliceosint && node security/file-integrity-check.js --check >> /var/log/integrity-check.log 2>&1

# Backup database daily at 2 AM
0 2 * * * cp /path/to/appoliceosint/users.db /path/to/backups/users_$(date +\%Y\%m\%d).db

# Clear old logs weekly
0 0 * * 0 find /path/to/appoliceosint/logs -name "*.log" -mtime +30 -delete

# Update npm packages monthly (first Sunday)
0 3 1-7 * 0 cd /path/to/appoliceosint && npm audit fix >> /var/log/npm-audit.log 2>&1
```

### 7. Log Monitoring

Create `/path/to/appoliceosint/security/log-monitor.sh`:

```bash
#!/bin/bash

LOG_FILE="/path/to/appoliceosint/logs/access.log"
ALERT_EMAIL="admin@appoliceosint.com"

# Check for suspicious patterns
SUSPICIOUS=$(grep -E "(union|select|insert|drop|delete|script|eval|exec)" $LOG_FILE | tail -20)

if [ ! -z "$SUSPICIOUS" ]; then
    echo "Suspicious activity detected:" | mail -s "ALERT: Suspicious Activity on OSINT Portal" $ALERT_EMAIL <<< "$SUSPICIOUS"
fi

# Check for brute force attempts
BRUTE_FORCE=$(grep "POST /login" $LOG_FILE | grep "401" | awk '{print $1}' | sort | uniq -c | awk '$1 > 10 {print}')

if [ ! -z "$BRUTE_FORCE" ]; then
    echo "Brute force attempts detected:" | mail -s "ALERT: Brute Force Attempt on OSINT Portal" $ALERT_EMAIL <<< "$BRUTE_FORCE"
fi
```

### 8. Database Security

```bash
# Encrypt database file at rest (using LUKS or similar)
# Or use SQLCipher for encrypted SQLite

# Restrict database file access
chmod 600 /path/to/appoliceosint/users.db
chown www-data:www-data /path/to/appoliceosint/users.db
```

### 9. PM2 Security Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'appoliceosint',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    // Auto-restart on crash
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000,
    // Memory limit
    max_memory_restart: '500M',
    // Log configuration
    log_file: './logs/combined.log',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### 10. Quick Security Checklist

- [ ] `.env` file has `600` permissions
- [ ] `NODE_ENV=production` is set
- [ ] Strong `JWT_SECRET` (64+ characters)
- [ ] SSL/HTTPS enabled
- [ ] Firewall configured (UFW)
- [ ] Fail2Ban installed and configured
- [ ] File integrity monitoring enabled
- [ ] Regular backups configured
- [ ] Nginx security headers added
- [ ] PM2 or similar process manager running
- [ ] Log monitoring active
- [ ] `/api/users` endpoint disabled in production
