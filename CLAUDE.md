# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Virto Commerce Frontend: a Vue 3 + TypeScript SPA (Vite, Apollo GraphQL, Tailwind + SCSS) that runs as the storefront theme of the Virto Commerce Platform.

Detailed, path-scoped conventions live in [.claude/rules/](.claude/rules/) (architecture, modules-and-routes, data-graphql, styles, markup, ui-kit, ui-kit-internals, vue-typescript, i18n, tests, security). They load automatically for matching files, so they are not repeated here.

## Commands

Node 22 (`.nvmrc`), Yarn 4 via corepack. Every script runs `scripts/check-yarn-version.js` first.

```bash
yarn install --immutable
yarn dev                      # Vite dev server, HTTPS (mkcert) on https://localhost:3000
yarn build                    # validate (vue-tsc + depcruise), then vite build
yarn validate:types           # vue-tsc --build --force
yarn validate:dependencies    # dependency-cruiser over client-app
yarn lint / yarn lint:fix     # ESLint (cached)
yarn prettier                 # prettier --check client-app/

yarn test:unit                                     # vitest (watch mode)
yarn test:unit run path/to/file.test.ts            # single file, one-shot
yarn test:unit run -t "renders empty state"        # single test by name
yarn test:typing                                   # whole suite + *.test-d.ts type tests (watch)

yarn generate:graphql-types   # regenerate GraphQL types.ts (needs a reachable backend)
yarn check-locales            # report missing locale keys across all locale folders
yarn build:core-types         # regenerate client-app/core-api/contract/index.d.ts
yarn storybook:dev            # Storybook on :6006
```

Typecheck only via `yarn validate:types`: the root `tsconfig.json` is `"files": []` plus project references, so a bare `vue-tsc --noEmit` exits 0 having checked nothing.

`yarn fix-locales` (Gemini, needs `APP_GEMINI_API_KEY`) fills only *missing* keys. English placeholders copied into other locales stay as they are, so delete them first.

The backend is set via `APP_BACKEND_URL` in `.env.local`. The dev server proxies `/graphql` (incl. WS), `/api`, `/connect/*`, `/cms-content` and the other auth/well-known paths to it (`vite.config.ts`).

Pre-commit runs `eslint --fix` (js/ts/vue) and `prettier --write` (graphql/json) via lint-staged. Commit messages follow Conventional Commits (commitlint), e.g. `feat(VCST-1234): ...`. CI does not run ESLint, so warnings only surface locally. PR descriptions follow `.github/pull_request_template.md` (Description, Jira-link, Artifact URL); a correct Jira link auto-links the PR to the ticket.

## Conventions that apply to every rule file

- **Moved code is new code.** Lines moved or copied into a new file or a newly extracted component are judged as added lines, even if the same text existed elsewhere before — the change chose to ship them again. Only lines left untouched in their original place count as legacy.
- CI does not run ESLint (only pre-commit lint-staged, where `warn` never blocks), so rules marked *(eslint warn)* / *(eslint error)* do reach `dev` — they still apply to added lines.
- When two forms are both accepted, the one already used in the touched file wins.

## Architecture

All app code is in `client-app/`, alias `@` → `client-app`.

- **Layers** (imports only point left): `ui-kit` ← `core` ← `shared` ← `modules` / `pages`.
  - `ui-kit/`: design-system `Vc*` components (atoms/molecules/organisms), registered globally as a plugin. Has its own locales and an LLM reference in `llms/ui-kit/`.
  - `core/`: Apollo client and core GraphQL API, plugins (auth, permissions, config, context, extension points), app-wide composables, `globals`.
  - `shared/`: domain folders (catalog, cart, account, checkout…). Each one exposes its public API through `index.ts`.
  - `pages/`: routed pages. `router/` holds the route table and guards.
- **Bootstrap**: `main.ts` → `app-runner.ts`. It loads store/page context, sets `globals`, sets up i18n and the theme preset, then calls every module's `init(router, i18n)` *before* `app.use(router)`, and mounts the app. Route-level `pages/matcher` resolves slugs (SEO URLs, Builder.io / page-builder content).
- **Modules** (`client-app/modules/*`): optional features (quotes, returns, sales-rep, loyalty, push-messages, …). Each one is gated by a store-level module setting, and you can delete it without breaking core. A module plugs into the host only via its `init()` and the **extension registry** (`shared/common/composables/extensionRegistry`, see its README), never by host code importing module internals. See `client-app/modules/README.md`.
- **GraphQL**: one operation per folder (`api/graphql/{queries,mutations,fragments}/<name>/`) with a `useXQuery` wrapper. `types.ts` is generated per core and per independent module (`scripts/graphql-codegen/generator.ts`). Never edit it by hand.
- **Module Federation**: external plugins are loaded at runtime (`vite.federation.ts`, `modules/federated/`, enabled by `APP_MODULES_FEDERATION_ENABLED`). Plugins may import only the `@vc-frontend/core` facade (`client-app/core-api/index.ts`). Its public contract `core-api/contract/index.d.ts` is generated with `yarn build:core-types` and committed. Breaking change: `yarn bump:core minor` (0.x) / `major` (≥1.x) → update the `@vc-frontend/core` range in `federation.mjs` → `yarn build:core-types` → commit together.
- **i18n**: root `locales/*.json`, plus `ui-kit/locales` and `modules/*/locales`. Module locales load at runtime via `loadModuleLocale`. `en.json` is the source for `check-locales` / `fix-locales`.
- **Styling**: Tailwind utilities plus BEM in component `<style lang="scss">`. Responsive rules use `@media (width >= theme("screens.md"))` in SCSS (see `styles.md`).
- **Tests**: vitest + jsdom + `@vue/test-utils`, with `*.test.ts` next to the source file.

Design specs live next to their code: `client-app/modules/<module>/specs/<TICKET>-<topic>/` (core: `client-app/core/specs/`).
