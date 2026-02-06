---
sidebar_position: 5
title: GitHub Actions CI/CD
description: Automate deployments using the BFFless GitHub Action
---

# GitHub Actions CI/CD

Automate static asset deployments using the official BFFless GitHub Action.

## Overview

The `bffless/upload-artifact` action zips and uploads your build artifacts to BFFless. It handles:

- Zipping your build directory
- Uploading via the BFFless API
- Auto-detecting commit SHA and branch from GitHub context
- Writing deployment summaries to your workflow

## Quick Start

```yaml
- uses: bffless/upload-artifact@v1
  with:
    path: dist
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
```

Only 3 required inputs. Everything else is auto-detected from GitHub context.

## Setup

### 1. Get Your API Key

1. Go to your BFFless admin panel (`https://admin.yourdomain.com`)
2. Navigate to Settings → API Keys
3. Create a new API key
4. Copy the key (it won't be shown again)

### 2. Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions:

| Type | Name | Value |
|------|------|-------|
| Variable | `BFFLESS_URL` | `https://admin.yourdomain.com` |
| Secret | `BFFLESS_API_KEY` | Your API key |

### 3. Create Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to BFFless

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for commit timestamp detection

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install and build
        run: |
          npm ci
          npm run build

      - name: Deploy to BFFless
        uses: bffless/upload-artifact@v1
        with:
          path: dist
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}
```

## Examples

### PR Preview Deployments

Deploy previews for every pull request:

```yaml
name: PR Preview

on:
  pull_request:

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - run: npm ci && npm run build

      - uses: bffless/upload-artifact@v1
        id: deploy
        with:
          path: dist
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}
          alias: preview
          description: 'PR #${{ github.event.pull_request.number }} preview'

      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployed: ${{ steps.deploy.outputs.sha-url }}'
            })
```

### Production Deployments

Deploy to production on main branch:

```yaml
name: Production Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - run: npm ci && npm run build

      - uses: bffless/upload-artifact@v1
        id: deploy
        with:
          path: dist
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}
          alias: production
          description: 'Production deploy from ${{ github.sha }}'

      - run: echo "Deployed to ${{ steps.deploy.outputs.alias-url }}"
```

### Monorepo with Multiple Apps

Deploy multiple apps from the same repository:

```yaml
jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - run: npm ci && npm run build:frontend

      - uses: bffless/upload-artifact@v1
        with:
          path: apps/frontend/dist
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}
          alias: frontend-production

  deploy-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - run: npm ci && npm run build:docs

      - uses: bffless/upload-artifact@v1
        with:
          path: docs/build
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}
          alias: docs-production
          base-path: /docs/build
```

### With Proxy Rules

Apply proxy rules for API routing:

```yaml
- uses: bffless/upload-artifact@v1
  with:
    path: dist
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    proxy-rule-set-name: api-proxy
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `path` | **Yes** | - | Build directory to upload |
| `api-url` | **Yes** | - | BFFless platform URL |
| `api-key` | **Yes** | - | API key for authentication |
| `repository` | No | Current repo | Repository in `owner/repo` format |
| `commit-sha` | No | Auto-detected | Git commit SHA |
| `branch` | No | Auto-detected | Branch name |
| `is-public` | No | `true` | Public visibility |
| `alias` | No | - | Deployment alias (e.g., `production`) |
| `base-path` | No | `/<path>` | Path prefix in zip |
| `committed-at` | No | Auto-detected | ISO 8601 commit timestamp |
| `description` | No | - | Human-readable description |
| `proxy-rule-set-name` | No | - | Proxy rule set name |
| `proxy-rule-set-id` | No | - | Proxy rule set ID |
| `tags` | No | - | Comma-separated tags |
| `summary` | No | `true` | Write GitHub Step Summary |
| `summary-title` | No | `Deployment Summary` | Summary heading |
| `working-directory` | No | `.` | Working directory |

## Outputs

| Output | Description |
|--------|-------------|
| `deployment-url` | Primary URL (SHA-based) |
| `sha-url` | Immutable SHA-based URL |
| `alias-url` | Alias-based URL |
| `branch-url` | Branch-based URL |
| `preview-url` | Preview URL (if basePath provided) |
| `deployment-id` | API deployment ID |
| `file-count` | Number of files uploaded |
| `total-size` | Total bytes uploaded |
| `response` | Raw JSON response |

### Using Outputs

```yaml
- uses: bffless/upload-artifact@v1
  id: deploy
  with:
    path: dist
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}

- run: |
    echo "SHA URL: ${{ steps.deploy.outputs.sha-url }}"
    echo "Files: ${{ steps.deploy.outputs.file-count }}"
    echo "Size: ${{ steps.deploy.outputs.total-size }} bytes"
```

## How It Works

1. **Validates** the build directory exists and is non-empty
2. **Zips** the directory preserving path structure
3. **Uploads** via multipart POST to `/api/deployments/zip`
4. **Sets outputs** from the API response
5. **Writes Step Summary** with deployment info
6. **Cleans up** the temporary zip file

### Auto-Detection

The action automatically detects:

- **Repository**: from `github.repository`
- **Commit SHA**: PR events use `pull_request.head.sha`, push events use `github.sha`
- **Branch**: PR events use `pull_request.head.ref`, push events extract from `github.ref`
- **Committed At**: runs `git log -1 --format=%cI` (requires `fetch-depth: 0`)
- **Base Path**: derived from the `path` input

## Troubleshooting

### "Committed At" Not Detected

Ensure you're using `fetch-depth: 0` in checkout:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # Required for git log
```

### Upload Failed - 401 Unauthorized

- Verify your API key is correct
- Check the key hasn't been revoked
- Ensure `BFFLESS_API_KEY` secret is set

### Upload Failed - 404 Not Found

- Verify `BFFLESS_URL` is correct
- Check your BFFless instance is running
- Ensure the URL includes the protocol (`https://`)

### Build Directory Empty

- Verify your build command completed successfully
- Check the `path` input matches your build output directory
- Use `working-directory` if building in a subdirectory

## Related Documentation

- [Traffic Splitting](/features/traffic-splitting) - Route traffic between deployments
- [Proxy Rules](/features/proxy-rules) - Configure API proxying
- [API Reference](/reference/api) - Direct API usage
