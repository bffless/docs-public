---
sidebar_position: 4
title: Azure Blob Storage Setup
description: Configure Azure Blob Storage as your storage provider
---

# Azure Blob Storage Setup

This guide explains how to configure Azure Blob Storage as your storage provider for BFFless.

## Prerequisites

- Azure account with an active subscription
- Permissions to create storage accounts (or an existing one)

## Step 1: Create a Storage Account

1. Go to [Azure Portal](https://portal.azure.com/)
2. Search for **Storage accounts** and click **Create**
3. Configure the basics:
   - **Subscription**: Select your subscription
   - **Resource group**: Create new or use existing
   - **Storage account name**: Unique name (e.g., `bfflessstorage123`)
   - **Region**: Choose closest to your users
   - **Performance**: Standard (recommended) or Premium
   - **Redundancy**: Choose based on your needs (see below)
4. Click **Review + create** → **Create**

### Redundancy Options

| Option | Description | Use Case |
|--------|-------------|----------|
| **LRS** | 3 copies in one datacenter | Development, non-critical data |
| **ZRS** | 3 copies across availability zones | Production, high availability |
| **GRS** | 6 copies across two regions | Disaster recovery |
| **GZRS** | ZRS + GRS combined | Mission-critical applications |

## Step 2: Create a Container

1. Open your storage account
2. Go to **Data storage** → **Containers**
3. Click **+ Container**
4. Enter a name (e.g., `bffless-assets`)
5. **Public access level**: Private (BFFless uses SAS URLs)
6. Click **Create**

## Step 3: Get Authentication Credentials

### Option A: Account Key (Simple, for development)

1. Open your storage account
2. Go to **Security + networking** → **Access keys**
3. Click **Show** next to key1
4. Copy the **Storage account name** and **Key**

:::warning
Account keys provide full access to your storage account. Use Managed Identity or SAS tokens in production.
:::

### Option B: Connection String

1. Open your storage account
2. Go to **Security + networking** → **Access keys**
3. Copy the **Connection string** for key1

### Option C: Managed Identity (Recommended for Azure deployments)

Use this when BFFless runs on Azure (VMs, App Service, AKS, Container Apps).

1. Enable system-assigned managed identity on your Azure resource:
   - **App Service**: Settings → Identity → System assigned → On
   - **VM**: Settings → Identity → System assigned → On
   - **AKS**: Use workload identity or pod identity

2. Grant the identity access to storage:
   ```bash
   az role assignment create \
     --assignee <managed-identity-object-id> \
     --role "Storage Blob Data Contributor" \
     --scope /subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/<account>
   ```

## Step 4: Configure in BFFless

### Via Setup Wizard

1. Navigate to the BFFless setup wizard
2. Select **Azure Blob Storage** as storage provider
3. Enter your configuration:
   - **Account Name**: Your storage account name
   - **Container Name**: Your container name
   - **Authentication Method**: Choose one:
     - **Account Key**: Paste the storage account key
     - **Connection String**: Paste the full connection string
     - **Managed Identity**: For Azure-hosted BFFless
4. Click **Test Connection & Save**

### Via Environment Variables

```bash
# Storage provider type
STORAGE_TYPE=azure

# Azure Blob Storage Configuration
AZURE_STORAGE_ACCOUNT=bfflessstorage123
AZURE_STORAGE_CONTAINER=bffless-assets

# Option 1: Account Key
AZURE_STORAGE_KEY=your-storage-account-key

# Option 2: Connection String
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"

# Option 3: Managed Identity (no additional config needed)
# Just don't set AZURE_STORAGE_KEY or AZURE_STORAGE_CONNECTION_STRING
```

## Access Tiers

Azure Blob Storage offers different access tiers:

| Tier | Use Case | Storage Cost | Access Cost |
|------|----------|--------------|-------------|
| **Hot** | Frequently accessed | Higher | Lower |
| **Cool** | Infrequent access (30+ days) | Lower | Higher |
| **Cold** | Rare access (90+ days) | Even lower | Even higher |
| **Archive** | Long-term backup | Lowest | Highest + rehydration time |

## Troubleshooting

### "AuthorizationFailure" Error

- Verify the account key or connection string is correct
- Check that the storage account exists and is accessible
- For Managed Identity, verify the role assignment is correct
- Ensure the container exists

### "ContainerNotFound" Error

- Verify the container name is correct
- Check for typos (container names are case-sensitive)
- Ensure the container exists in the storage account

### "AuthenticationFailed" Error

- Account key may be incorrect or rotated
- Connection string may be malformed
- Managed Identity may not have the required role
- Check if storage account firewall is blocking access

### Slow Performance

1. **Enable BFFless caching** to reduce blob storage requests
2. **Use a region closer to your users**
3. **Consider Azure CDN** for edge caching

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use Managed Identity** when running on Azure
3. **Rotate storage keys** regularly (every 90 days)
4. **Enable soft delete** for accidental deletion protection
5. **Use Private endpoints** for network isolation
6. **Enable Azure Defender for Storage** for threat detection
7. **Enable storage analytics logging** for audit trails
8. **Use customer-managed keys (CMK)** for encryption
9. **Disable public blob access** at the storage account level

## Related Guides

- [Caching Setup](/storage/caching)
- [Migration Guide](/storage/migration-guide)
- [AWS S3 Setup](/storage/aws-s3)
- [Google Cloud Storage Setup](/storage/google-cloud-storage)
