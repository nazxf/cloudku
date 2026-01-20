#!/bin/bash

# CloudKu Auto Deployment Script
# Usage: ./deploy.sh

echo "🚀 Starting CloudKu Deployment..."

# 1. Update System
echo "📦 Updating system..."
sudo apt update && sudo apt install -y nodejs npm golang postgresql postgresql-contrib nginx git

# 2. Setup Database
echo "🗄️ Setting up Database..."
# Note: Password prompt might appear
sudo -u postgres psql -c "CREATE DATABASE hostmodern;" || echo "Database might already exist"
# Import schema if needed
# sudo -u postgres psql -d hostmodern -f ../database/schema.sql

# 3. Build Frontend
echo "🎨 Building Frontend..."
cd ..
npm install
npm run build
echo "✅ Frontend built!"

# 4. Build Backend
echo "🔨 Building Backend..."
cd go-server
go mod tidy
go build -o cloudku-server
echo "✅ Backend built!"

# 5. Setup Directories (assuming /var/www/cloudku)
echo "📂 Setting up directories..."
sudo mkdir -p /var/www/cloudku
sudo cp -r ../dist /var/www/cloudku/
sudo cp -r . /var/www/cloudku/go-server/

# 6. Setup Permission
sudo chmod +x /var/www/cloudku/go-server/cloudku-server

# 7. Setup Systemd Service
echo "⚙️ Configuring Service..."
sudo cp ../deploy/cloudku-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable cloudku-backend
sudo systemctl restart cloudku-backend

# 8. Setup Nginx
echo "🌐 Configuring Nginx..."
sudo cp ../deploy/nginx.conf /etc/nginx/sites-available/cloudku
sudo ln -s /etc/nginx/sites-available/cloudku /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "========================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "   Backend running on port 3001"
echo "   Frontend serving at /var/www/cloudku/dist"
echo "========================================"
