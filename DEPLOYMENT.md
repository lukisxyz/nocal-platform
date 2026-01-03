# VPS Deployment Guide with Caddy

This guide will help you deploy the NoCal Platform on a VPS with Caddy as a reverse proxy and automatic SSL.

## Prerequisites

- Ubuntu/Debian VPS with root or sudo access
- A domain name pointing to your VPS IP address
- At least 1GB RAM and 1 CPU core

## Step 1: Install Required Software

### Install Node.js and pnpm

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Verify installations
node --version
pnpm --version
```

### Install Caddy

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo tee /etc/apt/trusted.gpg.d/caddy-stable.asc
echo "deb https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

## Step 2: Deploy Your Application

### Option A: Clone Repository on Server

```bash
# Create app directory
sudo mkdir -p /var/www/nocal
sudo chown $USER:$USER /var/www/nocal
cd /var/www/nocal

# Clone your repository
git clone <your-repo-url> .

# Install dependencies
pnpm install --frozen-lockfile

# Build the application
pnpm build

# Copy built files to .output
cp -r .output /var/www/nocal/
```

### Option B: Transfer Built Files

If you've already built the project locally:

```bash
# On your local machine, create a tarball of the project (excluding node_modules)
cd /path/to/your/project
tar --exclude='node_modules' --exclude='.git' -czf nocal-platform.tar.gz .

# Transfer to VPS
scp nocal-platform.tar.gz user@your-vps-ip:/var/www/

# On your VPS
cd /var/www
tar -xzf nocal-platform.tar.gz
mv platform nocal
cd nocal
pnpm install --frozen-lockfile
pnpm build
```

## Step 3: Create Environment File

```bash
# Create production environment file
nano /var/www/nocal/.env.production
```

Add your environment variables:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_USDC_TOKEN_ADDRESS=0xea80688a3f4cD6D026A675C8111057956AA6850d
DATABASE_URL=your_database_url
NODE_ENV=production
```

## Step 4: Create Systemd Service

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/nocal.service
```

Add the following content:

```ini
[Unit]
Description=NoCal Platform
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/nocal/.output/server
Environment=NODE_ENV=production
EnvironmentFile=/var/www/nocal/.env.production
ExecStart=/usr/bin/node index.mjs
Restart=always
RestartSec=5

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/www/nocal/.output/server

[Install]
WantedBy=multi-user.target
```

## Step 5: Configure Caddy

### Create Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

Add your configuration:

```caddyfile
your-domain.com {
    # Enable automatic HTTPS
    encode gzip

    # Reverse proxy to the Node.js app
    reverse_proxy localhost:3000

    # Optional: Add security headers
    header {
        # Enable HSTS
        Strict-Transport-Security "max-age=31536000;"
        # Remove server information
        -Server
        # X-Content-Type-Options
        X-Content-Type-Options "nosniff"
        # X-Frame-Options
        X-Frame-Options "DENY"
        # X-XSS-Protection
        X-XSS-Protection "1; mode=block"
    }

    # Optional: Access logs
    log {
        output file /var/log/caddy/your-domain.com.log
    }
}
```

Replace `your-domain.com` with your actual domain name.

### Create log directory

```bash
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy
```

## Step 6: Start Services

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable and start your app
sudo systemctl enable nocal
sudo systemctl start nocal
sudo systemctl status nocal

# Enable and start Caddy
sudo systemctl enable caddy
sudo systemctl start caddy
sudo systemctl status caddy
```

## Step 7: Setup GitHub Secrets for Auto-Deploy

Go to your GitHub repository → Settings → Secrets and variables → Actions, then add:

### Repository Secrets

Click "New repository secret" and add:

1. **VPS_HOST**: Your VPS IP address or domain
2. **VPS_USER**: SSH user (e.g., `ubuntu`, `root`, or your username)
3. **VPS_SSH_KEY**: Your private SSH key (the content of `~/.ssh/id_rsa`)
4. **VPS_PORT**: SSH port (default: 22)
5. **VITE_WALLETCONNECT_PROJECT_ID**: Same as in .env
6. **VITE_USDC_TOKEN_ADDRESS**: Same as in .env
7. **DATABASE_URL**: Same as in .env

### Getting your SSH Key

On your local machine:

```bash
# Display your public key
cat ~/.ssh/id_rsa.pub

# If you don't have an SSH key pair, create one
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Display private key (keep this secret!)
cat ~/.ssh/id_rsa
```

### Adding SSH Key to VPS

On your VPS:

```bash
# Add your public key to authorized_keys
echo "your-public-key" >> ~/.ssh/authorized_keys

# Or use ssh-copy-id
ssh-copy-id user@your-vps-ip
```

### Testing GitHub Actions

1. Commit and push to master branch:

```bash
git add .github/workflows/deploy.yml
git commit -m "Add auto-deploy workflow"
git push origin master
```

2. Go to GitHub Actions tab to see deployment in progress

## Step 8: Verify Deployment

```bash
# Check app logs
sudo journalctl -u nocal -f

# Check Caddy status
sudo systemctl status caddy

# Check if app is running on port 3000
curl http://localhost:3000

# Check domain with Caddy
curl https://your-domain.com
```

## Auto-Deploy on Git Push

Once configured, every push to the `master` branch will:
1. Trigger GitHub Actions workflow
2. Install dependencies
3. Build the application
4. Deploy to your VPS
5. Restart the service
6. Verify deployment success

### Manual Deployment Trigger

You can also trigger deployment manually:
1. Go to Actions tab in GitHub
2. Select "Deploy to VPS" workflow
3. Click "Run workflow"
4. Choose branch and run

## Troubleshooting

### App won't start

```bash
# Check logs
sudo journalctl -u nocal -n 50

# Check if port 3000 is in use
sudo lsof -i :3000

# Verify files exist
ls -la /var/www/nocal/.output/server/index.mjs

# Test manually
cd /var/www/nocal/.output/server
NODE_ENV=production node index.mjs
```

### Caddy won't issue SSL certificate

```bash
# Check Caddy logs
sudo journalctl -u caddy -f

# Verify DNS is pointing to your VPS
dig your-domain.com

# Check Caddy configuration
sudo caddy validate-config

# View Caddy status
sudo caddy list-certs
```

### Database connection issues

```bash
# Verify DATABASE_URL in .env.production
cat /var/www/nocal/.env.production

# Test database connection
# (You may need to temporarily modify your app to add a health check)
```

### GitHub Actions deployment fails

```bash
# Check workflow logs in GitHub Actions tab

# Common issues:
# 1. SSH key not valid - verify VPS_SSH_KEY secret
# 2. VPS_HOST incorrect - check IP/hostname
# 3. Permission denied - verify SSH key is added to VPS
# 4. Build fails - check environment variables in GitHub secrets
```

## Updating Your Application

### Automatic (Recommended)

Simply push to master branch and GitHub Actions will handle the rest!

### Manual

```bash
cd /var/www/nocal

# Pull latest changes (if using git)
git pull

# Rebuild
pnpm build

# Restart service
sudo systemctl restart nocal

# Check status
sudo systemctl status nocal
```

## Performance Optimization

### Enable PM2 (Alternative to systemd)

```bash
# Install PM2
sudo npm install -g pm2

# Start app with PM2
cd /var/www/nocal/.output/server
pm2 start index.mjs --name nocal

# Save PM2 configuration
pm2 save
pm2 startup

# Monitor
pm2 monit
```

### Setup Nginx (Alternative to Caddy)

If you prefer Nginx over Caddy:

```bash
sudo apt install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/nocal
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and get SSL with Certbot:

```bash
sudo ln -s /etc/nginx/sites-available/nocal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Security Checklist

- [ ] Change default database passwords
- [ ] Use environment variables for all secrets
- [ ] Enable firewall (ufw)
- [ ] Disable root SSH login
- [ ] Use SSH key authentication
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`
- [ ] Setup fail2ban: `sudo apt install fail2ban`
- [ ] Regular backups of database

## Useful Commands

```bash
# View real-time logs
sudo journalctl -u nocal -f

# Restart app
sudo systemctl restart nocal

# Reload Caddy (auto-gets new certs)
sudo systemctl reload caddy

# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

## Backup

### Backup application files

```bash
# Create backup
sudo tar -czf /root/nocal-backup-$(date +%Y%m%d).tar.gz /var/www/nocal

# Or use rsync for incremental backup
rsync -avz /var/www/nocal/ /backup/nocal-$(date +%Y%m%d)/
```

### Database backup (Neon PostgreSQL)

```bash
# Install pg CLI
sudo apt install postgresql-client

# Backup database
pg_dump "postgresql://neondb_owner:password@ep-restless-mud-a1b8ypfl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" > backup-$(date +%Y%m%d).sql
```

## Support

If you encounter issues:
1. Check logs: `sudo journalctl -u nocal -f`
2. Verify DNS: `dig your-domain.com`
3. Test locally: `curl http://localhost:3000`
4. Check Caddy status: `sudo systemctl status caddy`
5. Check GitHub Actions logs for deployment issues
