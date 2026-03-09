---
sidebar_position: 1
title: Recipes
description: Practical patterns and workflows for BFFless
---

# Recipes

This section contains practical recipes and patterns for common workflows using BFFless. Each recipe provides a complete, working example that you can adapt to your own projects.

## Available Recipes

### [Coverage Comparison](./coverage-comparison)

Compare test coverage between your PR and production. This recipe shows how to:
- Upload coverage reports from your main branch as a baseline
- Download and compare coverage in PR workflows
- Post coverage diff comments on pull requests

Perfect for teams that want to track coverage trends and catch regressions before merging.

### [Visual Regression Testing](./compare-screenshots)

Compare screenshots between your PR and production for visual regression testing. This recipe shows how to:
- Capture and upload screenshots from your main branch as a baseline
- Compare screenshots pixel-by-pixel in PR workflows
- Post visual diff reports with side-by-side comparisons on pull requests

Perfect for teams that want to catch unintended visual changes before merging.

### [A/B Testing](./ab-testing)

Run A/B tests on your static site using BFFless traffic splitting. This recipe shows how to:
- Deploy multiple variants as separate aliases
- Configure percentage-based traffic distribution
- Read the `__bffless_variant` cookie for analytics attribution
- Send conversion data to your analytics platform

Perfect for teams that want to test different copy, layouts, or features with real users.

### [Email Form Handler](./email-form-handler)

Receive form submissions via email without any backend code. This recipe shows how to:
- Configure email form handler proxy rules
- Build contact forms with spam protection (honeypot fields)
- Handle submissions via HTML forms or JavaScript/React
- Route different forms to different email addresses

Perfect for contact forms, feedback widgets, and lead capture on static sites.

### [Server-Side State](./state-management)

Store and update application state using Data Tables and Pipelines. This recipe shows how to:
- Create a key-value store schema in DB Records
- Build GET/POST API endpoints with Pipelines
- Use Custom Functions for state transformations
- Access state from frontend JavaScript/React

Perfect for counters, feature flags, user preferences, and any server-persisted state on static sites.

---

## Contributing Recipes

Have a useful pattern to share? We welcome contributions! Each recipe should:

1. Solve a specific, common problem
2. Include complete, working code examples
3. Be tested in a real project (like our [demo repo](https://github.com/bffless/demo))
4. Include troubleshooting tips for common issues

Open an issue or PR on [GitHub](https://github.com/bffless/bffless) to propose a new recipe.
