# 🔌 API Reference

Use Seyfo as a module in your Node.js applications.

## Installation

```bash
npm install seyfo
```

## Quick Start

```javascript
const seyfo = require('seyfo');

// List available software
const software = seyfo.getAvailableSoftware();

// Get specific installer
const mongoInstaller = seyfo.getInstaller('mongodb');

// Use process manager
const { pm } = seyfo;
await pm.start({ script: './app.js', name: 'my-app' });
```

---

## Module Exports

```javascript
const seyfo = require('seyfo');

// Available exports:
// seyfo.getAvailableSoftware()
// seyfo.getInstaller(name)
// seyfo.getVersion()
// seyfo.getAllInstallers()
// seyfo.installers
// seyfo.pm
```

---

## Software Installation API

### getAvailableSoftware()

Returns an array of available software names.

```javascript
const seyfo = require('seyfo');

const software = seyfo.getAvailableSoftware();
console.log(software);
// ['mongodb', 'docker', 'cloudron', 'nginx', 'postgresql', 'redis', 'certbot']
```

**Returns:** `string[]` - Array of software names

---

### getInstaller(name)

Get the installer module for a specific software.

```javascript
const seyfo = require('seyfo');

const mongoInstaller = seyfo.getInstaller('mongodb');
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Software name |

**Returns:** `Installer | null` - Installer object or null if not found

---

### getAllInstallers()

Get all installer modules.

```javascript
const seyfo = require('seyfo');

const allInstallers = seyfo.getAllInstallers();
// Returns object with all installers keyed by name
```

**Returns:** `Object` - All installers

---

### getVersion()

Get Seyfo version.

```javascript
const seyfo = require('seyfo');

const version = seyfo.getVersion();
console.log(version); // '1.2.0'
```

**Returns:** `string` - Version string

---

## Installer Object

Each installer has the following methods:

### Properties

```javascript
const installer = seyfo.getInstaller('mongodb');

console.log(installer.name);        // 'MongoDB'
console.log(installer.description); // 'NoSQL database system'
console.log(installer.version);     // '7.0'
```

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Display name |
| `description` | string | Description |
| `version` | string | Default version |

---

### getInstallCommands(options)

Get installation commands.

```javascript
const installer = seyfo.getInstaller('mongodb');
const commands = installer.getInstallCommands({ version: '6.0' });

console.log(commands);
// [
//   { title: 'Import GPG key', command: 'wget -qO - https://...' },
//   { title: 'Add repository', command: 'echo "deb..."' },
//   { title: 'Update packages', command: 'sudo apt update' },
//   { title: 'Install MongoDB', command: 'sudo apt install -y mongodb-org' }
// ]
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | object | Installation options |
| `options.version` | string | Version to install |

**Returns:** `Array<{title: string, command: string}>` - Installation commands

---

### getPostInstallInfo()

Get post-installation information.

```javascript
const installer = seyfo.getInstaller('mongodb');
const info = installer.getPostInstallInfo();

console.log(info);
// 'MongoDB installed! Start with: sudo systemctl start mongod'
```

**Returns:** `string` - Post-installation instructions

---

### getUninstallCommands()

Get uninstallation commands.

```javascript
const installer = seyfo.getInstaller('mongodb');
const commands = installer.getUninstallCommands();

console.log(commands);
// [
//   { title: 'Stop service', command: 'sudo systemctl stop mongod' },
//   { title: 'Remove packages', command: 'sudo apt purge -y mongodb-org*' }
// ]
```

**Returns:** `Array<{title: string, command: string}>` - Uninstall commands

---

## Process Manager API

### pm.start(options)

Start a new process.

```javascript
const { pm } = require('seyfo');

await pm.start({
  script: './server.js',
  name: 'api-server',
  cwd: '/var/www/api',
  args: ['--port', '3000'],
  interpreter: 'node'
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options.script` | string | Yes | Path to script |
| `options.name` | string | No | Process name (defaults to filename) |
| `options.cwd` | string | No | Working directory |
| `options.args` | string[] | No | Script arguments |
| `options.interpreter` | string | No | Interpreter (default: 'node') |

**Returns:** `Promise<ProcessInfo>` - Started process info

---

### pm.stop(name)

Stop a running process.

```javascript
const { pm } = require('seyfo');

await pm.stop('api-server');
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Process name |

**Returns:** `Promise<void>`

---

### pm.restart(name)

Restart a process.

```javascript
const { pm } = require('seyfo');

await pm.restart('api-server');
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Process name |

**Returns:** `Promise<ProcessInfo>` - Restarted process info

---

### pm.stopAll()

Stop all running processes.

```javascript
const { pm } = require('seyfo');

await pm.stopAll();
```

**Returns:** `Promise<void>`

---

### pm.remove(name)

Remove a process from the list.

```javascript
const { pm } = require('seyfo');

await pm.remove('api-server');
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Process name |

**Returns:** `Promise<void>`

---

### pm.list()

Get all processes.

```javascript
const { pm } = require('seyfo');

const processes = await pm.list();
console.log(processes);
// [
//   {
//     name: 'api-server',
//     status: 'online',
//     pid: 12345,
//     uptime: '2h 30m',
//     restarts: 0,
//     memory: '45.2 MB',
//     cpu: '1%'
//   }
// ]
```

**Returns:** `Promise<ProcessInfo[]>` - Array of process info

---

### pm.describe(name)

Get detailed process information.

```javascript
const { pm } = require('seyfo');

const info = await pm.describe('api-server');
console.log(info);
// {
//   name: 'api-server',
//   script: '/var/www/api/server.js',
//   cwd: '/var/www/api',
//   pid: 12345,
//   status: 'online',
//   uptime: '2h 30m',
//   restarts: 0,
//   memory: '45.2 MB',
//   cpu: '1%',
//   startedAt: '2024-01-15T10:30:00.000Z',
//   logFile: '/home/user/.seyfo/logs/api-server.log',
//   errorLogFile: '/home/user/.seyfo/logs/api-server-error.log'
// }
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Process name |

**Returns:** `Promise<ProcessDetails>` - Detailed process info

---

### pm.logs(name, options)

Get process logs.

```javascript
const { pm } = require('seyfo');

// Get last 50 lines
const logs = await pm.logs('api-server');

// Get last 100 lines
const logs = await pm.logs('api-server', { lines: 100 });

// Get error logs only
const errorLogs = await pm.logs('api-server', { error: true });
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Process name |
| `options.lines` | number | Number of lines (default: 50) |
| `options.error` | boolean | Get error logs only |

**Returns:** `Promise<string>` - Log content

---

### pm.flushLogs(name?)

Clear log files.

```javascript
const { pm } = require('seyfo');

// Clear specific process logs
await pm.flushLogs('api-server');

// Clear all logs
await pm.flushLogs();
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Process name (optional) |

**Returns:** `Promise<void>`

---

### pm.startFromConfig(configPath)

Start processes from ecosystem file.

```javascript
const { pm } = require('seyfo');

await pm.startFromConfig('./ecosystem.config.js');
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `configPath` | string | Path to config file |

**Returns:** `Promise<ProcessInfo[]>` - Started processes

---

## Type Definitions

### ProcessInfo

```typescript
interface ProcessInfo {
  name: string;
  status: 'online' | 'stopped' | 'errored';
  pid: number | null;
  uptime: string;
  restarts: number;
  memory: string;
  cpu: string;
}
```

### ProcessDetails

```typescript
interface ProcessDetails extends ProcessInfo {
  script: string;
  cwd: string;
  interpreter: string;
  args: string[];
  startedAt: string;
  logFile: string;
  errorLogFile: string;
}
```

### StartOptions

```typescript
interface StartOptions {
  script: string;
  name?: string;
  cwd?: string;
  args?: string[];
  interpreter?: string;
}
```

### EcosystemConfig

```typescript
interface EcosystemConfig {
  apps: StartOptions[];
}
```

---

## Example: Custom CLI Tool

Build your own CLI using Seyfo:

```javascript
#!/usr/bin/env node
const seyfo = require('seyfo');
const { pm } = seyfo;

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'deploy':
      console.log('Installing dependencies...');
      const docker = seyfo.getInstaller('docker');
      console.log(docker.getInstallCommands());
      break;

    case 'start':
      await pm.start({ script: arg, name: 'my-app' });
      console.log('App started!');
      break;

    case 'status':
      const processes = await pm.list();
      console.table(processes);
      break;

    default:
      console.log('Usage: mycli <deploy|start|status>');
  }
}

main().catch(console.error);
```

---

## Example: Express Middleware

Monitor your Express app:

```javascript
const express = require('express');
const { pm } = require('seyfo');

const app = express();

// Status endpoint
app.get('/status', async (req, res) => {
  const processes = await pm.list();
  res.json({ processes });
});

// Health check
app.get('/health', async (req, res) => {
  const info = await pm.describe('api-server');
  res.json({
    status: info.status,
    uptime: info.uptime,
    memory: info.memory
  });
});

app.listen(3000);
```
