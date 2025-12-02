# 🛠️ Software Installers

Seyfo provides easy installation commands for popular server software on Ubuntu/Debian systems.

## Available Software

| Software | Description | Default Version |
|----------|-------------|-----------------|
| MongoDB | NoSQL database | 7.0 |
| Docker | Container platform | Latest |
| Cloudron | Self-hosted app platform | Latest |
| Nginx | Web server & reverse proxy | Latest |
| PostgreSQL | Relational database | 16 |
| Redis | In-memory data store | Latest |
| Certbot | Let's Encrypt SSL | Latest |

---

## MongoDB

NoSQL document database for modern applications.

### Install

```bash
# Interactive installation
seyfo install mongodb

# Non-interactive
seyfo install mongodb -y

# Specific version
seyfo install mongodb --version 6.0
```

### Post-Installation

```bash
# Check status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Enable on boot
sudo systemctl enable mongod

# Connect to MongoDB
mongosh
```

### Uninstall

```bash
seyfo uninstall mongodb
seyfo uninstall mongodb -y  # Skip confirmation
```

---

## Docker

Container platform for building and running applications.

### Install

```bash
seyfo install docker -y
```

### Post-Installation

```bash
# Add user to docker group (logout required)
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker run hello-world

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### Uninstall

```bash
seyfo uninstall docker
```

---

## Cloudron

Self-hosted platform for running web applications.

### Install

```bash
seyfo install cloudron -y
```

### Post-Installation

After installation, access Cloudron setup at:
```
https://your-server-ip
```

### Requirements

- Minimum 2GB RAM
- 20GB disk space
- Domain name (recommended)

### Uninstall

```bash
seyfo uninstall cloudron
```

---

## Nginx

High-performance web server and reverse proxy.

### Install

```bash
seyfo install nginx -y
```

### Post-Installation

```bash
# Check status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Default web root
/var/www/html/

# Configuration files
/etc/nginx/nginx.conf
/etc/nginx/sites-available/
/etc/nginx/sites-enabled/
```

### Basic Configuration

Create a new site:

```bash
sudo nano /etc/nginx/sites-available/mysite
```

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/mysite;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Uninstall

```bash
seyfo uninstall nginx
```

---

## PostgreSQL

Powerful, open-source relational database.

### Install

```bash
# Latest version (16)
seyfo install postgresql -y

# Specific version
seyfo install postgresql --version 15
```

### Post-Installation

```bash
# Switch to postgres user
sudo -i -u postgres

# Create database
createdb mydb

# Create user
createuser myuser

# Access psql
psql

# Inside psql
ALTER USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;
\q
```

### Connect to Database

```bash
psql -U myuser -d mydb -h localhost
```

### Uninstall

```bash
seyfo uninstall postgresql
```

---

## Redis

In-memory data structure store.

### Install

```bash
seyfo install redis -y
```

### Post-Installation

```bash
# Check status
sudo systemctl status redis

# Test connection
redis-cli ping
# Should return: PONG

# Access Redis CLI
redis-cli

# Set a key
SET mykey "Hello"
GET mykey
```

### Configuration

```bash
# Edit config
sudo nano /etc/redis/redis.conf

# Set password (requirepass)
requirepass your_password

# Restart
sudo systemctl restart redis
```

### Uninstall

```bash
seyfo uninstall redis
```

---

## Certbot

Let's Encrypt SSL certificate automation.

### Install

```bash
seyfo install certbot -y
```

### Get SSL Certificate

For Nginx:

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

For Apache:

```bash
sudo certbot --apache -d example.com
```

Standalone (no web server):

```bash
sudo certbot certonly --standalone -d example.com
```

### Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

### Manual Renewal

```bash
sudo certbot renew
```

### Uninstall

```bash
seyfo uninstall certbot
```

---

## Command Reference

### List Available Software

```bash
seyfo list
```

### Get Software Info

```bash
seyfo info <software>
seyfo info mongodb
seyfo info docker
```

### Install Options

| Option | Description |
|--------|-------------|
| `-y, --yes` | Skip confirmation prompts |
| `-v, --verbose` | Show detailed output |
| `--dry-run` | Show commands without executing |
| `--version <ver>` | Install specific version |

### Examples

```bash
# Dry run to see what will be executed
seyfo install docker --dry-run

# Verbose installation
seyfo install nginx -y -v

# Install specific version
seyfo install mongodb --version 6.0 -y
```

---

## Interactive Setup

Install multiple software at once:

```bash
seyfo setup
```

This opens an interactive menu where you can select multiple items to install.
