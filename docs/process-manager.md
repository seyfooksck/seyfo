# 🚀 Process Manager

Seyfo includes a PM2-like process manager for running and managing Node.js applications in the background.

## Overview

The process manager allows you to:
- Run applications as background daemons
- Auto-restart on crashes
- View real-time logs
- Monitor process status
- Manage multiple applications

---

## Quick Start

```bash
# Start an application
seyfo start app.js --name my-app

# Check status
seyfo ps

# View logs
seyfo logs my-app

# Stop the application
seyfo stop my-app
```

---

## Commands

### start

Start an application as a background process.

```bash
seyfo start <script> [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `-n, --name <name>` | Set process name |
| `-c, --cwd <path>` | Set working directory |
| `-i, --interpreter <path>` | Set interpreter (default: node) |

**Examples:**

```bash
# Basic start
seyfo start app.js

# With custom name
seyfo start app.js --name api-server

# With working directory
seyfo start server.js --name web --cwd /var/www/myapp

# With arguments (use -- to separate)
seyfo start app.js --name api -- --port 3000 --env production

# With custom interpreter
seyfo start script.py --name py-worker --interpreter python3
```

---

### stop

Stop a running process.

```bash
seyfo stop <name>
```

**Examples:**

```bash
seyfo stop my-app
seyfo stop api-server
```

---

### restart

Restart a process.

```bash
seyfo restart <name>
```

**Examples:**

```bash
seyfo restart my-app
```

---

### stop-all

Stop all running processes.

```bash
seyfo stop-all
```

---

### delete

Remove a process from the list.

```bash
seyfo delete <name>
```

**Note:** This stops the process if running and removes it from the process list.

---

### ps / status

List all processes and their status.

```bash
seyfo ps
# or
seyfo status
```

**Output:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ id │ name      │ status  │ pid   │ uptime │ restarts │ cpu │ memory        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 0  │ api       │ online  │ 12345 │ 2h     │ 0        │ 1%  │ 45.2 MB       │
│ 1  │ worker    │ online  │ 12346 │ 1h 30m │ 1        │ 2%  │ 32.1 MB       │
│ 2  │ scheduler │ stopped │ -     │ -      │ 0        │ -   │ -             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Status Values:**

| Status | Description |
|--------|-------------|
| `online` | Process is running |
| `stopped` | Process is not running |
| `errored` | Process crashed |

---

### describe

Show detailed information about a process.

```bash
seyfo describe <name>
```

**Output includes:**

- Process ID (PID)
- Script path
- Working directory
- Status
- Uptime
- Restart count
- Memory usage
- CPU usage
- Log file paths
- Start time

---

### logs

View process logs.

```bash
seyfo logs <name> [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `-f, --follow` | Follow log output (like `tail -f`) |
| `-l, --lines <n>` | Number of lines to show (default: 50) |
| `-e, --error` | Show only error logs |

**Examples:**

```bash
# View last 50 lines
seyfo logs my-app

# Follow logs in real-time
seyfo logs my-app -f

# Show last 100 lines
seyfo logs my-app --lines 100

# Show only errors
seyfo logs my-app -e

# Follow error logs
seyfo logs my-app -e -f
```

---

### flush

Clear log files.

```bash
# Clear all logs
seyfo flush

# Clear specific process logs
seyfo flush <name>
```

**Examples:**

```bash
seyfo flush           # Clear all logs
seyfo flush my-app    # Clear only my-app logs
```

---

### startfile

Start processes from an ecosystem configuration file.

```bash
seyfo startfile <config-file>
```

**Examples:**

```bash
seyfo startfile ecosystem.config.js
seyfo startfile seyfo.config.js
```

---

### pm-info

Display process manager information and data directories.

```bash
seyfo pm-info
```

**Output:**

```
Seyfo Process Manager Info:

  Data Directory: /home/user/.seyfo
  Logs Directory: /home/user/.seyfo/logs
  PIDs Directory: /home/user/.seyfo/pids
  Process Count:  3
```

---

## Ecosystem File

Manage multiple applications with a configuration file.

### File Format

Create  `seyfo.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'api-server',
      script: './src/server.js',
      cwd: '/var/www/api',
      args: ['--port', '3000']
    },
    {
      name: 'worker',
      script: './src/worker.js',
      cwd: '/var/www/api'
    },
    {
      name: 'scheduler',
      script: './src/cron.js',
      interpreter: 'node'
    }
  ]
};
```

### App Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `name` | string | Process name (required) |
| `script` | string | Script path (required) |
| `cwd` | string | Working directory |
| `args` | array | Command line arguments |
| `interpreter` | string | Interpreter to use |

### Start from File

```bash
seyfo startfile ecosystem.config.js
```

This will start all apps defined in the configuration.

---

## Data Storage

Process manager stores data in the following location:

| Platform | Path |
|----------|------|
| Linux/macOS | `~/.seyfo/` |
| Windows | `%USERPROFILE%\.seyfo\` |

### Directory Structure

```
~/.seyfo/
├── processes.json    # Process registry
├── pids/             # PID files
│   ├── api.pid
│   └── worker.pid
└── logs/             # Log files
    ├── api.log
    ├── api-error.log
    ├── worker.log
    └── worker-error.log
```

### processes.json Format

```json
{
  "api": {
    "name": "api",
    "script": "/var/www/api/server.js",
    "cwd": "/var/www/api",
    "pid": 12345,
    "status": "online",
    "restarts": 0,
    "startedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Programmatic Usage

Use the process manager in your Node.js code:

```javascript
const { pm } = require('seyfo');

// Start a process
await pm.start({
  script: './app.js',
  name: 'my-app',
  cwd: '/var/www/myapp',
  args: ['--port', '3000']
});

// List all processes
const processes = await pm.list();
console.log(processes);

// Get process details
const info = await pm.describe('my-app');
console.log(info);

// Get logs
const logs = await pm.logs('my-app', { lines: 100 });
console.log(logs);

// Stop a process
await pm.stop('my-app');

// Restart a process
await pm.restart('my-app');

// Remove a process
await pm.remove('my-app');

// Stop all processes
await pm.stopAll();

// Clear logs
await pm.flushLogs('my-app');  // Specific process
await pm.flushLogs();          // All processes

// Start from config file
await pm.startFromConfig('./ecosystem.config.js');
```

---

## Best Practices

### Naming Conventions

Use descriptive names for your processes:

```bash
# Good
seyfo start server.js --name api-production
seyfo start worker.js --name email-worker

# Avoid
seyfo start server.js --name app1
seyfo start worker.js --name w
```

### Log Management

Regularly flush old logs to save disk space:

```bash
# Set up a cron job
0 0 * * 0 seyfo flush  # Weekly log cleanup
```

### Monitoring

Check process status regularly:

```bash
# Quick status check
seyfo ps

# Detailed info
seyfo describe api-server
```

### Production Setup

For production environments:

1. Use ecosystem files for consistent deployments
2. Set proper working directories
3. Monitor logs for errors
4. Set up log rotation

---

## Troubleshooting

### Process Won't Start

1. Check if the script path is correct
2. Verify Node.js is installed
3. Check for syntax errors in your script
4. Look at error logs: `seyfo logs <name> -e`

### Process Keeps Restarting

1. Check error logs for crash reasons
2. Verify all dependencies are installed
3. Check for memory leaks

### Logs Not Showing

1. Make sure the process has been started at least once
2. Check log directory permissions
3. Verify log files exist: `seyfo pm-info`

### Can't Stop Process

1. Try using `seyfo delete <name>` instead
2. Manually kill the process: `kill <pid>`
3. Check `seyfo describe <name>` for the PID
