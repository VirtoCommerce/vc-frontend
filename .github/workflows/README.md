# Workflows

GitHub Actions workflows for this repo. This document covers the repository guards and the supply-chain security setup; for what each workflow does, see the individual files.

## Repository guards: upstream vs. theme mirror

This repo is synced into a private theme mirror that holds prospect demo branches (`clone/<prospect>-<version>`). Upstream CI, releases and deploys must not run there, and the mirror's own jobs must not run here. So every job's `if:` starts with a repository guard:

```yaml
# Upstream-only (all existing workflows). 296335982 is the id of
# VirtoCommerce/vc-frontend: unlike the name, it survives a rename
if: github.repository_id == '296335982'

# Mirror-only (*-mirror.yml); the mirror sets the
# repository variable THEME_MIRROR=true, vc-frontend and forks do not
if: vars.THEME_MIRROR == 'true'

# Combined with an existing condition: parenthesise anything containing ||
if: ${{ github.repository_id == '296335982' && (a || b) }}
```

A skipped job takes no runner, so guarded workflows cost the mirror nothing. [`workflow-guards.yml`](workflow-guards.yml) fails any PR that adds a job without a guard, with anything but `&&` right after the guard, or with a top-level `||` after it.

Forks are not this repo either, so upstream workflows are skipped in forks too. A fork that wants its own CI has to change the guard in its copy.

Prospect branches in the mirror must be cut from a release that includes these guards and the `*-mirror.yml` workflows, or newer. A branch cut from an older tag has no mirror build and still carries unguarded upstream workflows.

## Supply-chain security: pinned third-party actions

Every third-party `uses:` reference in this repo (anything not under `VirtoCommerce/*`) is pinned to a full 40-character commit SHA with a trailing `# tag` comment, per the [GitHub Actions hardening guide](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions#using-third-party-actions). Tags are mutable; SHAs are not.

```yaml
# Correct
uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6

# Rejected by CI
uses: actions/checkout@v6
```

### How updates happen

- **Dependabot** ([`.github/dependabot.yml`](../dependabot.yml)) scans `.github/workflows/` weekly. When upstream cuts a new tag, it opens a grouped PR bumping the SHA + trailing comment.
- **Pin-check CI** ([`pin-check.yml`](pin-check.yml)) runs `pinact run -check` on every PR that touches workflows. PRs with unpinned third-party `uses:` lines fail.
- **Scope** is configured in [`.pinact.yaml`](../../.pinact.yaml) at the repo root — `VirtoCommerce/*` is intentionally ignored (internal, not third-party).

### For contributors

- When adding a new third-party action, write the SHA, not the tag. Quick lookup:

  ```sh
  gh api repos/OWNER/REPO/commits/TAG --jq '.sha'
  ```

- `VirtoCommerce/vc-github-actions/<dir>@master` and other `VirtoCommerce/*` refs remain version-/branch-pinned as before — only non-VirtoCommerce owners require SHA pinning.
