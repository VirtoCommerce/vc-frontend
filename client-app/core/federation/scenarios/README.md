# Plugin scenarios

**For:** anyone who wants to get a job done with a storefront plugin. How the system works is in the
[general guide](../README.md).

_Source-checked against `dev` @ `4b7a22d23` plus the plugin tooling (VCST-6320), facade 0.2.3,
on 2026-10-14. Each scenario ends with what was walked, and when._

## What do you want to do?

```
 Create a plugin
 ├─ in a backend module that already exists ─────────────────────▶ S1a
 └─ together with a new backend module ──────────────────────────▶ S1b

 Work on a plugin on your machine ───────────────────────────────▶ S2
 Release a facade extension a plugin needs ──────────────────────▶ S3

 Move a plugin to a new storefront / facade version ─────────────▶ S4
 Move an in-repo module (client-app/modules/*) into a plugin ────▶ S5
 Make a plugin work on an environment ───────────────────────────▶ S6
 A plugin is missing or broken ──────────────────────────────────▶ S7
 Give plugins a new place to plug into the storefront ───────────▶ S8
```

## Scenarios

| #   | Scenario                                                                      | Status  |
| --- | ----------------------------------------------------------------------------- | ------- |
| S1a | [Plugin in an existing backend module](./s1a-plugin-in-an-existing-module.md) | Written |
| S1b | [Plugin with a new backend module](./s1b-plugin-with-a-new-module.md)         | Written |
| S2  | [Develop a plugin locally](./s2-develop-locally.md)                           | Written |
| S3  | [Extend the facade and release it](./s3-extend-the-facade.md)                 | Written |
| S4  | [Upgrade a plugin to a new host / facade](./s4-upgrade-a-plugin.md)           | Written |
| S5  | [Move an in-repo module into a plugin](./s5-move-a-module-into-a-plugin.md)   | Written |
| S6  | [Enable a plugin on an environment](./s6-enable-on-an-environment.md)         | Written |
| S7  | [A plugin is missing or broken](./s7-missing-or-broken.md)                    | Written |
| S8  | [Add a new extension point to the host](./s8-new-extension-point.md)          | Written |

## How each scenario reads

1. **Your case:** one line.
2. **Before you start:** what must already be in place.
3. **Steps:** numbered. 📁 says which folder to run each one in.
4. **✅ Done when:** how you know it worked.
5. **⚠️ Watch out:** at most three traps.

## Words used here

| Word                      | Means                                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| facade                    | `@vc-frontend/core`, the only package a plugin imports host code from. Its version is not the storefront's                          |
| `requiredHostVersion`     | the facade versions a plugin runs on, set in its `vite.config.ts`; `^` the facade it pins                                           |
| gate 1 / gate 2           | gate 1 skips a plugin whose `requiredHostVersion` the storefront's facade does not meet; gate 2 only logs a shared-library mismatch |
| the switch                | `module_federation_enabled` in the theme settings, read at build time                                                               |
| the override              | `APP_MODULES_FEDERATION_REMOTES`, a build-time list of plugin URLs that replaces the platform's list                                |
| `permission`              | set in the plugin's `public/plugin.json`: a user without it never downloads the plugin                                              |
| expose key                | the module name a plugin's federation build exports; it must be `./plugin`                                                          |
| scoped schema             | the GraphQL schema a backend module serves under `/graphql/<scope>` (`UseScopedSchema` in its `Module.cs`)                          |
| `BACKEND_REQUIREMENTS`    | the minimum platform, x-api and x-frontend versions, in `client-app/core-api/backend-requirements.mjs`; the check prints them       |
| ingress                   | whatever sits in front of the storefront and routes paths to it or to the platform (a reverse proxy)                                |
| `$(<module id>)` in a URL | literal: the platform serves a module's files under `/modules/$(<module id>)/`                                                      |
