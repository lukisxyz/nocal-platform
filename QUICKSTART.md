# Quick Start - Deploy NoCal Platform to VPS

## Prerequisites

- VPS with Ubuntu/Debian
- Domain name (optional but recommended)
- GitHub repository

## Step 1: Setup VPS (Run on VPS)

```bash
# Install Node.js, pnpm, and Caddy
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs pnpm caddy

# Or use the setup script
git clone <your-repo-url> /var/www/nocal
cd /var/www/nocal
chmod +x scripts/setup-vps.sh
./scripts/setup-vps.sh
```

## Step 2: Configure Service (Run on VPS)

```bash
sudo cp scripts/nocal.service /etc/systemd/system/nocal.service
sudo systemctl daemon-reload
sudo systemctl enable nocal
```

## Step 3: Configure Caddy (Run on VPS)

```bash
sudo cp scripts/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile  # Replace YOUR_DOMAIN with your domain
sudo systemctl reload caddy
```

## Step 4: Setup Environment (Run on VPS)

```bash
cd /var/www/nocal
nano .env.production

# Add:
# VITE_WALLETCONNECT_PROJECT_ID=your_id
# VITE_USDC_TOKEN_ADDRESS=0xea80688a3f4cD6D026A675C8111057956AA6850d
# DATABASE_URL=your_db_url
# NODE_ENV=production
```

## Step 5: Deploy (Choose One)

### Option A: GitHub Actions (Auto)

Push to master branch - done!

### Option B: Manual Deployment (Local)

```bash
# On local machine
pnpm build
./scripts/deploy.sh <vps-ip> <vps-user>

# Example
./scripts/deploy.sh 192.168.1.100 ubuntu
```

### Option C: Direct (VPS)

```bash
cd /var/www/nocal
pnpm install --frozen-lockfile
pnpm build
sudo systemctl start nocal
sudo systemctl status nocal
```

## Step 6: Verify

```bash
# Check service
sudo systemctl status nocal

# Check logs
sudo journalctl -u nocal -f

# Test app
curl http://localhost:3000

# Test domain
curl https://your-domain.com
```

## Auto-Deploy on Git Push

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add secrets:
   - `VPS_HOST`: Your VPS IP or domain
   - `VPS_USER`: SSH username
   - `VPS_SSH_KEY`: Your private SSH key content
   - `VPS_PORT`: 22 (default)
   - `VITE_WALLETCONNECT_PROJECT_ID`: Same as .env
   - `VITE_USDC_TOKEN_ADDRESS`: Same as .env
   - `DATABASE_URL`: Same as .env
3. Push to master - deployment starts automatically!

## Common Commands

```bash
# Restart app
sudo systemctl restart nocal

# View logs
sudo journalctl -u nocal -f

# Update app (manual)
cd /var/www/nocal && git pull && pnpm build && sudo systemctl restart nocal

# Check service status
sudo systemctl status nocal

# Check Caddy
sudo systemctl status caddy
sudo caddy list-certs
```

## Troubleshooting

**Service won't start:**
```bash
sudo journalctl -u nocal -n 50
ls -la /var/www/nocal/.output/server/index.mjs
```

**SSL certificate issues:**
```bash
sudo journalctl -u caddy -f
dig your-domain.com
sudo caddy validate-config
```

**Database connection:**
```bash
cat /var/www/nocal/.env.production
```

**GitHub Actions fails:**
- Check Actions tab for error logs
- Verify SSH key is correct
- Check VPS credentials in secrets

## Need Help?

- Full guide: See `DEPLOYMENT.md`
- Scripts docs: See `scripts/README.md`
- Check logs: `sudo journalctl -u nocal -f`
