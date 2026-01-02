# Deployment Files

This directory contains all files needed to deploy the InaLogystics application to a production server.

## Files Overview

### Scripts

#### `deploy.sh`
Main deployment script that automates the entire deployment process:
- Pulls latest code from Git
- Installs dependencies
- Runs database migrations
- Builds the application
- Restarts the service (PM2 or systemd)
- Performs health checks

**Usage:**
```bash
./deployment/deploy.sh
```

#### `backup-db.sh`
Creates a compressed backup of the PostgreSQL database:
- Uses `pg_dump` to create a binary backup
- Compresses with gzip
- Stores in `backups/` directory
- Automatically cleans up backups older than 30 days

**Usage:**
```bash
./deployment/backup-db.sh
```

**Cron Schedule (Daily at 2 AM):**
```bash
0 2 * * * /home/inalogystics/apps/inalogystics/deployment/backup-db.sh
```

#### `restore-db.sh`
Restores database from a backup file:
- Creates safety backup before restore
- Drops and recreates database
- Restores from specified backup

**Usage:**
```bash
./deployment/restore-db.sh backups/inalogystics_20260102_120000.sql.gz
```

**⚠️ Warning:** This will delete all existing data!

### Configuration Files

#### `inalogystics.service`
Systemd service file for running the application as a system service:
- Auto-restart on failure
- Runs as dedicated user
- Environment variable management
- Resource limits and security settings

**Installation:**
```bash
sudo cp deployment/inalogystics.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable inalogystics
sudo systemctl start inalogystics
```

**Management:**
```bash
sudo systemctl status inalogystics
sudo systemctl restart inalogystics
sudo systemctl stop inalogystics
sudo journalctl -u inalogystics -f
```

#### `ecosystem.config.js` (in project root)
PM2 configuration file for process management:
- Cluster mode support
- Auto-restart settings
- Memory limits
- Log management
- Deployment configuration

**Usage:**
```bash
pm2 start ecosystem.config.js
pm2 reload ecosystem.config.js
pm2 stop inalogystics
pm2 logs inalogystics
pm2 monit
```

#### `nginx.conf`
Nginx reverse proxy configuration:
- SSL/TLS termination
- Rate limiting
- Static file caching
- Security headers
- WebSocket support
- Gzip compression

**Installation:**
```bash
sudo cp deployment/nginx.conf /etc/nginx/sites-available/inalogystics
# Edit server_name in the file
sudo nano /etc/nginx/sites-available/inalogystics
sudo ln -s /etc/nginx/sites-available/inalogystics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**SSL Setup:**
```bash
sudo certbot --nginx -d your-domain.com
```

## Deployment Workflow

### Initial Deployment

1. **Prepare Server:**
   ```bash
   # Install required software
   sudo apt update
   sudo apt install -y nodejs npm postgresql nginx
   sudo npm install -g pm2
   ```

2. **Clone Repository:**
   ```bash
   git clone https://github.com/inalogy/inalogystics.git
   cd inalogystics
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

4. **Setup Database:**
   ```bash
   # Create PostgreSQL database and user
   sudo -u postgres psql
   # In psql:
   CREATE DATABASE inalogystics;
   CREATE USER inalogystics_user WITH ENCRYPTED PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE inalogystics TO inalogystics_user;
   \q
   ```

5. **Install & Build:**
   ```bash
   npm ci
   npm run db:generate
   npm run db:migrate:deploy
   npm run db:seed
   npm run build
   ```

6. **Start Application:**
   ```bash
   # Option A: PM2 (Recommended)
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup

   # Option B: Systemd
   sudo cp deployment/inalogystics.service /etc/systemd/system/
   sudo systemctl enable inalogystics
   sudo systemctl start inalogystics
   ```

7. **Configure Nginx:**
   ```bash
   sudo cp deployment/nginx.conf /etc/nginx/sites-available/inalogystics
   sudo nano /etc/nginx/sites-available/inalogystics  # Update server_name
   sudo ln -s /etc/nginx/sites-available/inalogystics /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

8. **Setup SSL:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Updating Deployment

For subsequent deployments, simply run:

```bash
./deployment/deploy.sh
```

This will:
1. Create a database backup
2. Pull latest code
3. Install dependencies
4. Run migrations
5. Build application
6. Restart with zero downtime (PM2) or minimal downtime (systemd)
7. Verify health

### Manual Update Steps

If you prefer manual control:

```bash
# 1. Backup
npm run db:backup

# 2. Pull code
git pull origin main

# 3. Dependencies
npm ci

# 4. Database
npm run db:generate
npm run db:migrate:deploy

# 5. Build
npm run build

# 6. Restart
pm2 reload inalogystics
# or
sudo systemctl restart inalogystics
```

## Monitoring

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs inalogystics

# Real-time monitoring
pm2 monit

# CPU/Memory usage
pm2 describe inalogystics
```

### Systemd Monitoring

```bash
# Service status
sudo systemctl status inalogystics

# View logs
sudo journalctl -u inalogystics -f

# Last 100 lines
sudo journalctl -u inalogystics -n 100

# Since specific time
sudo journalctl -u inalogystics --since "1 hour ago"
```

### Nginx Monitoring

```bash
# Access logs
sudo tail -f /var/log/nginx/inalogystics_access.log

# Error logs
sudo tail -f /var/log/nginx/inalogystics_error.log

# Test configuration
sudo nginx -t
```

## Backup & Restore

### Automated Backups

Set up daily backups with cron:

```bash
crontab -e
# Add:
0 2 * * * /home/inalogystics/apps/inalogystics/deployment/backup-db.sh
```

### Manual Backup

```bash
npm run db:backup
# or
./deployment/backup-db.sh
```

### Restore from Backup

```bash
npm run db:restore backups/inalogystics_TIMESTAMP.sql.gz
# or
./deployment/restore-db.sh backups/inalogystics_TIMESTAMP.sql.gz
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs inalogystics --err
# or
sudo journalctl -u inalogystics -n 50

# Verify .env file
cat .env

# Check port availability
sudo lsof -i :3002
```

### Database Connection Issues

```bash
# Test database connection
psql -U inalogystics_user -d inalogystics -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Migration Issues

```bash
# Check migration status
npm run db:migrate:status

# Resolve failed migration
npm run db:migrate:resolve --rolled-back MIGRATION_NAME

# Reset and re-run
npm run db:migrate:deploy
```

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` to version control
   - Use strong, random values for secrets
   - Restrict `.env` permissions: `chmod 600 .env`

2. **Database:**
   - Use strong database password
   - Restrict PostgreSQL to local connections
   - Regular backups (automated)

3. **Firewall:**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp   # SSH
   sudo ufw allow 80/tcp   # HTTP
   sudo ufw allow 443/tcp  # HTTPS
   ```

4. **SSL/TLS:**
   - Always use HTTPS in production
   - Keep certificates updated (Certbot auto-renews)
   - Use strong TLS configuration

5. **Application:**
   - Run as non-root user
   - Keep dependencies updated
   - Monitor for security advisories

## Performance Tips

1. **PM2 Cluster Mode:**
   Edit `ecosystem.config.js`:
   ```javascript
   instances: 'max',  // Use all CPU cores
   exec_mode: 'cluster'
   ```

2. **Database Connection Pooling:**
   Already configured in Prisma schema

3. **Nginx Caching:**
   Already configured for static assets

4. **Monitor Resource Usage:**
   ```bash
   pm2 monit
   htop
   ```

## Additional Resources

- Main Documentation: `/DEPLOYMENT.md`
- Project Guide: `/CLAUDE.md`
- Azure AD Setup: `/ENTRA_SETUP.md`
- PM2 Documentation: https://pm2.keymetrics.io/
- Nginx Documentation: https://nginx.org/en/docs/
- Prisma Migrations: https://www.prisma.io/docs/concepts/components/prisma-migrate

---

**Last Updated:** 2026-01-02
