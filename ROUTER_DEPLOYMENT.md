# 🚀 Cortensor Router Node Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying a Cortensor Router Node to support the ChainProof Arbiter application.

**Important:** Router nodes should be deployed on dedicated servers (VPS, cloud instance, or bare metal), not in development containers like GitHub Codespaces.

---

## Prerequisites

- Ubuntu 20.04 LTS or 24.04 LTS (recommended)
- Minimum 4GB RAM, 2 CPU cores
- 50GB available disk space
- Public IP address for external routing
- Root or sudo access

---

## Step 1: Install Dependencies

### Install Docker and Docker Compose

```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker

# Verify installation
docker --version
docker-compose --version
```

### Install Git LFS

```bash
sudo apt install git-lfs -y
git lfs install
```

---

## Step 2: Download Cortensor Installer

```bash
cd /tmp
git clone https://github.com/cortensor/installer.git cortensor-installer
cd cortensor-installer
```

**Note:** This will download large binary files via Git LFS (>500MB). Ensure stable internet connection.

---

## Step 3: Install Cortensor Components

### Install IPFS

```bash
sudo ./install-ipfs-linux.sh
```

Verify installation:
```bash
ipfs version
# Expected output: ipfs version 0.33.0 or higher
```

### Install Docker (if needed)

```bash
sudo ./install-docker-ubuntu.sh
```

### Install cortensord Daemon

```bash
sudo ./install-linux.sh
```

**Important:** When prompted to create password for `deploy` user, use a strong password and save it securely.

This script will:
- Create a `deploy` system user
- Install cortensord binary to `/usr/local/bin/cortensord`
- Set up systemd services
- Create configuration directory at `~/.cortensor/`

---

## Step 4: Configure as Deploy User

Switch to the deploy user:

```bash
sudo su deploy
cd ~
export PATH=$PATH:~/.cortensor/bin
```

Add to `~/.bashrc` for persistence:
```bash
echo 'export PATH=$PATH:~/.cortensor/bin' >> ~/.bashrc
source ~/.bashrc
```

---

## Step 5: Generate Node Identity

Generate cryptographic keys for your Router node:

```bash
cortensord ~/.cortensor/.env tool gen_key
```

This command creates:
- `NODE_ID` - Your node's public identifier
- `NODE_PRIVATE_KEY` - Keep this secret!

**Save these keys securely!** They cannot be recovered if lost.

### Optional: Register Node (if required)

```bash
# Only run if your network requires registration
cortensord ~/.cortensor/.env tool register
cortensord ~/.cortensor/.env tool verify
```

---

## Step 6: Configure Router Mode

Edit your configuration file:

```bash
nano ~/.cortensor/.env
```

Add or update the following settings:

```bash
# API Configuration
API_ENABLE=1
API_KEY=                              # Leave blank for now, will generate in next step
API_PORT=5010

# Router Binding
ROUTER_REST_BIND_IP=127.0.0.1         # Internal binding
ROUTER_REST_BIND_PORT=5010

# External Access
ROUTER_EXTERNAL_IP=YOUR_PUBLIC_IP     # Replace with your server's public IP
ROUTER_EXTERNAL_PORT=9001

# Blockchain Configuration
CHAIN_ID=18964747554
RPC_URL=https://cor-0-testnet.agnc.my.id/
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY   # Replace with your wallet private key

# IPFS Configuration
IPFS_ENABLE=1
IPFS_API_URL=/ip4/127.0.0.1/tcp/5001

# Node Identity (generated in Step 5)
NODE_ID=                               # Paste from gen_key output
NODE_PRIVATE_KEY=                      # Paste from gen_key output

# Performance
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT=30000

# Logging
LOG_LEVEL=info
LOG_PATH=~/.cortensor/logs
```

**Important Configuration Notes:**

1. **ROUTER_EXTERNAL_IP**: Must be your server's public IP address
2. **PRIVATE_KEY**: Use a dedicated wallet for Router operations (not your main wallet)
3. **NODE_PRIVATE_KEY**: Generated in Step 5, keep secure
4. **API_KEY**: Will be generated in next step

---

## Step 7: Generate Router API Key

Generate a secure API key for Router access:

```bash
cortensord ~/.cortensor/.env tool gen-api-key
```

Copy the generated key and add it to your `.env` file:

```bash
nano ~/.cortensor/.env
# Set: API_KEY=<your_generated_key>
```

---

## Step 8: Start Router Services

### Start via Systemd (Recommended)

```bash
sudo systemctl start cortensor
sudo systemctl enable cortensor
sudo systemctl status cortensor
```

### Or Start Manually (for testing)

```bash
~/.cortensor/bin/start-cortensor.sh
```

Check logs:
```bash
tail -f ~/.cortensor/logs/cortensor.log
```

---

## Step 9: Configure Firewall

Open necessary ports:

```bash
# API port (if exposing publicly - usually keep internal
)
sudo ufw allow 5010/tcp

# Router external port
sudo ufw allow 9001/tcp

# IPFS ports
sudo ufw allow 4001/tcp
sudo ufw allow 5001/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

**Security Note:** For production, use nginx reverse proxy with SSL/TLS instead of exposing ports directly.

---

## Step 10: Verify Router is Running

### Check Router Status

```bash
curl http://localhost:5010/v1/status \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Expected response:
```json
{
  "status": "ready",
  "version": "1.0.0",
  "uptime": 12345,
  "activeModels": ["gpt-4", "claude-3"]
}
```

### List Available Models

```bash
curl http://localhost:5010/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Test Inference

```bash
curl -X POST http://localhost:5010/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Analyze the security of a basic ERC-20 token contract"}
    ]
  }'
```

---

## Step 11: Configure ChainProof Arbiter Frontend

Update your frontend `.env.local` file:

```bash
# In your ChainProof Arbiter project directory
nano .env.local
```

Set these variables:

```bash
# Point to your Router node
CORTENSOR_ROUTER_URL=http://YOUR_PUBLIC_IP:5010
CORTENSOR_API_KEY=YOUR_GENERATED_API_KEY

# Blockchain config (must match Router)
NEXT_PUBLIC_CHAIN_ID=18964747554
NEXT_PUBLIC_RPC_URL=https://cor-0-testnet.agnc.my.id/

# Disable simulation mode to use real Router
NEXT_PUBLIC_SIMULATION_MODE=false
```

---

## Step 12: Optional - Set Up SSL/TLS with Nginx

For production deployments, use nginx as a reverse proxy with SSL:

```bash
sudo ./install-nginx-linux.sh
```

Configure nginx:

```bash
sudo nano /etc/nginx/sites-available/cortensor-router
```

Add configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name router.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/router.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/router.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/cortensor-router /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Then update frontend to use HTTPS URL:
```bash
CORTENSOR_ROUTER_URL=https://router.yourdomain.com
```

---

## Monitoring and Maintenance

### Check Router Logs

```bash
journalctl -u cortensor -f
# Or
tail -f ~/.cortensor/logs/cortensor.log
```

### Restart Router

```bash
sudo systemctl restart cortensor
```

### Stop Router

```bash
sudo systemctl stop cortensor
```

### View System Resource Usage

```bash
# CPU and memory
htop

# Disk usage
df -h ~/.cortensor/

# Network connections
netstat -tulpn | grep 5010
```

### Backup Configuration

```bash
# Backup your .env file and keys
cp ~/.cortensor/.env ~/.cortensor/.env.backup.$(date +%Y%m%d)

# Backup entire config directory
tar -czf cortensor-backup-$(date +%Y%m%d).tar.gz ~/.cortensor/
```

---

## Troubleshooting

### Router Not Starting

1. Check logs: `journalctl -u cortensor -xe`
2. Verify binary: `ls -lh /usr/local/bin/cortensord`
3. Check permissions: `sudo chown deploy:deploy /usr/local/bin/cortensord`
4. Verify configuration: `cat ~/.cortensor/.env | grep -v PRIVATE_KEY`

### API Connection Refused

1. Verify Router is running: `systemctl status cortensor`
2. Check port binding: `netstat -tulpn | grep 5010`
3. Test locally first: `curl http://localhost:5010/v1/status`
4. Check firewall: `sudo ufw status`

### IPFS Issues

1. Check IPFS daemon: `systemctl status ipfs`
2. Test IPFS: `ipfs id`
3. Restart IPFS: `sudo systemctl restart ipfs`

### High Resource Usage

1. Reduce `MAX_CONCURRENT_REQUESTS` in `.env`
2. Increase server resources (RAM, CPU)
3. Enable request rate limiting
4. Monitor with: `htop` and `iotop`

---

## Security Best Practices

1. **Never expose your `NODE_PRIVATE_KEY` or `PRIVATE_KEY`**
2. Use a dedicated wallet for Router operations
3. Keep API keys secure and rotate them regularly
4. Use SSL/TLS for production deployments
5. Implement rate limiting and request throttling
6. Regular security audits and updates
7. Monitor logs for suspicious activity
8. Use fail2ban to prevent brute force attacks

---

## Support Resources

- **Cortensor Documentation**: https://docs.cortensor.ai
- **GitHub Issues**: https://github.com/cortensor/installer/issues
- **Community Discord**: [Add link if available]
- **Router API Reference**: https://docs.cortensor.ai/api/router

---

## Quick Reference Commands

```bash
# Start Router
sudo systemctl start cortensor

# Stop Router
sudo systemctl stop cortensor

# Restart Router
sudo systemctl restart cortensor

# View Router status
sudo systemctl status cortensor

# View logs
journalctl -u cortensor -f

# Test Router API
curl http://localhost:5010/v1/status -H "Authorization: Bearer YOUR_API_KEY"

# Check Router version
cortensord --version

# Generate new API key
cortensord ~/.cortensor/.env tool gen-api-key

# View configuration (safely)
cat ~/.cortensor/.env | grep -v "PRIVATE_KEY\|NODE_PRIVATE_KEY"
```

---

## Next Steps

After successful deployment:

1. ✅ Verify Router is accessible from frontend
2. ✅ Test inference requests end-to-end
3. ✅ Monitor performance and resource usage
4. ✅ Set up automated backups
5. ✅ Configure monitoring/alerting
6. ✅ Document your specific deployment details

---

**Deployment Complete!** 🎉

Your Cortensor Router Node is now ready to power the ChainProof Arbiter application with decentralized AI inference.
