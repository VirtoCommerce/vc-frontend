# Build & Bundle Optimization — March 2026

## Aim

Reduce developer friction by speeding up build, lint, and type-check cycles, and reduce production bundle size for faster page loads. Prioritize high-impact, low-effort changes.

## Benchmark Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Production build | 2m 0s | 41.2s | **-65%** |
| ESLint | 4m 2s | 36.0s | **-85%** |
| Type check | 2m 25s | 1m 19s | **-46%** |
| Dev server startup | 2.0s | 1.4s | **-30%** |
| JS bundle (gzip) | 1.69MB | 1.65MB | -2% |
| CSS bundle | 456KB | 389KB | **-15%** |
| Vendor chunks (gzip) | 526KB | 467KB | -11% |

---

## Changes

### 1. Vite 7 → Vite 8 (Rolldown)

**Reason:** Vite 8 replaces Rollup with Rolldown (Rust-based bundler), delivering 2-7x faster builds.

**What changed:**
- `vite` upgraded from `^7.3.1` to `^8.0.1`
- Rolldown produces different chunk splitting than Rollup — the old monolithic `index-*.js` (1.89MB) is now split into `index-*.js` (258KB) + `utilities-*.js` + `components-*.js` + `catalog-*.js` etc.
- `rollupOptions` is preserved (Vite 8 has a compatibility layer for Rollup config)

**Restrictions:**
- `@storybook/vue3-vite` peer dependency warns about Vite 8 — Storybook hasn't updated its peer range yet. Storybook dev/build still works.
- `@rollup/plugin-graphql` continues to work via Rolldown's Rollup compatibility layer.

### 2. LightningCSS Minification

**Reason:** Vite 8 defaults to LightningCSS for CSS minification (100x faster than esbuild, produces smaller output).

**What changed:**
- Removed 4 `@apply bg-[--color-#{$color}-*]` patterns in `vc-menu-item.vue` and `vc-menu-item.scss` that used SCSS interpolation inside Tailwind utility classes. Replaced with plain CSS `background-color: var(--color-#{$color}-*)`.
- Replaced 1 dynamic Tailwind class in `environment-badge.vue` (`` bg-[--color-${badgeColor}-500] ``) with `:style` binding.

**Decision:** SCSS `#{$color}` interpolation in selectors and `var()` values is fine — SCSS compiles those to valid CSS before LightningCSS sees them. Only `@apply` with interpolated arbitrary values was problematic because Tailwind's PostCSS plugin scans raw source and generates CSS classes with literal `#{$color}`, which LightningCSS can't parse.

**Restriction:** If new code uses `@apply` with SCSS-interpolated Tailwind arbitrary values, the build will fail. Use plain CSS properties instead.

### 3. lodash → lodash-es

**Reason:** `lodash` (CommonJS) cannot be tree-shaken. `lodash-es` (ESM) enables Rolldown to eliminate unused functions.

**What changed:**
- Replaced `lodash` with `lodash-es` in `package.json`
- Updated 70 files: `from "lodash"` → `from "lodash-es"`, `from "lodash/x"` → `from "lodash-es/x"`
- Converted 4 files using `import _ from "lodash"` (default import) to named imports:
  - `useNotifications.ts`: `_.uniqueId()` → `uniqueId()`
  - `useOrganizationContacts.ts`: `_.map()` → `map()`
  - `useOrganizationContactsFilterFacets.ts`: `_.cloneDeep()`, `_.isEqual()` → named
  - `vc-carousel.vue`: `_.clone()` → `clone()`
- Replaced `@types/lodash` with `@types/lodash-es`

### 4. tw-elements → PhotoSwipe

**Reason:** `tw-elements` is ~15MB installed but only its Lightbox component was used (2 files). PhotoSwipe is ~5KB gzipped and purpose-built for image lightboxes.

**What changed:**
- Removed `tw-elements` from dependencies and Tailwind config (plugin + content path)
- Added `photoswipe` as a dependency
- `image-gallery.vue`: Replaced `initTE({ Lightbox })` with programmatic PhotoSwipe. Images are opened via `@click` handlers. PhotoSwipe dynamically loads image dimensions via `gettingData` event since the API doesn't provide width/height. Focus restoration on close is preserved.
- `product-reviews.vue`: Added `openReviewLightbox()` function with same PhotoSwipe approach. Click handler on `SwiperSlide`.
- PhotoSwipe is excluded from `manualChunks` so it gets its own lazy-loaded chunk (~59KB, loaded only when lightbox opens).

**Decision:** PhotoSwipe was chosen over GLightbox/SimpleLightbox because it's the most mature, lightweight, and has a clean programmatic API without requiring `<a>` wrappers.

**Restriction:** PhotoSwipe doesn't know image dimensions upfront. The implementation uses `window.innerWidth/Height` as placeholder dimensions and updates them when each image loads via `gettingData` event. This may cause a brief layout shift in the lightbox.

### 5. Vendor Chunk Splitting

**Reason:** A single `vendor.js` chunk (1.62MB) meant any dependency update invalidated the entire cache for all users. Splitting enables independent caching.

**What changed in `vite.config.ts`:**
```js
manualChunks(id) {
  if (!id.includes("node_modules")) return;
  if (id.includes("firebase"))    return "vendor-firebase";
  if (id.includes("@apollo") || id.includes("graphql")) return "vendor-apollo";
  if (id.includes("swiper"))      return "vendor-swiper";
  if (id.includes("lodash-es"))   return "vendor-lodash";
  if (id.includes("photoswipe"))  return; // lazy-loaded, own chunk
  return "vendor";
}
```

**Resulting chunks:**
| Chunk | Size | Notes |
|-------|------|-------|
| vendor.js | 1.13MB | Vue, vue-router, vue-i18n, vueuse, etc. |
| vendor-apollo.js | 178KB | Apollo Client + GraphQL |
| vendor-swiper.js | 102KB | Swiper carousel |
| vendor-firebase.js | ~10KB | Firebase (lazy-loaded by push-messages module) |
| vendor-lodash.js | ~25KB | lodash-es (tree-shaken) |

### 6. Oxlint alongside ESLint

**Reason:** ESLint was the slowest step at 4m 2s. Oxlint (Rust-based) runs 50-100x faster and covers many of the same rules.

**What changed:**
- Added `oxlint` and `eslint-plugin-oxlint` as dev dependencies
- `eslint.config.js`: Added `...oxlint.configs["flat/recommended"]` before prettier config. This disables ESLint rules that Oxlint already covers.
- `package.json` lint scripts: `oxlint && eslint .` (oxlint runs first in 292ms, then ESLint handles Vue/Tailwind/accessibility rules)

**Decision:** Oxlint runs without `--deny-warnings` because it reports 6 stylistic warnings (yup schema `then` properties, unnecessary spread, empty file) that are false positives in this codebase. These are not bugs.

**What Oxlint handles:** JavaScript/TypeScript rules from `@eslint/js`, `@typescript-eslint`, `eslint-plugin-import`, `eslint-plugin-sonarjs`.

**What ESLint still handles:** `eslint-plugin-vue`, `eslint-plugin-vuejs-accessibility`, `eslint-plugin-tailwindcss`, `eslint-plugin-storybook`, `eslint-plugin-prettier`, `eslint-plugin-sort-exports`.

---

## Additional Fix: tsconfig.storybook.json

The `exclude` pattern `"./storybook/main.ts"` didn't match the actual file at `./.storybook/main.ts` (missing dot prefix). This caused `.storybook/main.ts` to be compiled under the storybook tsconfig (which extends `tsconfig.app.json` with `resolvePackageJsonExports: false`) instead of `tsconfig.node.json`. Vite 8 only exports types via its `exports` map, so the types couldn't be resolved. Fixed to `"./.storybook/main.ts"`.

---

## Not Done (Future Opportunities)

### Migrate `.graphql` imports to TypedDocumentNode (eliminate @rollup/plugin-graphql)

The `@rollup/plugin-graphql` consumes 39% of build time processing 195 `.graphql` files. The project's GraphQL codegen already generates `TypedDocumentNode` exports for all 111 operations. Migrating the 67 files that still use direct `.graphql` imports to use generated typed imports would eliminate the plugin entirely.

**Why not done now:** 3 operations dynamically construct queries at runtime (variable tree depth, conditional fields) and cannot be pre-compiled. This means the plugin must remain for those files. Additionally, 4-8 operations use custom type overrides at call sites that would need refactoring. This is a separate task.

### Tailwind CSS 3 → 4

Tailwind v4 uses LightningCSS internally and eliminates PostCSS. However, it requires removing all SCSS (the project uses SCSS extensively for component styles with `@each` loops and `#{$color}` interpolation). This is a large migration.

### Further bundle splitting

Route-based code splitting with `defineAsyncComponent` is already used extensively. Additional splitting could target the `utilities-*.js` chunks (515-685KB) but would require refactoring shared imports.
