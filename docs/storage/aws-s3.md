---
sidebar_position: 2
title: AWS S3 Setup
description: Configure Amazon S3 as your storage provider
---

# AWS S3 Storage Setup

This guide explains how to configure Amazon S3 as your storage provider for BFFless.

## Prerequisites

- AWS Account
- S3 bucket created (or permissions to create one)
- IAM user or role with S3 permissions

## Step 1: Create an S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click **Create bucket**
3. Enter a unique bucket name (e.g., `my-bffless-storage`)
4. Select your preferred region (e.g., `us-east-1`)
5. **Block Public Access**: Keep enabled (BFFless uses presigned URLs)
6. Leave other settings as defaults
7. Click **Create bucket**

### Recommended Bucket Settings

After creation, configure these optional settings:

- **Versioning**: Enable for data protection (optional)
- **Lifecycle Rules**: Set expiration for old versions if versioning is enabled
- **Encryption**: Enable server-side encryption (SSE-S3 or SSE-KMS)

## Step 2: Create IAM Credentials

### Option A: IAM User (Recommended for non-AWS deployments)

Use this option when BFFless is deployed outside AWS (e.g., DigitalOcean, self-hosted).

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Navigate to **Users** → **Create user**
3. Enter a username (e.g., `bffless-storage-user`)
4. Click **Next**
5. Select **Attach policies directly**
6. Click **Create policy** (opens in a new tab)
7. In the policy editor, click the **JSON** tab (top right of the Policy editor)
8. Delete the default content and paste the [IAM Policy JSON below](#iam-policy)
9. Click **Next**
10. Enter a policy name (e.g., `bffless-s3-access`)
11. Click **Create policy**
12. Return to the user creation tab and click the **refresh icon** (⟳) next to "Create policy"
13. Search for your policy name (e.g., `bffless-s3-access`) and check the box to select it
14. Click **Next** → **Create user**
15. Click on the new user → **Security credentials** tab → **Create access key**
16. Select **Application running outside AWS** → **Next**
17. **Save the Access Key ID and Secret Access Key** (the secret is shown only once)

### Option B: IAM Role (Recommended for AWS deployments)

Use this option when BFFless runs on AWS (EC2, ECS, Lambda, EKS).

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Navigate to **Roles** → **Create role**
3. Select the appropriate trusted entity:
   - **EC2**: For EC2 instances
   - **ECS Task**: For ECS/Fargate containers
   - **Lambda**: For Lambda functions
4. Attach the policy below
5. Name the role (e.g., `bffless-storage-role`)
6. Assign the role to your AWS resource

## IAM Policy

Minimum required permissions for BFFless:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BFFlessStorageAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetObjectAttributes",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    }
  ]
}
```

Replace `YOUR-BUCKET-NAME` with your actual bucket name.

## Step 3: Configure in BFFless

### Via Setup Wizard

1. Navigate to the BFFless setup wizard
2. Select **AWS S3** as storage provider
3. Enter your configuration:
   - **Region**: Your bucket's region (e.g., `us-east-1`)
   - **Bucket Name**: Your bucket name
   - **Access Key ID**: From Step 2 (if using IAM user)
   - **Secret Access Key**: From Step 2 (if using IAM user)
4. Click **Test Connection & Save**

### Via Environment Variables

```bash
# Storage provider type
STORAGE_TYPE=s3

# S3 Configuration
S3_REGION=us-east-1
S3_BUCKET=my-bffless-storage
S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

## Using S3-Compatible Services

BFFless supports S3-compatible services like DigitalOcean Spaces, Backblaze B2, Cloudflare R2, and Wasabi.

### Provider-Specific Settings

| Provider | Endpoint | Path Style | Notes |
|----------|----------|------------|-------|
| **DigitalOcean Spaces** | `https://{region}.digitaloceanspaces.com` | No | Region examples: `nyc3`, `sfo3`, `ams3` |
| **Backblaze B2** | `https://s3.{region}.backblazeb2.com` | Yes | Get endpoint from B2 bucket settings |
| **Cloudflare R2** | `https://{account-id}.r2.cloudflarestorage.com` | Yes | Find account ID in Cloudflare dashboard |
| **Wasabi** | `https://s3.{region}.wasabisys.com` | No | Region examples: `us-east-1`, `eu-central-1` |
| **MinIO** | `https://your-minio-server:9000` | Yes | Self-hosted MinIO instance |

### Example: DigitalOcean Spaces

```
Region: nyc3
Bucket: my-space-name
Endpoint: https://nyc3.digitaloceanspaces.com
Access Key ID: (from DO API settings)
Secret Access Key: (from DO API settings)
Force Path Style: No
```

### Example: Cloudflare R2

```
Region: auto
Bucket: my-r2-bucket
Endpoint: https://abc123.r2.cloudflarestorage.com
Access Key ID: (from R2 API tokens)
Secret Access Key: (from R2 API tokens)
Force Path Style: Yes
```

## Troubleshooting

### "Access Denied" Error

- Verify the IAM policy is attached to your user/role
- Check that the bucket name in the policy matches exactly
- Ensure the region is correct
- If using IAM role, verify the role is attached to your AWS resource

### "Bucket Not Found" Error

- Verify the bucket exists in the S3 console
- Check for typos in the bucket name
- Remember: S3 bucket names are globally unique
- Ensure you're using the correct region

### "Invalid Credentials" Error

- Verify Access Key ID and Secret Access Key are correct
- Check that the IAM user/role is active (not deleted)
- Ensure no extra whitespace in credentials

### Slow Performance

1. **Enable caching** in BFFless settings to reduce S3 requests
2. **Use a region closer to your users** for lower latency
3. **Consider CloudFront CDN** for edge caching

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use IAM roles** instead of access keys when running on AWS
3. **Enable bucket versioning** for data protection
4. **Enable server-side encryption** (SSE-S3 or SSE-KMS)
5. **Keep Block Public Access enabled** - BFFless uses presigned URLs
6. **Rotate access keys regularly** (every 90 days recommended)
7. **Use least-privilege IAM policies** - only grant required permissions

## Related Guides

- [Caching Setup](/storage/caching)
- [Migration Guide](/storage/migration-guide)
- [Google Cloud Storage Setup](/storage/google-cloud-storage)
- [Azure Blob Storage Setup](/storage/azure-blob-storage)
