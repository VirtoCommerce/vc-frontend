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
| S1b | Plugin with a new backend module                                              | Planned |
| S2  | [Develop a plugin locally](./s2-develop-locally.md)                           | Written |
| S3  | Extend the facade and release it                                              | Planned |
| S4  | Upgrade a plugin to a new host / facade                                       | Planned |
| S5  | Move an in-repo module into a plugin                                          | Planned |
| S6  | Enable a plugin on an environment                                             | Planned |
| S7  | A plugin is missing or broken                                                 | Planned |
| S8  | Add a new extension point to the host                                         | Planned |

Until a scenario is written, [`HOWTO.md`](../HOWTO.md) covers it.

## How each scenario reads

1. **Your case:** one line.
2. **Before you start:** what must already be in place.
3. **Steps:** numbered. 📁 says which folder to run each one in.
4. **✅ Done when:** how you know it worked.
5. **⚠️ Watch out:** at most three traps.
