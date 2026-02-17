---
sidebar_position: 3
title: Download Artifact
description: Download deployed artifacts from BFFless using GitHub Actions
---

# Download Artifact Action

The `bffless/download-artifact` action downloads previously deployed artifacts from BFFless back into your workflow.

## Use Cases

- Deploying the same build to multiple environments
- Running tests against a deployed build
- Promoting a staging deployment to production
- Sharing builds across repositories

## Quick Start

```yaml
- uses: bffless/download-artifact@v1
  with:
    source-path: dist
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    alias: staging
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api-url` | **Yes** | - | BFFless platform URL |
| `api-key` | **Yes** | - | API key for authentication |
| `source-path` | **Yes** | - | Path of files to download (e.g., `dist`, `apps/frontend/dist`) |
| `alias` | No | - | Deployment alias to download from |
| `commit-sha` | No | - | Specific commit SHA to download |
| `branch` | No | - | Branch to download from (gets latest) |
| `output-path` | No | Same as `source-path` | Where to save downloaded files |
| `repository` | No | Current repo | Repository in `owner/repo` format |
| `overwrite` | No | `false` | Overwrite existing files at output-path |
| `summary` | No | `true` | Write GitHub Step Summary |

:::note
You must specify one of `alias`, `commit-sha`, or `branch` to identify which deployment to download.
:::

## Outputs

| Output | Description |
|--------|-------------|
| `file-count` | Number of files downloaded |
| `total-size` | Total bytes downloaded |
| `commit-sha` | Commit SHA of downloaded deployment |
| `files` | JSON array of downloaded file paths |

## Examples

### Promote Staging to Production

Download from staging alias and re-upload as production:

```yaml
name: Promote to Production

on:
  workflow_dispatch:

jobs:
  promote:
    runs-on: ubuntu-latest
    steps:
      - uses: bffless/download-artifact@v1
        with:
          source-path: dist
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}
          alias: staging

      - uses: bffless/upload-artifact@v1
        with:
          path: dist
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}
          alias: production
          description: 'Promoted from staging'
```

### Download Specific Commit

Download a deployment by commit SHA:

```yaml
- uses: bffless/download-artifact@v1
  with:
    source-path: dist
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    commit-sha: abc123def456
```

### Download to Different Directory

Download to a different output path:

```yaml
- uses: bffless/download-artifact@v1
  with:
    source-path: dist
    output-path: ./downloaded-build
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    alias: production
```

### Cross-Repository Download

Download artifacts from a different repository:

```yaml
- uses: bffless/download-artifact@v1
  with:
    source-path: dist
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    repository: myorg/shared-components
    alias: latest
```

### Run E2E Tests Against Deployed Build

Download a deployment and run tests against it:

```yaml
name: E2E Tests

on:
  deployment_status:

jobs:
  test:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: bffless/download-artifact@v1
        id: download
        with:
          source-path: dist
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}
          alias: preview

      - name: Run E2E tests
        run: |
          npx serve dist &
          npx playwright test
```

### Download Latest from Branch

Download the most recent deployment from a branch:

```yaml
- uses: bffless/download-artifact@v1
  with:
    source-path: dist
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    branch: feature/new-ui
```

## Troubleshooting

### "No deployment found"

- Verify the `alias`, `commit-sha`, or `branch` exists
- Check the `repository` is correct
- Ensure the deployment hasn't been deleted

### "Output path already exists"

Set `overwrite: true` to replace existing files:

```yaml
- uses: bffless/download-artifact@v1
  with:
    source-path: dist
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    alias: production
    overwrite: true
```

### Download Failed - 401 Unauthorized

- Verify your API key is correct
- Check the key hasn't been revoked
- Ensure `BFFLESS_API_KEY` secret is set

### Download Failed - 404 Not Found

- Verify `BFFLESS_URL` is correct
- Check your BFFless instance is running
- Ensure the URL includes the protocol (`https://`)
