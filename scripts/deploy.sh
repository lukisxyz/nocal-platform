#!/bin/bash

# NoCal Platform Deployment Script
# Run this script from your local machine to deploy to VPS

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST=${1}
VPS_USER=${2}
VPS_PORT=${3:-22}
APP_DIR="/var/www/nocal"

if [ -z "$VPS_HOST" ] || [ -z "$VPS_USER" ]; then
    echo -e "${RED}Usage: ./deploy.sh <vps-host> <vps-user> [vps-port]${NC}"
    echo -e "${YELLOW}Example: ./deploy.sh 192.168.1.100 ubuntu 22${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Starting deployment to VPS...${NC}"
echo -e "Host: ${VPS_HOST}"
echo -e "User: ${VPS_USER}"
echo -e "Port: ${VPS_PORT}"
echo ""

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ]; then
    echo -e "${YELLOW}⚠️  SSH key not found at ~/.ssh/id_rsa${NC}"
    echo -e "${YELLOW}Creating SSH key pair...${NC}"
    ssh-keygen -t rsa -b 4096 -C "$(whoami)@$(hostname)"
fi

# Check if SSH key is added to VPS
echo -e "${YELLOW}Checking if SSH key is added to VPS...${NC}"
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${VPS_USER}@${VPS_HOST} -p ${VPS_PORT} exit 2>/dev/null; then
    echo -e "${YELLOW}SSH key not found on VPS. Please add your public key:${NC}"
    echo -e "${GREEN}Run this on your VPS:${NC}"
    echo -e "${YELLOW}  mkdir -p ~/.ssh${NC}"
    echo -e "${YELLOW}  echo '$(cat ~/.ssh/id_rsa.pub)' >> ~/.ssh/authorized_keys${NC}"
    echo -e "${YELLOW}  chmod 600 ~/.ssh/authorized_keys${NC}"
    echo ""
    read -p "Press enter when you've added the SSH key..."
fi

# Create deployment package
echo -e "${GREEN}📦 Creating deployment package...${NC}"
rm -rf deployment-package
mkdir -p deployment-package

# Copy necessary files
cp -r .output deployment-package/ 2>/dev/null || (echo -e "${RED}Build not found. Run 'pnpm build' first!${NC}" && exit 1)
cp package.json deployment-package/
cp pnpm-lock.yaml deployment-package/
cp .env.production deployment-package/ 2>/dev/null || echo -e "${YELLOW}Warning: .env.production not found${NC}"

# Create tarball
tar -czf nocal-platform.tar.gz -C deployment-package .

# Upload and deploy
echo -e "${GREEN}🚀 Uploading to VPS...${NC}"
scp -P ${VPS_PORT} nocal-platform.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/

echo -e "${GREEN}🚀 Deploying on VPS...${NC}"
ssh -p ${VPS_PORT} ${VPS_USER}@${VPS_HOST} << 'DEPLOY_SCRIPT'
set -e

APP_DIR="/var/www/nocal"

# Backup current version
if [ -d "$APP_DIR/.output" ]; then
    echo "📦 Backing up current version..."
    cp -r "$APP_DIR/.output" "$APP_DIR/.output.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Extract deployment package
echo "📦 Extracting deployment package..."
cd /tmp
tar -xzf nocal-platform.tar.gz
rm nocal-platform.tar.gz

# Install dependencies
echo "📦 Installing dependencies..."
cd "$APP_DIR"
if [ -f "package.json" ]; then
    pnpm install --frozen-lockfile
fi

# Copy new version
echo "📦 Copying new version..."
rm -rf .output
cp -r /tmp/output .output

# Clean up
rm -rf /tmp/output
rm -f package.json
rm -f pnpm-lock.yaml
rm -f .env.production

# Restart service
echo "🚀 Restarting service..."
sudo systemctl restart nocal

# Wait for service to start
sleep 5

# Check service status
if sudo systemctl is-active --quiet nocal; then
    echo "✅ Deployment successful!"
    sudo systemctl status nocal --no-pager -l
else
    echo "❌ Service failed to start. Restoring backup..."
    sudo systemctl stop nocal
    if ls "$APP_DIR"/.output.backup.* 2>/dev/null | read; then
        rm -rf .output
        cp -r "$APP_DIR"/.output.backup.* .output
        sudo systemctl start nocal
    fi
    echo "❌ Deployment failed!"
    exit 1
fi

# Clean up old backups (keep last 5)
cd "$APP_DIR"
ls -t .output.backup.* 2>/dev/null | tail -n +6 | xargs -r rm -rf

echo ""
echo "✅ Deployment completed successfully!"
echo "Visit your application to verify it works."
DEPLOY_SCRIPT

# Cleanup
rm -f nocal-platform.tar.gz
rm -rf deployment-package

echo -e "${GREEN}🎉 Deployment complete!${NC}"
