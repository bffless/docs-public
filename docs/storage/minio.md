---
sidebar_position: 5
title: MinIO Setup
description: Configure MinIO as your self-hosted S3-compatible storage
---

# MinIO Setup

This guide explains how to configure MinIO as your storage provider for BFFless. MinIO is a high-performance, S3-compatible object storage that you can self-host.

## Overview

MinIO is ideal for:
- **Self-hosted deployments** where you control the infrastructure
- **Development environments** for testing without cloud costs
- **Air-gapped environments** without internet access
- **On-premises deployments** with data sovereignty requirements
- **Cost savings** compared to cloud storage for high-volume usage

## Option 1: Using BFFless's Built-in MinIO (Development)

BFFless includes MinIO in its Docker Compose setup for development:

```bash
# Start all services including MinIO
pnpm dev:full

# Or start just the services (PostgreSQL + MinIO)
pnpm dev:services
```

This starts MinIO on:
- **API**: `http://localhost:9000`
- **Console**: `http://localhost:9001`

Default credentials (from `.env`):
- **Access Key**: `minioadmin`
- **Secret Key**: `minioadmin`

## Option 2: Standalone MinIO Server

### Using Docker

```bash
# Create data directory
mkdir -p ~/minio/data

# Run MinIO
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -v ~/minio/data:/data \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  quay.io/minio/minio server /data --console-address ":9001"
```

### Using Docker Compose

```yaml
version: '3.8'
services:
  minio:
    image: quay.io/minio/minio:latest
    container_name: minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  minio_data:
```

## Step 1: Create a Bucket

### Via MinIO Console

1. Open MinIO Console at `http://localhost:9001`
2. Login with your credentials
3. Go to **Buckets** → **Create Bucket**
4. Enter bucket name (e.g., `bffless-storage`)
5. Click **Create Bucket**

### Via MinIO Client (mc)

```bash
# Configure mc
mc alias set myminio http://localhost:9000 minioadmin minioadmin

# Create bucket
mc mb myminio/bffless-storage

# Verify
mc ls myminio
```

## Step 2: Configure in BFFless

### Via Setup Wizard

1. Navigate to the BFFless setup wizard
2. Select **MinIO** as storage provider
3. Enter your configuration:
   - **Endpoint**: `http://localhost:9000` (or your MinIO URL)
   - **Bucket Name**: Your bucket name
   - **Access Key**: Your access key
   - **Secret Key**: Your secret key
   - **Use SSL**: Enable if using HTTPS
4. Click **Test Connection & Save**

### Via Environment Variables

```bash
# Storage provider type
STORAGE_TYPE=minio

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_BUCKET=bffless-storage
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
```

## Production Deployment

### TLS/SSL Configuration

1. Generate or obtain TLS certificates
2. Place certificates in MinIO's certs directory:
   ```
   ~/.minio/certs/
   ├── public.crt
   └── private.key
   ```
3. MinIO will automatically use HTTPS

### Reverse Proxy with Nginx

```nginx
upstream minio {
    server 127.0.0.1:9000;
}

upstream minio-console {
    server 127.0.0.1:9001;
}

server {
    listen 443 ssl;
    server_name storage.example.com;

    ssl_certificate /etc/nginx/certs/storage.crt;
    ssl_certificate_key /etc/nginx/certs/storage.key;

    # Increase max body size for uploads
    client_max_body_size 1000m;

    location / {
        proxy_pass http://minio;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Troubleshooting

### "Connection Refused" Error

- Verify MinIO is running: `docker ps` or `systemctl status minio`
- Check the endpoint URL and port
- Verify firewall allows connections on port 9000

### "Access Denied" Error

- Verify access key and secret key are correct
- Check that the user/service account has the required policy
- Verify the bucket exists and user has access

### "Bucket Not Found" Error

- Verify the bucket name is correct
- Create the bucket if it doesn't exist
- Check for typos (bucket names are case-sensitive)

### Slow Performance

1. **Enable BFFless caching** to reduce MinIO requests
2. **Use SSD storage** for MinIO data directory
3. **Increase MinIO resources** (CPU, memory)

## Backup and Recovery

### Backup with mc mirror

```bash
# Mirror to local directory
mc mirror myminio/bffless-storage /backup/bffless-storage

# Mirror to another MinIO/S3
mc mirror myminio/bffless-storage backup-minio/bffless-storage
```

### Point-in-Time Recovery

Enable versioning for bucket:

```bash
mc version enable myminio/bffless-storage
```

## Security Best Practices

1. **Never use root credentials in production**
2. **Enable TLS** for all connections
3. **Use strong passwords** (min 8 characters)
4. **Create per-application service accounts**
5. **Apply least-privilege policies**
6. **Enable audit logging**
7. **Keep MinIO updated** to latest version
8. **Use network segmentation** - don't expose MinIO publicly
9. **Enable encryption at rest** with KMS
10. **Regular backups** to separate storage

## Related Guides

- [Caching Setup](/storage/caching)
- [Migration Guide](/storage/migration-guide)
- [AWS S3 Setup](/storage/aws-s3) (MinIO is S3-compatible)
