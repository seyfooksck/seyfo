# 📥 Installation Guide

## Requirements

- **Node.js** 14.0.0 or higher
- **npm** 6.0.0 or higher
- **Operating System**: Ubuntu 20.04+, Debian 10+, or any Linux distribution (for software installers)
- **sudo privileges** (required for software installations)

## Global Installation (Recommended)

Install Seyfo globally to use it from anywhere:

```bash
npm install -g seyfo
```

After installation, verify it works:

```bash
seyfo --version
# Output: 1.2.0

seyfo --help
```

## Local Installation

For project-specific usage:

```bash
npm install seyfo
```

Then use with npx:

```bash
npx seyfo list
```

Or add to your package.json scripts:

```json
{
  "scripts": {
    "seyfo": "seyfo"
  }
}
```

## Update Seyfo

Update to the latest version:

```bash
npm update -g seyfo
```

## Uninstall

Remove Seyfo:

```bash
npm uninstall -g seyfo
```

## Verify Installation

Run these commands to verify everything is working:

```bash
# Check version
seyfo --version

# List available software
seyfo list

# Show system info
seyfo system

# Show PM info
seyfo pm-info
```

## Troubleshooting

### Permission Errors

If you get permission errors on Linux/macOS:

```bash
# Option 1: Use sudo
sudo npm install -g seyfo

# Option 2: Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g seyfo
```

### Command Not Found

If `seyfo` command is not found after installation:

```bash
# Check npm bin directory
npm bin -g

# Add to PATH if needed
export PATH=$(npm bin -g):$PATH
```

### Node.js Version

Check your Node.js version:

```bash
node --version
```

If it's below v14, upgrade Node.js:

```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or update via package manager
sudo apt update && sudo apt install -y nodejs
```
