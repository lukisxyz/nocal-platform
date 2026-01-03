# Deployment Scripts

This directory contains scripts to help you deploy the NoCal Platform to your VPS.

## Scripts

### 1. setup-vps.sh

Run this on your VPS to install all required software (Node.js, pnpm, Caddy).

```bash
# On your VPS
chmod +x scripts/setup-vps.sh
./scripts/setup-vps.sh
```

### 2. deploy.sh

Run this from your local machine to deploy your application to the VPS.

```bash
# From your local machine
chmod +x scripts/deploy.sh
./scripts/deploy.sh <vps-host> <vps-user> [vps-port]

# Example
./scripts/deploy.sh 192.168.1.100 ubuntu 22
```

### 3. nocal.service

Systemd service template. Copy this to `/etc/systemd/system/nocal.service` on your VPS.

```bash
# On your VPS
sudo cp scripts/nocal.service /etc/systemd/system/nocal.service
sudo nano /etc/systemd/system/nocal.service  # Edit if needed
sudo systemctl daemon-reload
sudo systemctl enable nocal
sudo systemctl start nocal
```

### 4. Caddyfile

Caddy reverse proxy template. Copy this to `/etc/caddy/Caddyfile` on your VPS.

```bash
# On your VPS
sudo cp scripts/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile  # Edit and replace YOUR_DOMAIN
sudo systemctl reload caddy
```

## Quick Start

### Initial Setup (VPS)

1. SSH into your VPS
2. Run the setup script:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/your-username/your-repo/master/scripts/setup-vps.sh | bash
   ```

3. Clone your repository:
   ```bash
   cd /var/www/nocal
   git clone <your-repo-url> .
   ```

4. Copy and configure the service file:
   ```bash
   sudo cp scripts/nocal.service /etc/systemd/system/nocal.service
   sudo systemctl daemon-reload
   sudo systemctl enable nocal
   ```

5. Copy and configure Caddyfile:
   ```bash
   sudo cp scripts/Caddyfile /etc/caddy/Caddyfile
   sudo nano /etc/caddy/Caddyfile  # Replace YOUR_DOMAIN with your actual domain
   sudo systemctl reload caddy
   ```

6. Create environment file:
   ```bash
   nano .env.production
   ```

7. Build and start:
   ```bash
   pnpm install --frozen-lockfile
   pnpm build
   sudo systemctl start nocal
   ```

### Manual Deployment (Local)

1. Build the application:
   ```bash
   pnpm build
   ```

2. Run the deployment script:
   ```bash
   ./scripts/deploy.sh <vps-host> <vps-user> [vps-port]
   ```

### GitHub Actions (Automatic)

Simply push to master branch! The GitHub Actions workflow will:
- Build the application
- Deploy to your VPS
- Restart the service
- Verify deployment

See `.github/workflows/deploy.yml` for details.

## Requirements

- Ubuntu/Debian VPS
- GitHub repository
- Domain name (optional, but recommended for HTTPS)
- SSH access to VPS

## Troubleshooting

### Setup script fails

- Check that you're running as a user with sudo privileges
- Ensure your VPS has internet connectivity
- Update your system: `sudo apt update && sudo apt upgrade`

### Deployment script fails

- Ensure SSH key is added to VPS: `ssh-copy-id user@vps-host`
- Check that all required files exist (`.output`, `package.json`)
- Verify VPS credentials

### Service won't start

- Check logs: `sudo journalctl -u nocal -f`
- Verify environment file exists: `/var/www/nocal/.env.production`
- Check if port 3000 is in use: `sudo lsof -i :3000`

### Caddy won't issue SSL certificate

- Verify domain DNS points to VPS IP
- Check Caddy logs: `sudo journalctl -u caddy -f`
- Validate config: `sudo caddy validate-config`
