---
sidebar_position: 2
title: Storage Backends
description: Configure object storage for your BFFless deployment
---

# Storage Backends

Configure object storage for your BFFless deployment.

## Overview

BFFless supports multiple storage backends through a pluggable adapter system. All storage operations use a common interface, allowing you to switch backends without code changes.

| Backend | Best For | Pros | Cons |
|---------|----------|------|------|
| MinIO | Self-hosted production | Full control, S3-compatible, included in Docker | Self-managed |
| Local | Development only | Simple, no setup | Not for production |
| AWS S3 | Cloud deployments | Highly reliable, scalable | Cost, AWS dependency |
| GCS | GCP users | Integrated with GCP | GCP dependency |
| Azure Blob | Azure users | Integrated with Azure | Azure dependency |

---

## MinIO (Recommended for Self-Hosted)

MinIO is an S3-compatible object storage server included in the default Docker Compose stack.

### Default Docker Configuration

MinIO runs automatically when you start the platform:

```env
STORAGE_TYPE=minio
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=assets
MINIO_USE_SSL=false
```

### MinIO Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MINIO_ROOT_USER` | `minioadmin` | MinIO admin username (for MinIO server) |
| `MINIO_ROOT_PASSWORD` | `changeme` | MinIO admin password (for MinIO server) |
| `MINIO_ENDPOINT` | `minio` | MinIO server hostname |
| `MINIO_PORT` | `9000` | MinIO API port |
| `MINIO_ACCESS_KEY` | `minioadmin` | Access key for backend connection |
| `MINIO_SECRET_KEY` | `changeme` | Secret key for backend connection |
| `MINIO_BUCKET` | `assets` | Bucket name for storing assets |
| `MINIO_USE_SSL` | `false` | Use HTTPS for MinIO connections |

### Accessing MinIO Console

The MinIO web console is available at:

- **Docker**: `http://localhost:9001` or `https://minio.yourdomain.com`
- **Credentials**: `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`

### External MinIO Server

To use an external MinIO server instead of the bundled one:

```env
STORAGE_TYPE=minio
MINIO_ENDPOINT=minio.example.com
MINIO_PORT=443
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=assets
MINIO_USE_SSL=true
```

Then remove or disable the `minio` service in docker-compose.yml.

---

## Local Storage (Development Only)

Store files directly on the local filesystem. Simple but not suitable for production.

```env
STORAGE_TYPE=local
```

Files are stored in `apps/backend/uploads/` by default.

**Limitations**:
- No redundancy
- Not scalable
- Tied to single server
- Not suitable for container orchestration

---

## AWS S3

Use Amazon S3 for cloud-native deployments.

### Configuration

```env
STORAGE_TYPE=s3
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### S3 Variables

| Variable | Description |
|----------|-------------|
| `S3_REGION` | AWS region (e.g., `us-east-1`) |
| `S3_BUCKET` | S3 bucket name |
| `S3_ACCESS_KEY_ID` | AWS access key ID |
| `S3_SECRET_ACCESS_KEY` | AWS secret access key |
| `S3_ENDPOINT` | Custom endpoint (for S3-compatible services) |

### IAM Policy

Create an IAM user with this minimal policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/*",
        "arn:aws:s3:::your-bucket-name"
      ]
    }
  ]
}
```

See [AWS S3 Setup](/storage/aws-s3) for detailed configuration.

---

## Google Cloud Storage

Use GCS for deployments on Google Cloud Platform.

### Configuration

```env
STORAGE_TYPE=gcs
GCS_PROJECT_ID=your-project-id
GCS_BUCKET=your-bucket-name
GCS_KEYFILE_PATH=/path/to/service-account.json
```

### GCS Variables

| Variable | Description |
|----------|-------------|
| `GCS_PROJECT_ID` | GCP project ID |
| `GCS_BUCKET` | GCS bucket name |
| `GCS_KEYFILE_PATH` | Path to service account JSON key file |

See [Google Cloud Storage Setup](/storage/google-cloud-storage) for detailed configuration.

---

## Azure Blob Storage

Use Azure Blob Storage for deployments on Microsoft Azure.

### Configuration

```env
STORAGE_TYPE=azure
AZURE_STORAGE_ACCOUNT=youraccount
AZURE_STORAGE_ACCESS_KEY=your-access-key
AZURE_CONTAINER=assets
```

### Azure Variables

| Variable | Description |
|----------|-------------|
| `AZURE_STORAGE_ACCOUNT` | Azure storage account name |
| `AZURE_STORAGE_ACCESS_KEY` | Storage account access key |
| `AZURE_CONTAINER` | Blob container name |

See [Azure Blob Storage Setup](/storage/azure-blob-storage) for detailed configuration.

---

## Storage Key Format

All storage backends use a consistent key format:

```
{owner}/{repo}/{commitSha}/{path}/{filename}
```

Examples:
- `acme-corp/web-app/abc123/index.html`
- `acme-corp/web-app/abc123/css/style.css`
- `acme-corp/web-app/abc123/images/logo.png`

Benefits:
- **Immutability**: SHA-based paths ensure content integrity
- **Organization**: Matches GitHub repository structure
- **Migration**: Easy to move between storage backends

---

## Switching Storage Backends

To switch from one storage backend to another:

1. **Update `.env`** with new storage configuration
2. **Restart the backend**:
   ```bash
   docker compose restart backend
   ```
3. **Test** with a new upload

**Important**: Existing files are NOT automatically migrated. You'll need to:
- Keep the old storage accessible, or
- Manually migrate files using tools like `mc` (MinIO client), `aws s3 sync`, or `gsutil`

See [Migration Guide](/storage/migration-guide) for detailed migration instructions.

---

## Storage Security

### Credentials Encryption

Storage credentials (access keys, secret keys) are encrypted in the database using `ENCRYPTION_KEY`. This ensures credentials are protected even if the database is compromised.

### Best Practices

1. **Use unique credentials** for each environment
2. **Rotate keys** periodically
3. **Enable bucket versioning** for recovery
4. **Set appropriate bucket policies** - avoid public access
5. **Use IAM roles** when possible (AWS, GCP, Azure)
6. **Enable access logging** for audit trails

---

## Troubleshooting

### "Bucket not found"

The bucket doesn't exist. Create it manually:

```bash
# MinIO Console
# Visit http://localhost:9001 and create the bucket

# Or using mc
mc mb local/assets
```

### "Access denied"

Check credentials match between `.env` and storage provider:

```bash
# Verify MinIO credentials
docker compose exec minio mc admin info local
```

### "Connection refused"

Storage service isn't running or endpoint is wrong:

```bash
# Check MinIO status
docker compose ps minio
docker compose logs minio

# Verify endpoint
curl http://localhost:9000/minio/health/live
```

### Storage credentials invalid after restart

If you changed `ENCRYPTION_KEY` after initial setup, existing encrypted credentials are invalid. You'll need to reconfigure storage through the setup wizard.

---

## Related Documentation

- [Environment Variables](/configuration/environment-variables) - All configuration options
- [Architecture](/reference/architecture) - Storage adapter system
- [Troubleshooting](/troubleshooting) - Common issues
