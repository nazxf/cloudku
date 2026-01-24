#!/bin/bash

# CloudKu Auto Deployment Script
# Usage: ./deploy.sh
# Needs to be run with root privileges (sudo)

echo "🚀 Starting CloudKu Deployment..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root (sudo ./deploy.sh)"
  exit 1
fi

# 1. Update System & Install Dependencies
echo "📦 Updating system & installing dependencies..."
apt update
apt install -y nodejs npm golang postgresql postgresql-contrib nginx git docker.io docker-compose

# 2. Setup PostgreSQL Database (Main App DB)
echo "🗄️ Setting up PostgreSQL..."
# Create database if not exists
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'hostmodern'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE hostmodern;"
# Note: Schema import should be done manually or automated via migration tool for safety
# sudo -u postgres psql -d hostmodern -f ../database/schema.sql

# 3. Setup MySQL Docker (Shared Hosting DB)
echo "🐳 Setting up MySQL Docker environment..."
if [ ! -f "../.env.mysql" ]; then
    echo "⚠️ .env.mysql not found! Copying from example..."
    cp ../.env.mysql.example ../.env.mysql
    echo "⚠️ PLEASE EDIT ../.env.mysql WITH SECURE PASSWORDS AFTER DEPLOYMENT!"
fi
# Start Docker containers
docker-compose -f ../docker-compose.mysql.yml up -d

# 4. Build Frontend (React)
echo "🎨 Building Frontend..."
# Go to project root
cd ..
if [ -f "package.json" ]; then
    npm install
    npm run build
else 
    echo "❌ package.json not found in root!"
    exit 1
fi
echo "✅ Frontend built!"

# 5. Build Backend (Go)
echo "🔨 Building Backend..."
cd go-server
if [ -f "go.mod" ]; then
    go mod tidy
    go build -o cloudku-server
else
    echo "❌ go.mod not found in go-server!"
    exit 1
fi
echo "✅ Backend built!"

# 6. Setup Directory Structure
echo "📂 Setting up production directories at /var/www/cloudku..."
mkdir -p /var/www/cloudku

# Copy Frontend Build
cp -r ../dist /var/www/cloudku/

# Copy Backend Binary & Configs
mkdir -p /var/www/cloudku/go-server
cp cloudku-server /var/www/cloudku/go-server/
cp .env /var/www/cloudku/go-server/ 2>/dev/null || echo "⚠️ .env file for backend not found - Please create it manually!"
cp -r templates /var/www/cloudku/go-server/ 2>/dev/null
cp -r static /var/www/cloudku/go-server/ 2>/dev/null

# 7. Setup Systemd Service for Backend
echo "⚙️ Configuring Systemd Service..."
cp ../deploy/cloudku-backend.service /etc/systemd/system/
# Reload systemd
systemctl daemon-reload
systemctl enable cloudku-backend
# Restart service if already running, or start it
systemctl restart cloudku-backend

# 8. Setup Nginx Reverse Proxy
echo "🌐 Configuring Nginx..."
cp ../deploy/nginx.conf /etc/nginx/sites-available/cloudku
# Remove default if exists
rm -f /etc/nginx/sites-enabled/default
# Link config
ln -sf /etc/nginx/sites-available/cloudku /etc/nginx/sites-enabled/
# Test and Reload Nginx
nginx -t && systemctl restart nginx

echo "========================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "   - Backend Service: cloudku-backend (Port 3001)"
echo "   - Frontend: Served via Nginx (Port 80)"
echo "   - MySQL Docker: Ports 3306 & 8080"
echo ""
echo "👉 NEXT STEPS:"
echo "   1. Edit /etc/nginx/sites-available/cloudku to set your DOMAIN."
echo "   2. Edit /var/www/cloudku/go-server/.env with production secrets."
echo "   3. Secure MySQL passwords in .env.mysql"
echo "   4. Setup SSL with Certbot: certbot --nginx -d your-domain.com"
echo "========================================"
