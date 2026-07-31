# Head / SEO findings — surveyed during VCST-5536

Audit output, not design. Recorded so these can be filed as tickets; **none is fixed by
VCST-5536**. Snapshot of `dev` @ `a1e3cd1a4`, 2026-07-31 — verify before acting, this file is
not maintained.

## A. Open Graph emitter inventory

Seven page-local `useSeoMeta` copies, no shared owner:

| Emitter | ogUrl | ogTitle | ogDescription | ogType | ogImage |
|---|---|---|---|---|---|
| `pages/home.vue:110` | ✅ | ✅ | ✅ | `website` | ❌ |
| `pages/static-page.vue:57` | ✅ | ✅ | ✅ | `website` | ❌ |
| `pages/product.vue:452` | ⚠️ B2 | ✅ | ✅ | `website` | ✅ |
| `shared/catalog/composables/useCategorySeo.ts:36` | ⚠️ B3 | ✅ | ✅ | `website` | ✅ |
| `pages/brand.vue:114` | ⚠️ B6 | ✅ | ✅ | `website` | ✅ |
| `modules/news/pages/news-article.vue:88` | ✅ | ✅ | ✅ | `website` | ❌ |
| `pages/catalog.vue:29` | ❌ | ✅ | ✅ | ❌ | ❌ |
| `pages/matcher/builderIo/builder-io.vue:104` | — | — | — | — | — |
| `pages/matcher/virto-pages/vp-markdown.vue:62` | — | — | — | — | — |

`ogSiteName`: 0 occurrences repo-wide.

## B. Defects

**B1 — `robots: noindex` ships to production.** `index.html:32`. Committed, and returned
verbatim by both `vcst-qa-storefront.govirto.com` and `vcst-dev-storefront.govirto.com`
(`curl` verified). `dist/index.html` contains it too, and nothing rewrites the shell, so by
construction production serves it. Tells Google not to index the site.

**B2 — `og:url` emits literal template source.** `pages/product.vue:362`:

```ts
`${window.location.host}\${product.value?.seoInfo?.semanticUrl}`
```

The `$` is backslash-escaped, so it never interpolates. Verified with node — output is
`example.com${product.value?.seoInfo?.semanticUrl}`. Also missing the `https://` scheme;
`og:url` must be absolute.

**B3 — same bug, worse.** `shared/catalog/composables/useCategorySeo.ts:30`: escaped `$`,
an unbalanced brace, **and** a reference to `currentCategory`, which does not exist in that
file. It occurs exactly once — inside the dead literal — so TypeScript never checks it.

**B4 — a Builder.io or Virto Pages homepage publishes zero OG tags.** `builder-io.vue:104`
and `vp-markdown.vue:62` set title + description only. They are previewer priorities 1 and 2
for `/` (`config/settings_data.json → previewers_settings.priorities`), so they outrank
`home.vue`, which is the only homepage emitter that sets OG tags.

**B5 — placeholder meta in production.** `locales/en.json → pages.home.meta.description` is
`"Test home page description"`, shipped as the homepage `description` and `og:description`.
`pages.home.meta.keywords` is `"test, home, page, keywords"`.

**B6 — `brand.vue` passes values, not getters.** `pages/brand.vue:114-121`:
`ogUrl: window.location.toString()`, `description: brand?.value?.description`,
`ogImage: brand?.value?.logoUrl`. Evaluated once at setup, so the tags never update once the
brand resolves asynchronously. Every other emitter uses `() => …`.

**B7 — `og:type` hardcoded `"website"`** in all six emitters that set it, including product,
brand and news article, which should be `product` / `article`.

**B8 — `og:url` carries the query string.** `ogUrl: window.location.toString()` in
`home.vue`, `static-page.vue`, `brand.vue`. `?utm_*` and other variants each produce a
distinct `og:url`, fragmenting the share cache. Should be canonical origin + path.

## C. Suggested consolidation

B2, B3, B6, B7 and B8 share one root cause: six hand-copied `useSeoMeta` blocks. A single
`usePageSeoMeta({ title, description, url, image, type })` helper — sitting beside the
existing `core/composables/usePageHead.ts`, which already centralises `title` + plain `meta`
— would fix all five at once and give B4 a cheap fix (two more call sites).

Nine files touched. Worth its own ticket. If it lands before VCST-5536's Phase 2, that
phase's `og:image` and `og:type` work comes free.

## D. Context worth keeping

- **UCP does not require schema.org markup.** The `/.well-known/ucp` profile carries
  version / services / capabilities / payment handlers / signing keys only; ucpchecker does
  not grade structured data (report for the QA store: 85/100, sole open item = manifest-root
  keys, i.e. VCST-5535). So VCST-5536 does not block VCST-5538 conformance.
- **Serving topology** (probed 2026-07-31): Cloudflare → k8s ingress; `/xapi/*`, `/ucp/*`,
  `/.well-known/ucp` → platform pod (App Insights `appId`, `INGRESSCOOKIE`); everything else
  → storefront pod serving the theme `dist/` with SPA fallback (extension-less paths →
  `index.html` 200; `*.txt` → 404). `/sitemap/*` is proxied onward.
- **Store is resolved per-hostname at runtime** — `app-runner.ts:135-137`,
  `domain = globalThis.location.hostname` → `getPageContext({ domain })`. One bundle serves
  many brands, which is why build-time head injection is not viable.
