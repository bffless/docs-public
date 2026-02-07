---
sidebar_position: 6
title: Viewing Deployments
description: Browse your deployments, set up aliases, and map domains
---

# Viewing Deployments

After your GitHub Action completes, your deployment will appear in BFFless. This guide covers how to browse deployments, set up aliases, and map domains to serve your content.

## Repository Overview

Navigate to your repository to see all deployments.

The repository page shows:

- **Recent Deployments** - Each commit that's been uploaded
- **Aliases** - Named pointers to specific deployments (e.g., `production`)
- **Storage Stats** - How much storage the repository is using

## Browsing Deployed Content

Click on any deployment to browse its contents:

<img src="/img/viewing-deployment-browser.png" alt="Deployment browser showing file tree, preview panel, and commit references" className="screenshot" />

- **File Browser** - Navigate through your deployed files and folders
- **Preview** - View HTML pages, images, and other assets directly in the browser
- **Deployment Info** - Commit SHA, upload time, file count, and size

:::tip Quick Preview
Click any HTML file to preview it directly. This is useful for reviewing changes before promoting to production.
:::

## Setting Up Aliases

Aliases provide stable URLs that point to specific deployments. Use them for:

- **production** - Your live site
- **staging** - Pre-production testing
- **preview** - Feature previews

<img src="/img/viewing-deployment-alias.png" alt="Repository Aliases tab showing production alias pointing to a deployment" className="screenshot" />

:::tip Automatic Aliases from GitHub Actions
If you followed the [First Deployment](/getting-started/first-deployment) guide, your GitHub Action already creates aliases automatically—`production` for the main branch and `preview` for feature branches.
:::

### Creating an Alias Manually

You can also create aliases manually:

1. Go to your repository and click the **Aliases** tab
2. Click **Create Alias**
3. Enter a name (e.g., `staging`)
4. Select the deployment to point to
5. Click **Create**

The alias URL will be:

```
https://admin.yourdomain.com/public/owner/repo/alias/production/
```

### Updating Aliases

You can update an alias to point to a different commit at any time—useful for rollbacks or promoting a specific version.

<img src="/img/viewing-deployment-alias-commit.png" alt="Update Alias dialog showing commit selection dropdown" className="screenshot" />

1. Go to the **Aliases** tab
2. Click the edit icon next to the alias you want to update
3. Select a different commit from the dropdown
4. Click **Update Alias**

This enables instant rollbacks—just point `production` to a previous commit.

### Alias Visibility

Each alias can have its own visibility setting:

- **Private** - Requires authentication to access
- **Public** - Accessible to anyone with the URL
- **Inherit from project** - Uses the repository's default visibility

This lets you keep `staging` private while making `production` public.

## Mapping Domains to Aliases

Connect your aliases to domains so users can access your deployments at friendly URLs like `www.yourdomain.com` or `app.yourdomain.com`.

### Using Your Primary Domain

The simplest option is to serve content on your primary domain (the one you configured during setup).

<img src="/img/viewing-deployment-primary-content.png" alt="Site Settings showing Primary Domain Content configuration" className="screenshot" />

1. From the homepage, click **Site Settings** in the Admin section
2. Enable **Primary domain content**
3. Select your **Repository** (e.g., `bffless/demo`)
4. Select the **Deployment Alias** (e.g., `production`)
5. Optionally set a **Path** if your build outputs to a subdirectory (e.g., `/dist`)
6. Optionally enable **Add www subdomain** to support both `yourdomain.com` and `www.yourdomain.com`
7. Enable **Single Page Application (SPA)** if using React, Vue, or Angular with client-side routing
8. Click **Save Changes**

Your app is now live on your primary domain!

<img src="/img/viewing-deployment-complete.png" alt="Demo app live on the primary domain" className="screenshot" />

## Next Steps

- [Traffic Splitting](/features/traffic-splitting) - A/B test between deployments
- [Share Links](/features/share-links) - Create personalized preview links
- [Proxy Rules](/features/proxy-rules) - Forward API requests to backend services
