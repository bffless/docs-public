---
sidebar_position: 4
title: SSL Certificates
description: SSL certificate options for your BFFless deployment
---

# SSL Certificates

This page covers SSL certificate options beyond the recommended Cloudflare approach.

## Recommended: Cloudflare

For most self-hosted deployments, we recommend using Cloudflare for SSL. It provides free certificates, DDoS protection, and CDN caching with no renewal hassles.

👉 **[Cloudflare Setup Guide](/getting-started/cloudflare-setup)** - Complete setup instructions

---

## Alternative: Let's Encrypt

If you prefer not to use Cloudflare, you can use Let's Encrypt for free SSL certificates.

👉 **[Let's Encrypt Setup Guide](/getting-started/letsencrypt-setup)** - Complete setup instructions

### Quick Reference

### Prerequisites

- Domain name with DNS pointing to your server
- Ports 80 and 443 open
- No other services using port 80

### Install Certbot

```bash
apt install -y certbot
```

### Obtain Certificates

```bash
certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d admin.yourdomain.com \
  -d minio.yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

### Copy to Project

```bash
cd /opt/bffless  # or your installation directory

mkdir -p ssl
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
chmod 644 ssl/*.pem
```

## Auto-Renewal

Let's Encrypt certificates expire every 90 days. Set up automatic renewal.

### Create Renewal Script

```bash
mkdir -p /opt/scripts

cat > /opt/scripts/renew-ssl.sh << 'EOF'
#!/bin/bash
cd /opt/bffless
certbot renew --quiet \
  --pre-hook "docker compose stop nginx" \
  --post-hook "cp /etc/letsencrypt/live/*/fullchain.pem ssl/ && \
               cp /etc/letsencrypt/live/*/privkey.pem ssl/ && \
               docker compose start nginx"
EOF

chmod +x /opt/scripts/renew-ssl.sh
```

### Add Cron Job

```bash
# Run twice daily (standard for Let's Encrypt)
(crontab -l 2>/dev/null; echo "0 0,12 * * * /opt/scripts/renew-ssl.sh") | crontab -
```

### Test Renewal

```bash
certbot renew --dry-run
```

## Wildcard Certificates

For supporting dynamic subdomains, you may want a wildcard certificate.

### Using DNS Challenge

Wildcard certificates require DNS validation:

```bash
certbot certonly --manual \
  -d yourdomain.com \
  -d "*.yourdomain.com" \
  --preferred-challenges dns \
  --email your-email@example.com \
  --agree-tos
```

You'll be prompted to add a DNS TXT record. Add it to your DNS provider and wait for propagation.

### Using DNS Plugins

For automatic renewal, use a DNS provider plugin:

**Cloudflare:**

```bash
apt install -y python3-certbot-dns-cloudflare

# Create credentials file
cat > /etc/letsencrypt/cloudflare.ini << EOF
dns_cloudflare_api_token = YOUR_API_TOKEN
EOF
chmod 600 /etc/letsencrypt/cloudflare.ini

certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  -d yourdomain.com \
  -d "*.yourdomain.com"
```

**DigitalOcean:**

```bash
apt install -y python3-certbot-dns-digitalocean

cat > /etc/letsencrypt/digitalocean.ini << EOF
dns_digitalocean_token = YOUR_API_TOKEN
EOF
chmod 600 /etc/letsencrypt/digitalocean.ini

certbot certonly \
  --dns-digitalocean \
  --dns-digitalocean-credentials /etc/letsencrypt/digitalocean.ini \
  -d yourdomain.com \
  -d "*.yourdomain.com"
```

## Manual Certificates

If you have certificates from another provider:

```bash
mkdir -p ssl

# Copy your certificate files
cp /path/to/your/fullchain.pem ssl/fullchain.pem
cp /path/to/your/privkey.pem ssl/privkey.pem

chmod 644 ssl/*.pem
```

**Required files:**

- `ssl/fullchain.pem` - Full certificate chain (your cert + intermediate certs)
- `ssl/privkey.pem` - Private key

## Self-Signed Certificates (Development Only)

For local testing without a domain:

```bash
mkdir -p ssl

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/privkey.pem \
  -out ssl/fullchain.pem \
  -subj "/CN=localhost"
```

Note: Browsers will show security warnings with self-signed certificates.

## Changing Domains

When moving to a new domain:

### 1. Get New Certificates

```bash
certbot certonly --standalone \
  -d newdomain.com \
  -d www.newdomain.com \
  -d admin.newdomain.com \
  -d minio.newdomain.com \
  --email your-email@example.com \
  --agree-tos
```

### 2. Update Project

```bash
cp /etc/letsencrypt/live/newdomain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/newdomain.com/privkey.pem ssl/
chmod 644 ssl/*.pem
```

### 3. Update Environment

Edit `.env`:

```bash
PRIMARY_DOMAIN=newdomain.com
FRONTEND_URL=https://www.newdomain.com
PUBLIC_URL=https://www.newdomain.com
API_DOMAIN=https://www.newdomain.com
MINIO_BROWSER_REDIRECT_URL=https://minio.newdomain.com
```

### 4. Restart

```bash
./stop.sh
./start.sh
```

## Troubleshooting

### Certificate Not Found

```bash
# Check if certificates exist
ls -la /etc/letsencrypt/live/

# Check project ssl directory
ls -la ssl/
```

### Renewal Failing

```bash
# Check if port 80 is available
lsof -i :80

# Stop nginx temporarily
docker compose stop nginx

# Test renewal
certbot renew --dry-run

# Start nginx
docker compose start nginx
```

### Certificate Expired

```bash
# Force renewal
certbot renew --force-renewal

# Copy new certificates
cp /etc/letsencrypt/live/*/fullchain.pem ssl/
cp /etc/letsencrypt/live/*/privkey.pem ssl/

# Restart nginx
docker compose restart nginx
```

### Verify Certificate

```bash
# Check certificate details
openssl x509 -in ssl/fullchain.pem -text -noout | grep -E "(Subject:|Not After)"

# Check what domains are covered
openssl x509 -in ssl/fullchain.pem -text -noout | grep -A 1 "Subject Alternative Name"
```

## Security Best Practices

1. **Never share private keys** - Keep `privkey.pem` secure
2. **Set proper permissions** - `chmod 644 ssl/*.pem`
3. **Monitor expiration** - Set calendar reminders
4. **Test renewal** - Run `certbot renew --dry-run` monthly
5. **Backup certificates** - Store copies securely off-server
