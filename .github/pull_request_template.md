<!-- Not ready for review? Open the PR as Draft: an open PR notifies the reviewers in Teams. -->
<!-- How to fill this in: docs/prompts/pr-description-guide.md. Write None in a section that does not apply; do not delete it. -->

## Description
<!-- What changed for the shopper or the store operator; the defect it fixes; a companion backend PR. Visible change: the designs (classic / soft), presets and light / dark it shows in, with screenshots. -->

## Backend requirements
<!-- Module versions this build needs: a backend-packages.json bump, a GraphQL field only a newer module serves. -->

## Settings
<!-- New or changed store/module settings, settings_data.json keys, APP_* variables, with their defaults. -->

## New public surface
<!-- What forks may now use: ui-kit props/slots/emits, --vc-* tokens, public classes, extension points, routes, locale keys. -->

## Plugins (@vc-frontend/core)
<!-- Facade version old → new and why; federation.mjs range; BACKEND_REQUIREMENTS; new facade exports. -->

## Breaking changes
<!-- Removed or renamed public classes, --vc-* tokens, props, slots or emits, split into: Build (types, facade contract) / Upstream merge (moved or split components) / Runtime with no warning (styling, cascade layer or specificity, emits, locale keys, defaults). -->

## New dependencies

## Checklist
- [ ] Styles stay customizable for client forks: colours from palette/tokens, no !important, no public class or --vc-* token renamed or removed (or listed under Breaking changes).
- [ ] New locale keys are translated in every locale, not copied from English.
- [ ] Facade changed → `yarn build:core-types` run and the contract committed.

## References
### Jira-link:
<!-- Full URL: https://virtocommerce.atlassian.net/browse/VCST-XXXX, or None -->
### Artifact URL:
