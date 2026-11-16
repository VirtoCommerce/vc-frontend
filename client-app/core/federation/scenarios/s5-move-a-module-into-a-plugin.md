# S5 · Move an in-repo module into a plugin

**Your case:** a feature lives in `client-app/modules/<module>/` and should ship with its backend module instead.

**Before you start:** the backend module repo, and S1a done up to step 4, which gives you an empty plugin in it.
Pick the scaffold flags the module needs: `--with-i18n`, `--with-apollo`, `--with-vueuse`, `--with-tailwind`.

## Steps

1. **Size the job first.** 📁 `vc-frontend`: list what the module takes from the host.

   ```bash
   grep -rhoE '"@/[^"]+"' client-app/modules/<module> | sort | uniq -c | sort -rn
   ```

   It also lists the paths in `vi.mock("@/…")` and SCSS `@use "@/…"`, which an import rename misses. Compare every
   symbol with `client-app/core-api/index.ts`. Each one the facade lacks is either a facade addition
   ([S3](./s3-extend-the-facade.md)) or a small copy inside the plugin. This list is the real size of the port.

2. **Extend and release the facade** for what is missing (S3). Meanwhile, work against it with yalc
   ([S2.3](./s2-develop-locally.md#23-the-facade-is-extended-but-not-released)), and against an alpha pre-release of
   the facade branch where CI or QA needs it (S3 step 6).
3. **Move the code** into `StorefrontApp/src/`: components, composables, pages, locales, GraphQL documents. Change
   each `@/…` import to `@vc-frontend/core`. Test helpers come from `@vc-frontend/core/testing`. A spec that mocks
   several host paths needs one `vi.mock("@vc-frontend/core", …)` holding them all: two mocks of the same path
   override each other.
4. **Rewrite `init`.** The host called `init(router, i18n)`; a plugin's `init()` takes nothing:
   - router and i18n come from `globals` (`@vc-frontend/core`);
   - locales: load the module's messages for the current locale yourself, and register the same loader with
     `registerLocaleLoader` so a locale switch re-merges them. Merge with `setLocaleMessage` onto a fresh object,
     never `mergeLocaleMessage`: the host's base messages can be frozen;
   - guard against a second call: the loader may call `init()` again on hot reload, and adding menu entries twice
     duplicates them.
5. **Declare what users see first.** The module's routes, menu entries and slots go into `plugin.config.ts`; its
   enable setting becomes the plugin-level `when` (`settingEnabled(module, key)`). Deep links and menus then work
   before the plugin code arrives.
6. **Move GraphQL codegen.** Remove the module's entry from `independentModules` in
   `scripts/graphql-codegen/generator.ts`; the plugin generates its own types (`yarn generate:graphql-types` in
   `StorefrontApp`, from `/graphql/<plugin-name>`; if the module's scope has another name, change `schema` in
   `codegen.ts`).
7. **Switch over in one storefront release:** stop calling the module's `init` from the host. Running both lets the
   in-repo copy win: it registers first, so the plugin's routes, account sections and extension-registry entries with
   the same names are refused or ignored, and only menu links merged through `mergeMenuSchema` appear twice. Keep the
   in-repo module behind a temporary theme setting until QA signs the plugin off,
   then delete it. Every environment the release reaches needs the module version that ships the plugin
   ([S6](./s6-enable-on-an-environment.md)), or the feature disappears.

## ✅ Done when

The plugin passes `check:plugin-module` with `--env`, the storefront no longer builds the in-repo module, and the
feature behaves as before.

## ⚠️ Watch out

1. **Skipping step 1 hides the real cost.** Sales-rep needed 16 facade exports nobody had planned for.
2. **The in-repo module and the plugin must never run together.** The host's routes come first, so the plugin's
   `addRoute` calls for the same names are refused.
3. **Declared menu titles can flash as raw keys.** The host renders a declared title with `t(key)` before the
   plugin's locales arrive. Declare a menu entry only when that is acceptable, or ship its title in the host's
   locales.

---

_Source-checked on 2026-10-13 against the sales-rep port (`vc-module-sales-rep`, PR 13)._
