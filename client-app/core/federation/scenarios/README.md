# Plugin scenarios

**For:** anyone who wants to get a job done with a storefront plugin. How the system works is in the
[general guide](../README.md).

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
