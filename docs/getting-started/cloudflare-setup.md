---
sidebar_position: 2
title: Cloudflare Setup
description: Set up Cloudflare for free SSL, CDN, and DDoS protection
---

# Cloudflare Setup

**Cloudflare is the recommended approach for self-hosted deployments.** It provides:

- SSL certificates with up to 15 years validity (no renewal needed)
- DDoS protection and CDN caching
- Easy DNS management
- No need for certbot or port 80 access

:::tip Free Setup
Both Cloudflare and Let's Encrypt provide free SSL certificates. Your only cost is server hosting, which typically runs $5-20/month depending on your provider.
:::

## Overview

With Cloudflare, traffic flows like this:

```mermaid
flowchart LR
    User["User"]
    CF["Cloudflare"]
    Server["Your Server"]

    User -->|"Universal SSL"| CF
    CF -->|"Origin Certificate"| Server
```

Cloudflare provides two layers of encryption:

1. **Universal SSL** - Free certificate between users and Cloudflare (automatic)
2. **Origin Certificate** - Certificate between Cloudflare and your server (you set this up)

## Step 1: Add Your Domain to Cloudflare

If your domain isn't already on Cloudflare:

1. Create a free account at [cloudflare.com](https://cloudflare.com)
2. Click **Add a Site** and enter your domain
3. Select the **Free** plan
4. Cloudflare will scan your existing DNS records
5. **Update your domain's nameservers** at your registrar to point to Cloudflare:
   - Cloudflare will show you two nameservers (e.g., `anna.ns.cloudflare.com`, `bob.ns.cloudflare.com`)
   - Log into your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
   - Find the nameserver settings and replace them with Cloudflare's nameservers
   - Wait for propagation (can take up to 24 hours, usually faster)

:::tip Checking Nameserver Propagation

```bash
dig NS yourdomain.com +short
```

You should see Cloudflare nameservers in the output.
:::

## Step 2: Get Your Server's IP Address

On your server, run:

```bash
curl -4 ifconfig.me && echo
```

This prints your server's public IP address. Note it down - you'll need it for DNS records.

## Step 3: Create DNS Records

In the Cloudflare Dashboard, go to **DNS > Records** and add these A records:

| Type | Name    | Content          | Proxy Status           |
| ---- | ------- | ---------------- | ---------------------- |
| A    | `@`     | `YOUR_SERVER_IP` | Proxied (orange cloud) |
| A    | `www`   | `YOUR_SERVER_IP` | Proxied (orange cloud) |
| A    | `admin` | `YOUR_SERVER_IP` | Proxied (orange cloud) |
| A    | `minio` | `YOUR_SERVER_IP` | Proxied (orange cloud) |
| A    | `*`     | `YOUR_SERVER_IP` | Proxied (orange cloud) |

:::info Wildcard Record
The `*` (wildcard) record is needed for subdomain-based site deployments (e.g., `mysite.yourdomain.com`).
:::

## Step 4: Generate an Origin Certificate

Origin Certificates encrypt traffic between Cloudflare and your server.

1. In Cloudflare Dashboard, go to **SSL/TLS > Origin Server**
2. Click **Create Certificate**
3. Keep the default options:
   - **Generate private key and CSR with Cloudflare**
   - **Key type:** RSA (2048)
4. Hostnames should already include `yourdomain.com` and `*.yourdomain.com` (keep these defaults)
5. Select **Certificate Validity:** 15 years (recommended)
6. Click **Create**

You'll see two text blocks:

- **Origin Certificate** - The certificate (starts with `-----BEGIN CERTIFICATE-----`)
- **Private Key** - The key (starts with `-----BEGIN PRIVATE KEY-----`)

:::warning Save Both Values
**Copy both the certificate and private key now.** The private key is only shown once and cannot be retrieved later. You'll paste these during the installer setup.
:::

## Step 5: Set SSL Mode to Full (Strict)

This ensures end-to-end encryption:

1. In Cloudflare Dashboard, go to **SSL/TLS > Overview**
2. Set SSL/TLS encryption mode to **Full (strict)**

:::caution Don't Use "Flexible"
**Flexible** mode means traffic between Cloudflare and your server is unencrypted. Always use **Full (strict)** with Origin Certificates.
:::

## Step 6: Run the Installer

Now you're ready to run the BFFless installer.

**From your local machine**, SSH into your server:

```bash
ssh root@YOUR_SERVER_IP
```

Once connected, run the installer:

```bash
INSTALL_DIR=/opt/bffless sh -c "$(curl -fsSL https://raw.githubusercontent.com/bffless/ce/main/install.sh)"
```

This installs BFFless to `/opt/bffless`.

When prompted:

- Enter your domain name
- Select **Cloudflare** when asked about CDN/proxy configuration
- **Paste your Origin Certificate** when prompted (the full text including `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----`)
- **Paste your Private Key** when prompted (the full text including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

The installer will save the certificates to the correct location automatically.

## Step 7: Start and Complete Setup

```bash
cd /opt/bffless
./start.sh
```

Visit `https://admin.yourdomain.com` to complete the setup wizard.

👉 **[Setup Wizard Guide](/getting-started/setup-wizard)** - Detailed walkthrough of the setup wizard

## Recommended Cloudflare Settings

For optimal performance, configure these settings in Cloudflare:

**SSL/TLS:**

- Encryption mode: **Full (strict)**
- Always Use HTTPS: **On**
- Minimum TLS Version: **1.2**

**Speed > Optimization:**

- Auto Minify: **JavaScript, CSS, HTML** (all enabled)
- Brotli: **On**

**Caching > Configuration:**

- Caching Level: **Standard**
- Browser Cache TTL: **4 hours** or higher

**Security:**

- Security Level: **Medium**
- Bot Fight Mode: **On** (optional)

## Next Steps

- [Configuration](/configuration/environment-variables) - All configuration options
- [Site Management](/site-management/creating-sites) - Create your first site
- [CI/CD Integration](/ci-cd/github-actions) - Set up automated deployments

## Troubleshooting

### SSL Certificate Errors

If you see certificate errors after setup:

1. Verify SSL mode is set to **Full (strict)** in Cloudflare
2. Check that you pasted the complete certificate including the `BEGIN` and `END` lines
3. Ensure the Origin Certificate hostnames include your domain and `*.yourdomain.com`

### DNS Not Propagated

```bash
# Check if DNS is pointing to your server
dig yourdomain.com +short

# Should show your server's IP address
```

If DNS isn't propagated, wait 5-30 minutes and try again.

### Orange Cloud vs Gray Cloud

- **Orange cloud (Proxied)**: Traffic goes through Cloudflare - recommended
- **Gray cloud (DNS only)**: Traffic goes directly to your server - won't get Cloudflare benefits

Make sure all records show the orange cloud icon.
