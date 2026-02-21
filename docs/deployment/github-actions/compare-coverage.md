---
sidebar_position: 5
title: Compare Coverage
description: Code coverage regression detection with BFFless and GitHub Actions
---

# Compare Coverage Action

The [`bffless/compare-coverage`](https://github.com/bffless/compare-coverage) action compares test coverage reports against a baseline stored in BFFless, detecting coverage regressions in pull requests.

<img src="/img/github-actions-compare-coverage.png" alt="Example PR comment from compare-coverage action showing Coverage Report with metrics comparison table" className="screenshot" />

[See example PR comment](https://github.com/bffless/demo/pull/1#issuecomment-3939065293)

:::info Multiple Format Support
This action supports LCOV, Istanbul, Cobertura, Clover, and JaCoCo coverage formats with automatic detection.
:::

## Use Cases

- Detecting coverage regressions in pull requests
- Enforcing minimum coverage thresholds
- Tracking coverage trends across commits
- Automated coverage reporting in CI/CD pipelines

## Quick Start

```yaml
- uses: bffless/compare-coverage@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    path: ./coverage
    baseline-alias: coverage-production
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
```

The action will:
1. Download baseline coverage from the specified alias
2. Parse your local coverage report (auto-detecting format)
3. Compare metrics: statements, branches, functions, and lines
4. Upload results to BFFless
5. Post a comment on the PR with comparison results

## Full Workflow Example

```yaml
name: Coverage Comparison

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm test -- --coverage

      - name: Compare coverage
        uses: bffless/compare-coverage@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          path: ./coverage
          baseline-alias: coverage-production
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}

      # On main branch, update the baseline
      - name: Update baseline
        if: github.ref == 'refs/heads/main'
        uses: bffless/upload-artifact@v1
        with:
          path: ./coverage
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}
          alias: coverage-production
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `path` | **Yes** | - | Path to coverage report file or directory |
| `baseline-alias` | **Yes** | - | BFFless alias containing baseline coverage |
| `api-url` | **Yes** | - | BFFless platform URL |
| `api-key` | **Yes** | - | API key for authentication |
| `format` | No | `auto` | Coverage format: `lcov`, `istanbul`, `cobertura`, `clover`, `jacoco`, or `auto` |
| `threshold` | No | `0` | Allowed regression percentage (0 = any regression fails) |
| `upload-results` | No | `true` | Upload current coverage to BFFless |
| `alias` | No | `preview` | Alias for uploaded results |
| `repository` | No | Current repo | Repository in `owner/repo` format |
| `fail-on-regression` | No | `true` | Fail the action if coverage regresses |
| `summary` | No | `true` | Generate GitHub step summary |
| `comment` | No | `true` | Post a comment on the PR with results |
| `comment-header` | No | `## Coverage Report` | Header text for PR comment |

:::note
The action requires `GITHUB_TOKEN` environment variable to post PR comments.
:::

## Outputs

| Output | Description |
|--------|-------------|
| `statements` | Statement coverage percentage |
| `branches` | Branch coverage percentage |
| `functions` | Function coverage percentage |
| `lines` | Line coverage percentage |
| `statements-delta` | Change vs baseline |
| `branches-delta` | Change vs baseline |
| `functions-delta` | Change vs baseline |
| `lines-delta` | Change vs baseline |
| `result` | Overall result: `pass`, `fail`, or `improved` |
| `report` | JSON report contents |
| `baseline-commit-sha` | Commit SHA of the baseline coverage |
| `upload-url` | URL to uploaded results |

### Using Outputs

```yaml
- uses: bffless/compare-coverage@v1
  id: coverage
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    path: ./coverage
    baseline-alias: coverage-production
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    fail-on-regression: false

- name: Check results
  run: |
    echo "Lines: ${{ steps.coverage.outputs.lines }}%"
    echo "Delta: ${{ steps.coverage.outputs.lines-delta }}%"
    echo "Result: ${{ steps.coverage.outputs.result }}"
    if [ "${{ steps.coverage.outputs.result }}" == "fail" ]; then
      echo "::warning::Coverage regressed!"
    fi
```

## Supported Coverage Formats

| Format | File Types | Used By |
|--------|------------|---------|
| **lcov** | `.info`, `.lcov` | Jest, Vitest, c8, nyc, gcov |
| **istanbul** | `coverage-final.json` | Jest, nyc, Istanbul |
| **cobertura** | `.xml` | Python (coverage.py), .NET, PHPUnit |
| **clover** | `.xml` | PHP (PHPUnit), Java |
| **jacoco** | `.xml` | Java, Kotlin, Scala |

### Path Resolution

The `path` input accepts either a file or directory:

```yaml
# Direct file path
path: ./coverage/lcov.info

# Directory - action will find the coverage file
path: ./coverage
```

When a directory is provided, the action searches for these files (in order):
- `lcov.info`, `coverage.lcov`
- `coverage-final.json`, `coverage.json`
- `cobertura.xml`, `cobertura-coverage.xml`, `coverage.xml`
- `clover.xml`
- `jacoco.xml`, `jacocoTestReport.xml`

## Examples

### Jest / Vitest (LCOV)

```yaml
name: Coverage

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Compare coverage
        if: github.event_name == 'pull_request'
        uses: bffless/compare-coverage@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          path: ./coverage/lcov.info
          baseline-alias: coverage-production
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}

      - name: Update baseline
        if: github.ref == 'refs/heads/main'
        uses: bffless/upload-artifact@v1
        with:
          path: ./coverage
          api-url: ${{ vars.BFFLESS_URL }}
          api-key: ${{ secrets.BFFLESS_API_KEY }}
          alias: coverage-production
```

### Python (Cobertura)

```yaml
- name: Run tests
  run: pytest --cov=src --cov-report=xml

- name: Compare coverage
  uses: bffless/compare-coverage@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    path: ./coverage.xml
    format: cobertura
    baseline-alias: coverage-production
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
```

### Java (JaCoCo)

```yaml
- name: Run tests
  run: ./gradlew test jacocoTestReport

- name: Compare coverage
  uses: bffless/compare-coverage@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    path: ./build/reports/jacoco/test/jacocoTestReport.xml
    format: jacoco
    baseline-alias: coverage-production
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
```

### Allow Minor Regression

Allow up to 1% coverage regression without failing:

```yaml
- uses: bffless/compare-coverage@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    path: ./coverage
    baseline-alias: coverage-production
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    threshold: 1
```

### Don't Fail on Regression

Report regressions but don't fail the build:

```yaml
- uses: bffless/compare-coverage@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    path: ./coverage
    baseline-alias: coverage-production
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    fail-on-regression: false
```

### Skip PR Comment

Only generate step summary, no PR comment:

```yaml
- uses: bffless/compare-coverage@v1
  with:
    path: ./coverage
    baseline-alias: coverage-production
    api-url: ${{ vars.BFFLESS_URL }}
    api-key: ${{ secrets.BFFLESS_API_KEY }}
    comment: false
```

## How It Works

1. **Downloads** baseline coverage from BFFless using the specified alias
2. **Parses** both baseline and current coverage reports (auto-detecting format)
3. **Compares** metrics: statements, branches, functions, and lines
4. **Calculates** deltas and determines if coverage regressed
5. **Uploads** current coverage to BFFless
6. **Posts** a comment on the PR with comparison results
7. **Writes** a GitHub step summary with detailed metrics

### Coverage Metrics

| Metric | Description |
|--------|-------------|
| **Statements** | Lines of code executed |
| **Branches** | Conditional branches taken (if/else, switch) |
| **Functions** | Functions/methods called |
| **Lines** | Physical lines hit |

### Result Categories

| Result | Description |
|--------|-------------|
| `pass` | No regression (or within threshold) |
| `fail` | Coverage regressed beyond threshold |
| `improved` | Coverage increased |

## PR Comment Format

The action posts a comment on the PR with:

- Overall coverage change summary
- Metrics table comparing baseline vs current
- Baseline and current commit information
- Collapsible section with file-level changes

## Troubleshooting

### "No baseline found"

- Verify the `baseline-alias` exists in BFFless
- Upload an initial baseline using `bffless/upload-artifact`
- Use `continue-on-error: true` for the first PR

### "Unable to detect coverage format"

- Specify the format explicitly using the `format` input
- Ensure your coverage file has a standard name/extension
- Check that the coverage file is not empty

### PR Comment Not Posted

- Ensure `GITHUB_TOKEN` is set in the environment
- Verify `pull-requests: write` permission is granted
- Check that the workflow is triggered by `pull_request` event

### Coverage Metrics Don't Match

- Different tools may calculate metrics differently
- Ensure baseline and current use the same coverage tool
- Check for differences in test configuration between runs
