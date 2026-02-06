---
sidebar_position: 1
title: Quick Start
description: Deploy BFFless in under 5 minutes using the automated installer
---

# Quick Start

Deploy BFFless in under 5 minutes using the automated installer.

## Prerequisites

- A Linux server (Ubuntu 22.04+ recommended)
- Docker and Docker Compose installed
- A domain name with DNS pointing to your server
- Ports 80 and 443 open

## One-Line Install

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/bffless/ce/main/install.sh)"
```

The installer will:
1. Clone the repository
2. Guide you through configuration
3. Set up SSL certificates
4. Start all services

## What You'll Need

During setup, you'll be prompted for:

| Item | Example | Notes |
|------|---------|-------|
| Domain name | `example.com` | Must have DNS A records pointing to your server |
| Email address | `admin@example.com` | For SSL certificate notifications |

## After Installation

Once complete, access your platform at:

- **Admin Panel**: `https://admin.yourdomain.com`
- **Welcome Page**: `https://www.yourdomain.com`
- **MinIO Console**: `https://minio.yourdomain.com`

The first time you visit, you'll complete the setup wizard to:
- Create an admin user
- Configure storage settings
- Generate API keys for CI/CD

## Custom Installation

### Specify Installation Directory

```bash
INSTALL_DIR=/opt/bffless sh -c "$(curl -fsSL https://raw.githubusercontent.com/bffless/ce/main/install.sh)"
```

### Specify a Branch or Tag

```bash
BRANCH=v1.0.0 sh -c "$(curl -fsSL https://raw.githubusercontent.com/bffless/ce/main/install.sh)"
```

## Next Steps

- [Manual Setup](/getting-started/manual-setup) - Detailed step-by-step installation
- [Local Development](/getting-started/local-development) - Set up a development environment
- [Configuration](/configuration/environment-variables) - All configuration options

## Troubleshooting

### DNS Not Propagated

If SSL certificate generation fails, wait 5-30 minutes for DNS to propagate, then re-run the installer.

### Port Already in Use

Ensure ports 80 and 443 are available:

```bash
# Check what's using the ports
sudo lsof -i :80
sudo lsof -i :443

# Stop nginx/apache if running
sudo systemctl stop nginx apache2
```

### Docker Not Installed

Install Docker first:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

For more issues, see the [Troubleshooting Guide](/troubleshooting).
