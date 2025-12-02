# 📖 CLI Reference

Complete command reference for the Seyfo CLI.

## Global Options

These options work with all commands:

| Option | Description |
|--------|-------------|
| `-V, --version` | Show version number |
| `-h, --help` | Show help |

## Commands Overview

```bash
seyfo <command> [options] [arguments]
```

| Category | Commands |
|----------|----------|
| Software | `list`, `info`, `install`, `uninstall`, `setup` |
| System | `system` |
| Process Manager | `start`, `stop`, `restart`, `stop-all`, `delete`, `ps`, `status`, `describe`, `logs`, `flush`, `startfile`, `pm-info` |

---

## Software Installation Commands

### list

List all available software that can be installed.

```bash
seyfo list
```

**Output:**
```
Available Software:
┌──────────────┬─────────────────────────────────────┬─────────┐
│ Name         │ Description                         │ Version │
├──────────────┼─────────────────────────────────────┼─────────┤
│ mongodb      │ NoSQL database                      │ 7.0     │
│ docker       │ Container platform                  │ latest  │
│ cloudron     │ Self-hosted app platform            │ latest  │
│ nginx        │ Web server & reverse proxy          │ latest  │
│ postgresql   │ Relational database                 │ 16      │
│ redis        │ In-memory data store                │ latest  │
│ certbot      │ Let's Encrypt SSL                   │ latest  │
└──────────────┴─────────────────────────────────────┴─────────┘
```

---

### info

Show detailed information about a software package.

```bash
seyfo info <software>
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `software` | Name of the software (mongodb, docker, etc.) |

**Example:**

```bash
seyfo info mongodb
```

**Output:**
```
MongoDB

Description: NoSQL database system
Version: 7.0

Installation Commands:
  1. Import GPG key
  2. Add repository
  3. Update package list
  4. Install mongodb-org

Post-Installation:
  Start: sudo systemctl start mongod
  Enable: sudo systemctl enable mongod
  Connect: mongosh
```

---

### install

Install a software package.

```bash
seyfo install <software> [options]
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `software` | Name of the software to install |

**Options:**

| Option | Short | Description |
|--------|-------|-------------|
| `--yes` | `-y` | Skip confirmation prompt |
| `--verbose` | `-v` | Show detailed output |
| `--dry-run` | | Show commands without executing |
| `--version <ver>` | | Install specific version |

**Examples:**

```bash
# Interactive installation
seyfo install mongodb

# Skip confirmation
seyfo install docker -y

# With verbose output
seyfo install nginx -y -v

# Dry run (preview commands)
seyfo install postgresql --dry-run

# Specific version
seyfo install mongodb --version 6.0 -y
```

---

### uninstall

Remove an installed software package.

```bash
seyfo uninstall <software> [options]
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `software` | Name of the software to uninstall |

**Options:**

| Option | Short | Description |
|--------|-------|-------------|
| `--yes` | `-y` | Skip confirmation prompt |
| `--verbose` | `-v` | Show detailed output |

**Examples:**

```bash
seyfo uninstall mongodb
seyfo uninstall docker -y
```

---

### setup

Interactive setup wizard for installing multiple software.

```bash
seyfo setup
```

This command opens an interactive menu where you can select multiple software packages to install at once.

**Example interaction:**
```
? Select software to install: (Press <space> to select, <a> to toggle all)
 ◉ MongoDB
 ◯ Docker
 ◉ Node.js
 ◯ Nginx
 ◉ Redis
```

---

## System Commands

### system

Display system information.

```bash
seyfo system
```

**Output includes:**
- Operating System
- Hostname
- Kernel version
- Architecture
- CPU info
- Memory (total, used, free)
- Disk usage
- Uptime
- Current user

---

## Process Manager Commands

### start

Start an application as a background process.

```bash
seyfo start <script> [options] [-- args...]
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `script` | Path to the script to run |
| `args...` | Arguments to pass to the script (after `--`) |

**Options:**

| Option | Short | Description |
|--------|-------|-------------|
| `--name <name>` | `-n` | Set process name |
| `--cwd <path>` | `-c` | Set working directory |
| `--interpreter <path>` | `-i` | Set interpreter (default: node) |

**Examples:**

```bash
seyfo start app.js
seyfo start app.js --name my-app
seyfo start server.js -n api -c /var/www/api
seyfo start app.js --name api -- --port 3000 --env prod
```

---

### stop

Stop a running process.

```bash
seyfo stop <name>
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `name` | Process name |

---

### restart

Restart a process.

```bash
seyfo restart <name>
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `name` | Process name |

---

### stop-all

Stop all running processes.

```bash
seyfo stop-all
```

---

### delete

Remove a process from the list (stops if running).

```bash
seyfo delete <name>
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `name` | Process name |

---

### ps / status

List all processes.

```bash
seyfo ps
seyfo status
```

Both commands do the same thing.

---

### describe

Show detailed information about a process.

```bash
seyfo describe <name>
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `name` | Process name |

---

### logs

View process logs.

```bash
seyfo logs <name> [options]
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `name` | Process name |

**Options:**

| Option | Short | Description |
|--------|-------|-------------|
| `--follow` | `-f` | Follow log output in real-time |
| `--lines <n>` | `-l` | Number of lines to show (default: 50) |
| `--error` | `-e` | Show only error logs |

**Examples:**

```bash
seyfo logs my-app
seyfo logs my-app -f
seyfo logs my-app --lines 100
seyfo logs my-app -e -f
```

---

### flush

Clear log files.

```bash
seyfo flush [name]
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `name` | Process name (optional, clears all if omitted) |

**Examples:**

```bash
seyfo flush          # Clear all logs
seyfo flush my-app   # Clear only my-app logs
```

---

### startfile

Start processes from an ecosystem configuration file.

```bash
seyfo startfile <config>
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `config` | Path to ecosystem config file |

**Example:**

```bash
seyfo startfile ecosystem.config.js
```

---

### pm-info

Display process manager information.

```bash
seyfo pm-info
```

---

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 126 | Permission denied |
| 127 | Command not found |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SEYFO_HOME` | Override default data directory |
| `NODE_ENV` | Environment (development/production) |

---

## Examples

### Full Stack Setup

```bash
# Install everything needed for a web app
seyfo install mongodb -y
seyfo install nginx -y
seyfo install redis -y
seyfo install certbot -y

# Start your application
seyfo start server.js --name my-api

# Check it's running
seyfo ps
```

### Docker Development Environment

```bash
# Install Docker
seyfo install docker -y

# Add yourself to docker group
sudo usermod -aG docker $USER

# Log out and back in, then verify
docker run hello-world
```

### Managing Multiple Apps

```bash
# Start multiple apps
seyfo start api/server.js --name api
seyfo start worker/index.js --name worker
seyfo start cron/scheduler.js --name scheduler

# Check all
seyfo ps

# View specific logs
seyfo logs api -f

# Restart one
seyfo restart worker

# Stop all
seyfo stop-all
```
