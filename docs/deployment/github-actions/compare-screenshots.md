---
sidebar_position: 4
title: Compare Screenshots
description: Visual regression testing with BFFless and GitHub Actions
---

# Compare Screenshots Action

The [`bffless/compare-screenshots`](https://github.com/bffless/compare-screenshots) action performs visual regression testing by comparing screenshots against a baseline stored in BFFless.

<img src="/img/github-actions-compare-screenshot.png" alt="Example PR comment from compare-screenshots action showing Visual Regression Report with failed screenshots and side-by-side comparison" className="screenshot" />

[See example PR comment](https://github.com/bffless/demo/pull/1#issuecomment-3914080635)

:::info Powered by Pixelmatch
This action uses [pixelmatch](https://github.com/mapbox/pixelmatch) for pixel-level image comparison.
:::

## Use Cases

- Visual regression testing in pull requests
- Catching unintended UI changes before merge
- Comparing Playwright/Cypress screenshots across commits
- Automated visual QA in CI/CD pipelines

## Quick Start

```yaml
- uses: bffless/compare-screenshots@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    path: ./screenshots
    baseline-alias: screenshots-production
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
```

The action will:
1. Download baseline screenshots from the specified alias
2. Compare them against your local screenshots using pixelmatch
3. Generate diff images for any failures
4. Upload results to BFFless
5. Post a comment on the PR with results

## Full Workflow Example

```yaml
name: Visual Regression Tests

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  vrt:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install chromium

      - name: Build app
        run: npm run build

      - name: Capture screenshots
        run: npm run test:vrt

      - name: Compare screenshots
        uses: bffless/compare-screenshots@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          path: ./screenshots
          baseline-alias: screenshots-production
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}

      # On main branch, update the baseline
      - name: Update baseline
        if: github.ref == 'refs/heads/main'
        uses: bffless/upload-artifact@v1
        with:
          path: ./screenshots
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}
          alias: screenshots-production
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `path` | **Yes** | - | Path to local screenshots directory |
| `baseline-alias` | **Yes** | - | BFFless alias containing baseline screenshots |
| `api-url` | **Yes** | - | BFFless platform URL |
| `api-key` | **Yes** | - | API key for authentication |
| `threshold` | No | `0.1` | Percentage diff tolerance (0-100) |
| `pixel-threshold` | No | `0.1` | Per-pixel color threshold (0-1) |
| `include-anti-aliasing` | No | `false` | Include anti-aliasing differences |
| `upload-results` | No | `true` | Upload screenshots and diffs to BFFless |
| `alias` | No | `preview` | Alias for uploaded results |
| `repository` | No | Current repo | Repository in `owner/repo` format |
| `output-dir` | No | `./screenshot-diffs` | Directory for diff images |
| `fail-on-difference` | No | `true` | Fail the action if differences detected |
| `summary` | No | `true` | Generate GitHub step summary |
| `summary-images` | No | `auto` | Include images in summary: `auto`, `true`, `false` |
| `comment` | No | `true` | Post a comment on the PR with results |
| `comment-header` | No | `## Visual Regression Report` | Header text for PR comment |

:::note
The action requires `GITHUB_TOKEN` environment variable to post PR comments.
:::

## Outputs

| Output | Description |
|--------|-------------|
| `total` | Total number of screenshots compared |
| `passed` | Number of screenshots that passed |
| `failed` | Number of screenshots that failed |
| `new` | Number of new screenshots (not in baseline) |
| `missing` | Number of missing screenshots (in baseline but not local) |
| `result` | Overall result: `pass`, `fail`, or `error` |
| `report` | JSON report contents |
| `baseline-commit-sha` | Commit SHA of the baseline screenshots |
| `baseline-is-public` | Whether baseline screenshots are publicly accessible |
| `upload-url` | URL to uploaded results |

### Using Outputs

```yaml
- uses: bffless/compare-screenshots@v1
  id: vrt
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    path: ./screenshots
    baseline-alias: screenshots-production
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    fail-on-difference: false

- name: Check results
  run: |
    echo "Result: ${{ steps.vrt.outputs.result }}"
    echo "Passed: ${{ steps.vrt.outputs.passed }}/${{ steps.vrt.outputs.total }}"
    if [ "${{ steps.vrt.outputs.failed }}" -gt 0 ]; then
      echo "::warning::${{ steps.vrt.outputs.failed }} screenshots failed"
    fi
```

## Examples

### Basic PR Workflow

Compare screenshots on every pull request:

```yaml
name: PR Visual Tests

on:
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - run: npm ci && npm run build

      - name: Capture screenshots
        run: npx playwright test --project=vrt

      - name: Compare screenshots
        uses: bffless/compare-screenshots@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          path: ./screenshots
          baseline-alias: screenshots-production
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}
```

### Don't Fail on Differences

Allow differences but still report them:

```yaml
- uses: bffless/compare-screenshots@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    path: ./screenshots
    baseline-alias: screenshots-production
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    fail-on-difference: false
```

### Adjust Comparison Sensitivity

Fine-tune the comparison thresholds:

```yaml
- uses: bffless/compare-screenshots@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    path: ./screenshots
    baseline-alias: screenshots-production
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    threshold: '0.5'           # Allow 0.5% overall difference
    pixel-threshold: '0.2'     # More lenient per-pixel comparison
    include-anti-aliasing: true # Include anti-aliasing in diff
```

### Custom PR Comment Header

Use a custom header for the PR comment:

```yaml
- uses: bffless/compare-screenshots@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    path: ./screenshots
    baseline-alias: screenshots-production
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    comment-header: '## Screenshot Comparison Results'
```

### Skip PR Comment

Only generate step summary, no PR comment:

```yaml
- uses: bffless/compare-screenshots@v1
  with:
    path: ./screenshots
    baseline-alias: screenshots-production
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    comment: false
```

### With Playwright

Complete setup with Playwright for visual testing:

```yaml
name: Visual Tests

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  screenshots:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - run: npm run build

      - name: Capture screenshots
        run: npx playwright test

      - name: Compare screenshots
        if: github.event_name == 'pull_request'
        uses: bffless/compare-screenshots@v1
        continue-on-error: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          path: ./screenshots
          baseline-alias: screenshots-production
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}

      - name: Update baseline
        if: github.ref == 'refs/heads/main'
        uses: bffless/upload-artifact@v1
        with:
          path: ./screenshots
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}
          alias: screenshots-production
```

## How It Works

1. **Downloads** baseline screenshots from BFFless using the specified alias
2. **Compares** each local screenshot against the baseline using pixelmatch
3. **Generates** diff images highlighting pixel differences
4. **Uploads** local screenshots and diff images to BFFless
5. **Posts** a comment on the PR with comparison results
6. **Writes** a GitHub step summary with detailed results

### Comparison Algorithm

The action uses [pixelmatch](https://github.com/mapbox/pixelmatch) for pixel-level comparison:

- **threshold**: Overall percentage of pixels that can differ (0-100)
- **pixel-threshold**: Color difference tolerance per pixel (0-1)
- **include-anti-aliasing**: Whether to count anti-aliased pixels as differences

### Result Categories

| Status | Description |
|--------|-------------|
| `pass` | Screenshot matches baseline within threshold |
| `fail` | Screenshot differs from baseline beyond threshold |
| `new` | Screenshot exists locally but not in baseline |
| `missing` | Screenshot exists in baseline but not locally |

## PR Comment Format

The action posts a comment on the PR with:

- Summary counts (passed/failed/new/missing)
- Results table with diff percentages
- Collapsible sections with side-by-side image comparisons for failures

For public baselines, images are embedded directly. For private baselines, links are provided instead.

## Troubleshooting

### "No baseline found"

- Verify the `baseline-alias` exists in BFFless
- Upload an initial baseline using `bffless/upload-artifact`
- Use `continue-on-error: true` for the first PR

### Screenshots Not Matching

- Ensure consistent viewport sizes in your tests
- Check for dynamic content (timestamps, animations)
- Adjust `threshold` for acceptable variance
- Use `include-anti-aliasing: true` if fonts render differently

### PR Comment Not Posted

- Ensure `GITHUB_TOKEN` is set in the environment
- Verify `pull-requests: write` permission is granted
- Check that the workflow is triggered by `pull_request` event

### Images Not Loading in Comment

- For private baselines, users must be logged into BFFless
- Check `baseline-is-public` output to verify visibility
- Use `summary-images: false` to show links instead of embedded images
