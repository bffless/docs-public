---
sidebar_position: 7
title: Migration Guide
description: Migrate data between storage providers
---

# Storage Migration Guide

This guide explains how to migrate data between storage providers in BFFless.

## Overview

BFFless supports migrating data between any combination of storage providers:

- Local filesystem
- MinIO
- AWS S3 (and S3-compatible services)
- Google Cloud Storage
- Azure Blob Storage

## Before You Start

### Pre-Migration Checklist

- [ ] **Backup your data** - Always maintain a backup before migration
- [ ] **Verify target credentials** - Test connection to new provider
- [ ] **Estimate migration time** - Large datasets take longer
- [ ] **Schedule downtime** - Migration may affect availability
- [ ] **Check storage costs** - Understand pricing of new provider
- [ ] **Verify disk space** - Ensure target has sufficient capacity

### Migration Time Estimates

| Data Size | Estimated Time | Notes |
|-----------|----------------|-------|
| < 1 GB | 1-5 minutes | Quick migration |
| 1-10 GB | 5-30 minutes | Plan for brief downtime |
| 10-100 GB | 30 min - 3 hours | Schedule maintenance window |
| > 100 GB | 3+ hours | Consider off-peak migration |

Times vary based on:
- Network speed between source and target
- File count (many small files are slower)
- Storage provider performance
- Concurrency settings

## Migration Process

### Step 1: Configure New Provider

1. Navigate to **Settings** → **Storage**
2. Click **Change Provider**
3. Select your new storage provider
4. Enter configuration details
5. Click **Test Connection** (does not start migration)

### Step 2: Review Migration Scope

After successful connection test:

1. Review the migration summary:
   - Total file count
   - Total data size
   - Estimated migration time
2. Verify source and target providers are correct

### Step 3: Start Migration

1. Click **Start Migration**
2. Confirm the migration in the dialog

The migration runs in the background. You can:
- Monitor progress in the UI
- Continue using BFFless (with degraded performance)
- Cancel if needed

### Step 4: Monitor Progress

The migration screen displays:

| Metric | Description |
|--------|-------------|
| **Files Migrated** | X / Total files transferred |
| **Data Transferred** | X GB / Total GB |
| **Elapsed Time** | Time since migration started |
| **Estimated Remaining** | Approximate time to completion |
| **Current File** | File currently being migrated |
| **Errors** | Count of failed files |

### Step 5: Verify and Complete

After migration completes:

1. **Verify file counts match** - Source and target should have same count
2. **Test a few deployments** - Access some files to verify
3. **Check presigned URLs work** - Test download links
4. Click **Complete Migration** to switch to new provider

## Migration Options

### Concurrency

Control how many files are transferred simultaneously:

| Value | Use Case |
|-------|----------|
| 1-3 | Rate-limited providers, slow networks |
| 5 | Default, balanced performance |
| 10-20 | Fast networks, high-performance storage |

### Integrity Verification

Enable checksum verification (recommended) to compare MD5/ETag after each file transfer to ensure data integrity.

### Continue on Error

Control behavior when individual files fail:

- `true`: Skip failed files, continue migration
- `false`: Stop migration on first error

## Rollback

### Before Completion

If migration is in progress or paused:

1. Click **Cancel Migration**
2. Original data remains intact
3. Delete incomplete data on target (optional)

### After Completion

If you've completed migration but need to rollback:

1. Navigate to **Settings** → **Storage**
2. Click **Change Provider**
3. Select your original provider
4. Enter original configuration
5. Start a new migration back to original

:::note
Original data must still exist for rollback to work.
:::

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| **Connection Failed** | Network or credential issues | Verify credentials and connectivity |
| **Access Denied** | Insufficient permissions | Check IAM roles/policies |
| **Quota Exceeded** | Target storage full | Increase quota or cleanup |
| **Rate Limited** | Too many requests | Reduce concurrency |
| **Timeout** | Slow network or large file | Increase timeout, retry |

### Failed Files

If some files fail to migrate:

1. Check the error log in migration details
2. Common causes:
   - Corrupted source files
   - Permission issues
   - Network timeouts
3. After fixing issues, you can:
   - Retry failed files manually
   - Re-run migration (already migrated files are skipped)

## Best Practices

### Planning

1. **Test with small dataset first** - Use prefix filter to migrate one repo
2. **Schedule during low traffic** - Minimize impact on users
3. **Notify users** - Communicate maintenance window
4. **Have rollback plan** - Keep original data accessible

### During Migration

1. **Monitor progress** - Watch for errors
2. **Don't restart BFFless** - Migration state is in memory
3. **Minimize writes** - New uploads may not be migrated
4. **Keep terminal open** - If running manually

### After Migration

1. **Verify thoroughly** - Test multiple deployments
2. **Monitor for issues** - Watch logs for errors
3. **Keep original data** - Don't delete until confident
4. **Update documentation** - Record new provider details

## Migration Scenarios

### Local to Cloud

Migrating from local filesystem to cloud storage:

1. Set up cloud provider (S3/GCS/Azure)
2. Create bucket/container
3. Configure credentials
4. Start migration
5. Verify all files accessible via presigned URLs

### Between Cloud Providers

Migrating between cloud providers (e.g., S3 to GCS):

1. Data transfers via BFFless server
2. Consider network egress costs
3. May take longer due to double network transfer
4. Consider direct cloud-to-cloud tools for large datasets

### Cloud to Self-Hosted

Migrating from cloud to MinIO or local:

1. Ensure sufficient local storage
2. Network bandwidth is key factor
3. No egress costs after migration
4. Consider data sovereignty requirements

## Troubleshooting

### Migration Stuck

If migration appears stuck:

1. Check current file in progress (might be large)
2. Check network connectivity
3. Check source/target storage health
4. View logs for errors
5. Consider reducing concurrency

### Out of Memory

If BFFless runs out of memory during migration:

1. Reduce concurrency
2. Restart BFFless and resume migration
3. Increase server memory
4. Split migration into smaller batches using prefix filter

### Data Mismatch

If file counts don't match after migration:

1. Check error log for failed files
2. Re-run migration (already migrated files are skipped)
3. Manually migrate failed files
4. Compare file listings from both sources

## Related Guides

- [AWS S3 Setup](/storage/aws-s3)
- [Google Cloud Storage Setup](/storage/google-cloud-storage)
- [Azure Blob Storage Setup](/storage/azure-blob-storage)
- [MinIO Setup](/storage/minio)
- [Caching Setup](/storage/caching)
