# InaLogystics Deployment Guide

This guide covers deploying the InaLogystics application to a production virtual server.

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 22.04 LTS or newer (recommended)
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **CPU**: 2 cores minimum
- **Storage**: 20GB minimum
- **Node.js**: Version 18.x or newer
- **PostgreSQL**: Version 14 or newer
- **Nginx**: Latest stable version (for reverse proxy)

### Required Software
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

## Server Setup

### 1. Create Application User
```bash
# Create a dedicated user for the application
sudo useradd -m -s /bin/bash inalogystics
sudo usermod -aG sudo inalogystics

# Switch to the application user
sudo su - inalogystics
```

### 2. Clone Repository
```bash
# Create application directory
mkdir -p ~/apps
cd ~/apps

# Clone the repository
git clone https://github.com/inalogy/inalogystics.git
cd inalogystics

# Install dependencies
npm ci --production=false
```

### 3. Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE inalogystics;
CREATE USER inalogystics_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE inalogystics TO inalogystics_user;
\q
```

### 4. Environment Configuration

Create a `.env` file in the application root:

```bash
# Copy example and edit
cp .env.example .env
nano .env
```

Configure the following variables:

```env
# Database
DATABASE_URL="postgresql://inalogystics_user:your_secure_password_here@localhost:5432/inalogystics"

# Application
NODE_ENV=production
PORT=3002

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_generated_secret_here
AUTH_SECRET=your_generated_secret_here

# Microsoft Entra ID (Azure AD)
AZURE_AD_CLIENT_ID=your_client_id
AZURE_AD_CLIENT_SECRET=your_client_secret
AZURE_AD_TENANT_ID=your_tenant_id

# Optional: Firebase Cloud Messaging for push notifications
NEXT_PUBLIC_FCM_VAPID_KEY=your_vapid_key
FCM_SERVER_KEY=your_server_key
```

### 5. Database Migration

Run Prisma migrations to set up the database schema:

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate:deploy

# Seed initial data (desks, parking spaces)
npm run db:seed
```

### 6. Build Application

```bash
# Build for production
npm run build
```

## Deployment Options

### Option A: PM2 (Recommended)

PM2 is a production process manager with built-in load balancing, monitoring, and automatic restarts.

```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Generate startup script (run on system boot)
pm2 startup systemd
# Copy and run the command that PM2 outputs

# Monitor application
pm2 status
pm2 logs inalogystics
pm2 monit
```

### Option B: Systemd Service

If you prefer systemd over PM2:

```bash
# Copy service file
sudo cp deployment/inalogystics.service /etc/systemd/system/

# Edit service file with correct paths
sudo nano /etc/systemd/system/inalogystics.service

# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable inalogystics

# Start service
sudo systemctl start inalogystics

# Check status
sudo systemctl status inalogystics

# View logs
sudo journalctl -u inalogystics -f
```

## Nginx Reverse Proxy

Configure Nginx to serve the application over HTTPS:

```bash
# Copy Nginx configuration
sudo cp deployment/nginx.conf /etc/nginx/sites-available/inalogystics

# Edit configuration with your domain
sudo nano /etc/nginx/sites-available/inalogystics

# Enable site
sudo ln -s /etc/nginx/sites-available/inalogystics /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
# Test renewal with:
sudo certbot renew --dry-run
```

## Deployment Script

Use the provided deployment script for updates:

```bash
# Make deployment script executable
chmod +x deployment/deploy.sh

# Run deployment
./deployment/deploy.sh
```

## Database Migrations

When deploying database changes:

```bash
# Create a new migration (development)
npm run db:migrate:create

# Apply migrations to production
npm run db:migrate:deploy

# Check migration status
npm run db:migrate:status
```

## Monitoring & Maintenance

### Application Logs

**PM2:**
```bash
pm2 logs inalogystics
pm2 logs inalogystics --lines 100
```

**Systemd:**
```bash
sudo journalctl -u inalogystics -f
sudo journalctl -u inalogystics --since "1 hour ago"
```

### Database Backup

```bash
# Create backup script
chmod +x deployment/backup-db.sh

# Run backup manually
./deployment/backup-db.sh

# Schedule automatic backups with cron
crontab -e
# Add: 0 2 * * * /home/inalogystics/apps/inalogystics/deployment/backup-db.sh
```

### Health Checks

The application exposes a health check endpoint:
```bash
curl http://localhost:3002/api/health
```

Set up monitoring with tools like:
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Application monitoring**: PM2 Plus, New Relic
- **Log aggregation**: Papertrail, Loggly

## Security Checklist

- [ ] PostgreSQL user has strong password
- [ ] `.env` file has correct permissions (600)
- [ ] Firewall configured (UFW): Only ports 22, 80, 443 open
- [ ] PostgreSQL only accepts local connections
- [ ] Nginx SSL configured with strong ciphers
- [ ] Regular security updates scheduled
- [ ] Application runs as non-root user
- [ ] NEXTAUTH_SECRET is cryptographically secure
- [ ] Azure AD redirect URIs properly configured

## Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs inalogystics --err

# Check if port is already in use
sudo lsof -i :3002

# Verify environment variables
pm2 env 0
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -U inalogystics_user -d inalogystics -h localhost

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Reload configuration
sudo systemctl reload nginx
```

## Rollback Procedure

If a deployment fails:

```bash
# Stop application
pm2 stop inalogystics

# Checkout previous version
git log --oneline
git checkout <previous-commit-hash>

# Restore dependencies
npm ci

# Rebuild
npm run build

# Rollback database if needed
npm run db:migrate:rollback

# Restart application
pm2 restart inalogystics
```

## Performance Optimization

### Enable PM2 Cluster Mode

```bash
# Edit ecosystem.config.js
# Set instances to "max" or specific number

# Restart in cluster mode
pm2 reload ecosystem.config.js
```

### Database Performance

```bash
# Create indices on frequently queried columns
# This is handled by Prisma schema, but monitor slow queries

# Connection pooling is configured in Prisma
# Adjust in schema.prisma if needed
```

## Updates and Maintenance

### Regular Updates

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Run migrations
npm run db:migrate:deploy

# Rebuild application
npm run build

# Restart with zero downtime (PM2)
pm2 reload inalogystics
```

### Scheduled Maintenance

- **Daily**: Automated database backups
- **Weekly**: Review application logs for errors
- **Monthly**: System security updates
- **Quarterly**: Review and optimize database performance

## Support

For issues or questions:
- Check logs first (application and database)
- Review this documentation
- Consult CLAUDE.md for codebase guidance
- Check GitHub repository for updates

---

**Last Updated**: 2026-01-02
**Version**: 1.0.0
