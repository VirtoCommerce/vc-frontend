# S2 · Develop a plugin locally

**Your case:** you change a plugin and want to see it in a storefront running on your machine.

**Before you start (every setup below):**

1. A `vc-frontend` checkout with `yarn install` done, and a backend in `.env.local` (`APP_BACKEND_URL`).
2. `"module_federation_enabled": true` in `client-app/config/settings_data.json` (the default).
3. Build the host with `--mode=development`. A production build looks the store up by `localhost` and shows a blank
   page.
4. The commands below set `APP_MODULES_FEDERATION_REMOTES` the bash way. In PowerShell or cmd, put the same line in
   `.env.local` instead, and take it out afterwards: it replaces the platform's plugin list.

## Pick your setup

| Your situation                                                         | Go to                                               |
| ---------------------------------------------------------------------- | --------------------------------------------------- |
| You change the plugin's code, nothing else                             | [2.1](#21-the-main-loop)                            |
| The module is already installed on the environment you develop against | [2.2](#22-the-module-is-already-on-the-environment) |
| You also extended the facade, and it is not released yet               | [2.3](#23-the-facade-is-extended-but-not-released)  |
| The host changes too (a new extension point, say)                      | [2.4](#24-the-host-changes-too)                     |
| The module's backend changes too (new GraphQL fields)                  | [2.5](#25-the-modules-backend-changes-too)          |
| You change `plugin.config.ts`                                          | [2.6](#26-you-change-pluginconfigts)                |
| You work on several plugins at once                                    | [2.7](#27-several-plugins-at-once)                  |

## 2.1 The main loop

1. 📁 `StorefrontApp`: `yarn build && yarn preview` serves the plugin on port 3001.
2. 📁 `vc-frontend`:

   ```bash
   APP_MODULES_FEDERATION_REMOTES='{"my-plugin":"http://localhost:3001/mf-manifest.json"}' \
   yarn build-only --mode=development && yarn preview
   ```

3. Iterate. 📁 `StorefrontApp`: `yarn watch` rebuilds on save; reload the page. The host needs a rebuild only when
   the override changes.

✅ The plugin shows in `https://localhost:3000`, and the console says `[MF] plugins loaded=[my-plugin]`.

**With hot reload instead:** run `yarn dev` in both folders instead of build + preview. Edits appear without a
reload. Not when you change `plugin.config.ts` (2.6). The first load after starting the servers can show a 404 on the
plugin's page: with no declarations, the route exists only once the plugin's `init()` has run. Reload.

## 2.2 The module is already on the environment

📁 `vc-frontend`, **without** the override:

```bash
yarn build-only --mode=development && yarn preview
```

The host asks the environment for its plugins, and the local server proxies `/modules/*/plugins/vc-frontend/` to
it. You run exactly the plugins the environment has.

To swap one of them for your local copy, use the override from 2.1. ⚠️ The override **replaces** the
environment's list, so its other plugins disappear. Keep them by listing them too, through the local proxy:

```bash
APP_MODULES_FEDERATION_REMOTES='{
  "my-plugin": "http://localhost:3001/mf-manifest.json",
  "sales-rep": "https://localhost:3000/modules/$(VirtoCommerce.SalesRep)/plugins/vc-frontend/mf-manifest.json"
}' \
yarn build-only --mode=development && yarn preview
```

Take each path from the environment's `store.plugins` entry, with `remoteEntry.js` changed to
`mf-manifest.json`. The `$(VirtoCommerce.SalesRep)` part is literal: that is how the platform names a module's folder.

⚠️ A plugin loaded through the override ignores its `permission`: it loads for every user.

## 2.3 The facade is extended but not released

Your plugin needs a facade export that only exists in your `vc-frontend` checkout. Link it with
[yalc](https://github.com/wclr/yalc) (`npm i -g yalc`):

1. 📁 `vc-frontend`, once: `cd client-app/core-api && yalc publish --private`
2. 📁 `StorefrontApp`, once: `yalc add @vc-frontend/core && yarn install`
3. 📁 `vc-frontend`, after every facade change: `yarn core:yalc-push`
4. If the plugin uses the new export, set `requiredHostVersion` to the facade version `build:core-types` produced.
5. **Before committing the plugin**, 📁 `StorefrontApp`: `yalc remove @vc-frontend/core`, then pin the released
   facade (S3). If the plugin's CI or a QA environment needs it before the facade is released, pin an alpha
   pre-release of the facade branch instead ([facade README §5](../../../core-api/README.md#5-releasing)), and move to
   the stable release before the plugin merges.

✅ `yarn check:plugin-module` passes. It fails while a yalc link is still in `package.json`.

⚠️ Don't use a `portal:` or `link:` pin instead. Both symlink, so the facade's types resolve against the host's
`node_modules`, and the test helpers break.

## 2.4 The host changes too

Run the host from your branch (2.1) and link its facade (2.3). Releasing needs a set order: S3.

## 2.5 The module's backend changes too

1. Run a backend that has the change: a local platform with the module ([S6 → On a local platform](./s6-enable-on-an-environment.md#on-a-local-platform)),
   or the module's PR package installed on an environment. Point `APP_BACKEND_URL` at it, in `vc-frontend/.env.local` and in `StorefrontApp/.env`.
2. 📁 `StorefrontApp`: `yarn generate:graphql-types`. It reads the module's schema at `/graphql/<plugin-name>`.
   Commit the generated `types.ts`.

✅ `yarn type-check` passes against the new fields.

## 2.6 You change `plugin.config.ts`

The host learns your declarations only from the **built** `plugin.json`. `yarn dev` does not write it, so the host
sees no declarations. Use `yarn build` (or `yarn watch`) with `yarn preview`.

## 2.7 Several plugins at once

Serve each plugin on its own port (`yarn preview --port 3002`, or `yarn dev --port 3002`) and list each one in the
override:

```bash
APP_MODULES_FEDERATION_REMOTES='{"a":"http://localhost:3001/mf-manifest.json","b":"http://localhost:3002/mf-manifest.json"}' \
yarn build-only --mode=development && yarn preview
```

## ⚠️ Watch out

1. **A local plugin cannot go into a deployed storefront.** The override is read when the host is built, so run the
   host locally.
2. **Plugin and route `when` conditions are read once, at startup.** Change a setting or a role, then reload the
   page. Slot conditions are read on every render.
3. **Don't commit a yalc link.** `check:plugin-module` catches it.

---

_Walked on 2026-10-13 against vcptcore-dev: 2.1 (build + preview, watch, hot reload), 2.2 (the environment's list
and the mixed override), 2.3 with 2.4, 2.5's codegen, 2.6, 2.7 (preview and dev). **Not verified:** 2.5 with a
local platform, and that an override ignores `permission`._
