#!/usr/bin/env node
/**
 * File Integrity Monitor for AP Police OSINT Portal
 * 
 * This script monitors critical files for unauthorized changes.
 * Run periodically via cron job to detect file tampering.
 * 
 * Usage:
 *   node security/file-integrity-check.js --init    # Generate initial hashes
 *   node security/file-integrity-check.js --check   # Check for modifications
 *   node security/file-integrity-check.js --update  # Update hashes after legitimate changes
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  hashFile: path.join(__dirname, '.file-hashes.json'),
  logFile: path.join(__dirname, 'integrity-log.txt'),
  
  // Critical files to monitor
  criticalFiles: [
    'server.js',
    'package.json',
    'package-lock.json',
    'public/index.html',
    'public/home.html',
    'public/common.js',
  ],
  
  // Directories to monitor (all files inside)
  criticalDirs: [
    'public',
  ],
  
  // File extensions to monitor
  monitorExtensions: ['.js', '.html', '.css', '.json'],
  
  // Files to exclude
  excludeFiles: [
    'visitor-data.json',
    'users.db',
    '.file-hashes.json',
    'integrity-log.txt',
    'node_modules',
  ]
};

// Calculate SHA-256 hash of a file
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

// Get all files to monitor
function getFilesToMonitor(baseDir) {
  const files = [];
  
  function walkDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.relative(baseDir, fullPath);
        
        // Skip excluded files/directories
        if (CONFIG.excludeFiles.some(ex => relativePath.includes(ex))) {
          continue;
        }
        
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          if (CONFIG.monitorExtensions.includes(ext)) {
            files.push(relativePath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  }
  
  walkDir(baseDir);
  return files;
}

// Log message with timestamp
function log(message, isAlert = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${isAlert ? '⚠️ ALERT: ' : ''}${message}\n`;
  
  console.log(logMessage.trim());
  
  try {
    fs.appendFileSync(CONFIG.logFile, logMessage);
  } catch (error) {
    console.error('Failed to write to log file');
  }
}

// Initialize hashes for all monitored files
function initializeHashes(baseDir) {
  log('Initializing file integrity hashes...');
  
  const files = getFilesToMonitor(baseDir);
  const hashes = {};
  
  for (const file of files) {
    const fullPath = path.join(baseDir, file);
    const hash = getFileHash(fullPath);
    if (hash) {
      hashes[file] = {
        hash: hash,
        size: fs.statSync(fullPath).size,
        modified: fs.statSync(fullPath).mtime.toISOString()
      };
    }
  }
  
  // Save hashes
  fs.writeFileSync(CONFIG.hashFile, JSON.stringify(hashes, null, 2));
  log(`Initialized hashes for ${Object.keys(hashes).length} files.`);
  console.log('Hash file saved to:', CONFIG.hashFile);
}

// Check files against stored hashes
function checkIntegrity(baseDir) {
  log('Starting file integrity check...');
  
  // Load stored hashes
  if (!fs.existsSync(CONFIG.hashFile)) {
    log('Hash file not found. Run with --init first.', true);
    process.exit(1);
  }
  
  const storedHashes = JSON.parse(fs.readFileSync(CONFIG.hashFile, 'utf8'));
  const currentFiles = getFilesToMonitor(baseDir);
  
  let modified = [];
  let added = [];
  let deleted = [];
  
  // Check for modified or deleted files
  for (const [file, data] of Object.entries(storedHashes)) {
    const fullPath = path.join(baseDir, file);
    
    if (!fs.existsSync(fullPath)) {
      deleted.push(file);
      log(`File DELETED: ${file}`, true);
    } else {
      const currentHash = getFileHash(fullPath);
      if (currentHash !== data.hash) {
        modified.push(file);
        log(`File MODIFIED: ${file}`, true);
        log(`  Old hash: ${data.hash}`);
        log(`  New hash: ${currentHash}`);
      }
    }
  }
  
  // Check for new files
  for (const file of currentFiles) {
    if (!storedHashes[file]) {
      added.push(file);
      log(`New file ADDED: ${file}`, true);
    }
  }
  
  // Summary
  console.log('\n========== INTEGRITY CHECK SUMMARY ==========');
  console.log(`Total files monitored: ${Object.keys(storedHashes).length}`);
  console.log(`Modified files: ${modified.length}`);
  console.log(`New files: ${added.length}`);
  console.log(`Deleted files: ${deleted.length}`);
  
  if (modified.length === 0 && added.length === 0 && deleted.length === 0) {
    log('✅ All files intact. No unauthorized modifications detected.');
    return true;
  } else {
    log('❌ File integrity check FAILED! Unauthorized changes detected.', true);
    
    if (modified.length > 0) {
      console.log('\nModified files:');
      modified.forEach(f => console.log(`  - ${f}`));
    }
    if (added.length > 0) {
      console.log('\nNew files:');
      added.forEach(f => console.log(`  - ${f}`));
    }
    if (deleted.length > 0) {
      console.log('\nDeleted files:');
      deleted.forEach(f => console.log(`  - ${f}`));
    }
    
    return false;
  }
}

// Update hashes after legitimate changes
function updateHashes(baseDir) {
  log('Updating file integrity hashes...');
  initializeHashes(baseDir);
  log('Hashes updated successfully.');
}

// Main
function main() {
  const args = process.argv.slice(2);
  const baseDir = path.join(__dirname, '..');
  
  if (args.includes('--init')) {
    initializeHashes(baseDir);
  } else if (args.includes('--check')) {
    const success = checkIntegrity(baseDir);
    process.exit(success ? 0 : 1);
  } else if (args.includes('--update')) {
    updateHashes(baseDir);
  } else {
    console.log(`
File Integrity Monitor for AP Police OSINT Portal

Usage:
  node security/file-integrity-check.js --init    Generate initial file hashes
  node security/file-integrity-check.js --check   Check for unauthorized modifications
  node security/file-integrity-check.js --update  Update hashes after legitimate changes

Recommended cron job (check every hour):
  0 * * * * cd /path/to/appoliceosint && node security/file-integrity-check.js --check
    `);
  }
}

main();
