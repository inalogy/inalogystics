#!/bin/bash

###############################################################################
# InaLogystics Deployment Script
#
# This script automates the deployment process for the InaLogystics application
# It includes safety checks, backup, database migration, and zero-downtime restart
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="inalogystics"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}InaLogystics Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "$APP_DIR/package.json" ]; then
    print_error "package.json not found. Are you in the correct directory?"
    exit 1
fi

# Check if .env file exists
if [ ! -f "$APP_DIR/.env" ]; then
    print_error ".env file not found. Please create it from .env.example"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Step 1: Backup current database
print_info "Creating database backup..."
./deployment/backup-db.sh
if [ $? -eq 0 ]; then
    print_success "Database backup created"
else
    print_warning "Database backup failed, but continuing..."
fi

# Step 2: Pull latest code from git
print_info "Pulling latest code from repository..."
if git pull origin main; then
    print_success "Code updated successfully"
else
    print_error "Failed to pull latest code"
    exit 1
fi

# Step 3: Install/update dependencies
print_info "Installing dependencies..."
if npm ci --production=false; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 4: Generate Prisma Client
print_info "Generating Prisma Client..."
if npm run db:generate; then
    print_success "Prisma Client generated"
else
    print_error "Failed to generate Prisma Client"
    exit 1
fi

# Step 5: Run database migrations
print_info "Running database migrations..."
if npm run db:migrate:deploy; then
    print_success "Database migrations completed"
else
    print_error "Database migration failed"
    print_warning "You may need to fix the migration manually"
    exit 1
fi

# Step 6: Build application
print_info "Building application..."
if npm run build; then
    print_success "Application built successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 7: Restart application
print_info "Restarting application..."

# Check if PM2 is being used
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "$APP_NAME"; then
        print_info "Reloading application with PM2 (zero-downtime)..."
        pm2 reload "$APP_NAME"
        print_success "Application reloaded with PM2"
    else
        print_info "Starting application with PM2..."
        pm2 start ecosystem.config.js
        print_success "Application started with PM2"
    fi
# Check if systemd is being used
elif systemctl is-active --quiet "$APP_NAME"; then
    print_info "Restarting application with systemd..."
    sudo systemctl restart "$APP_NAME"
    print_success "Application restarted with systemd"
else
    print_warning "No process manager detected (PM2 or systemd)"
    print_info "You may need to restart the application manually"
fi

# Step 8: Health check
print_info "Performing health check..."
sleep 5  # Wait for application to start

if curl -f http://localhost:3002/api/health &> /dev/null; then
    print_success "Health check passed - Application is running"
else
    print_warning "Health check failed - Application may not be running correctly"
    print_info "Check logs with: pm2 logs $APP_NAME (or systemctl status $APP_NAME)"
fi

echo ""
print_success "Deployment completed successfully!"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Deployment Summary:${NC}"
echo -e "  - Code updated from repository"
echo -e "  - Dependencies installed"
echo -e "  - Database migrations applied"
echo -e "  - Application built and restarted"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  - Monitor logs: ${BLUE}pm2 logs $APP_NAME${NC}"
echo -e "  - Check status: ${BLUE}pm2 status${NC}"
echo -e "  - View app: ${BLUE}https://your-domain.com${NC}"
echo ""
