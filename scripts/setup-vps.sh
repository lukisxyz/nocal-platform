#!/bin/bash

# NoCal Platform VPS Setup Script
# Run this script on your VPS to install all required software

set -e

echo "🚀 Setting up NoCal Platform on VPS..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
echo "📦 Installing pnpm..."
npm install -g pnpm

# Install Caddy
echo "📦 Installing Caddy..."
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo tee /etc/apt/trusted.gpg.d/caddy-stable.asc
echo "deb https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy -y

# Install git and other utilities
echo "📦 Installing additional utilities..."
sudo apt install -y git curl wget unzip

# Create app directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/nocal
sudo chown $USER:$USER /var/www/nocal

# Enable and start Caddy
echo "🚀 Starting Caddy..."
sudo systemctl enable caddy
sudo systemctl start caddy

# Create log directory
echo "📁 Creating log directory..."
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy

# Verify installations
echo "✅ Verifying installations..."
node --version
pnpm --version
caddy version

echo ""
echo "✅ VPS setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository: cd /var/www/nocal && git clone <your-repo-url> ."
echo "2. Configure Caddy: sudo nano /etc/caddy/Caddyfile"
echo "3. Create systemd service: sudo nano /etc/systemd/system/nocal.service"
echo "4. Run: sudo systemctl daemon-reload && sudo systemctl enable nocal && sudo systemctl start nocal"
echo ""
echo "See DEPLOYMENT.md for detailed instructions."
