# VCST-5536 — Organization schema (JSON-LD) + social meta on the homepage

**Design spec — frontend only.** 2026-07-31 · branch `feat/VCST-5536-organization-jsonld`

## 1. Scope

Publish a schema.org `OnlineStore` JSON-LD node and the site-level Open Graph tags on the
storefront homepage, driven by store-configured brand data.

**In scope (this repo):** the Vue composables that build and emit the markup, homepage
route detection, degradation rules, unit tests.

**Out of scope, deliberately:** server-side / edge emission of the markup (see §3), the
backend `brandProfile` contract itself (§4 specifies it as a hand-off), and the adjacent
defects catalogued in §10.

## 2. Why the ticket exists (and what it does *not* do)

Verified against the UCP spec and the live ucpchecker report for the QA store:

- UCP's `/.well-known/ucp` profile carries version / services / capabilities / payment
  handlers / signing keys. It has **no merchant-identity section**, and neither the spec
  nor ucpchecker requires or grades schema.org markup.
- Therefore this ticket **does not block UCP conformance** (VCST-5538). It is
  agent/search discoverability.
- The ticket's rationale claims agents use this "to verify you are who you claim to be."
  That is inaccurate — JSON-LD is self-asserted and proves nothing. Cryptographic
  verification is the sibling ticket VCST-5535 (Ed25519 JWK at the manifest root).
- The real value is **entity resolution**: `sameAs` links the store's domain to profiles
  an agent's knowledge graph already knows, and a stable `@id` lets other nodes reference
  the organization. Google documents `sameAs` for exactly this.

Priority should be set on "discoverability, cheap" — not on "unblocks conformance."

## 3. Known limitation: this markup is client-rendered

Documented up front because it bounds what the ticket can deliver.

The storefront is a client-only SPA — `createHead()` from `@unhead/vue/client`
(`client-app/app-runner.ts:176`), no SSR, no prerender, no HTML rewrite anywhere in the
serving path. Verified by probing the live QA host:

```
Cloudflare → k8s ingress
   ├─ /xapi/*  /ucp/*  /.well-known/ucp   → platform pod (.NET; App Insights appId, INGRESSCOOKIE)
   └─ everything else                     → storefront pod (serves the theme's dist/, SPA fallback)
```

`dist/index.html` still contains `<meta name="robots" content="noindex">` and that is
byte-for-byte what the live site returns — nothing rewrites the shell.

Consequence: **GPTBot, ClaudeBot and PerplexityBot do not execute JavaScript** and will not
see this markup. Neither will social scrapers (Slack, LinkedIn, Facebook). It *is* visible
to Googlebot, to Rich Results Test, and to any JS-rendering checker.

Build-time injection into `index.html` was considered and rejected: store resolution is
per-hostname at runtime (`app-runner.ts:135-137`, `domain = globalThis.location.hostname`
→ `getPageContext({ domain })`), so one bundle deliberately serves many brands. Baking one
brand into the shell contradicts that.

Closing the gap requires per-request injection at the Cloudflare layer or in the storefront
pod — neither is this repo. **Recommend a separate ticket**; this spec is the input to it,
since it defines the exact node to inject.

## 4. Backend dependency — `brandProfile` on `StoreResponseType`

None of the differentiating fields exist today. `StoreResponseType`
(`vc-module-x-api/src/VirtoCommerce.Xapi.Core/Schemas/StoreResponseType.cs`) exposes only
`storeId, storeName, catalogId, storeUrl, assetPublicUrl, languages, currencies, settings,
graphQLSettings, dynamicProperties`.

Requested contract — a typed extension, implemented in `vc-module-ucp`'s already-scaffolded
`VirtoCommerce.UCP.ExperienceApi` project (it can extend `StoreResponseType` via
`ExtendableGraphType`):

```graphql
type StoreBrandProfileType {
  legalName: String        # "Acme Industrial Supply, Inc."
  alternateName: String
  description: String      # one sentence; feeds og:description + JSON-LD description
  tagline: String          # short; feeds og:title suffix
  logoUrl: String          # store brand logo, >= 112x112, absolute or store-relative
  shareImageUrl: String    # og:image, ~1200x630
  foundingDate: String     # ISO 8601 date
  sameAs: [String!]        # social / knowledge-graph profile URLs
  contactPoints: [StoreContactPointType!]
  returnPolicyUrl: String  # see note below
}

type StoreContactPointType {
  contactType: String      # "Customer Service", "Sales", ...
  telephone: String
  email: String
}

extend type StoreResponseType {
  brandProfile: StoreBrandProfileType
}
```

Notes for whoever implements it:

- `Store.Description` and `Store.Email` already exist on the platform entity
  (`vc-module-store/.../Model/Store.cs`) and are simply not exposed — `description` and a
  default `contactPoints` entry can be sourced from them rather than added as new config.
- Google additionally recommends `hasMerchantReturnPolicy` and `hasShippingService` for
  ecommerce organizations. Return policy is also a section in VCST-5537's `/llms.txt`
  template — the same data serves both. `returnPolicyUrl` above is the minimum viable
  version; a structured `MerchantReturnPolicy` is a later increment.
- The same brand data should back VCST-5535's manifest and VCST-5537's `/llms.txt`, so a
  typed contract (rather than store settings or dynamic properties) is the right call.

**Codegen:** once the field ships, regenerate with `yarn generate:graphql-types` against a
backend that has the module installed. Never hand-edit `client-app/core/api/graphql/types.ts`.

## 5. Phasing

The frontend must not sit blocked on §4. Two increments:

**Phase 1 — ship now, zero backend dependency.** Emit a valid, useful node from data that
already exists: `@id`, `@type`, `name`, `url`, `logo`, plus site-wide `og:site_name`. Google
specifies **no required properties** for Organization, so a partial node is legitimate, not
a stub.

**Phase 2 — when `brandProfile` lands.** Add `description`, `alternateName`, `legalName`,
`foundingDate`, `sameAs`, `contactPoint`, and the real `og:image` / og:description /
og:title-with-tagline.

Phase 1 is the deliverable of this ticket. Phase 2 is a follow-up PR against the same design.

## 6. Files

```
client-app/core/composables/
  useBrandProfile.ts          # data layer: resolves brand facts (new)
  useBrandProfile.test.ts
  useOrganizationSchema.ts    # emits JSON-LD, homepage only (new)
  useOrganizationSchema.test.ts
  useStoreSocialMeta.ts       # emits site-level OG tags (new)
  useStoreSocialMeta.test.ts
client-app/core/composables/index.ts   # re-export
client-app/App.vue                     # call the two emitters once
```

Three units rather than one, because they have genuinely different lifetimes: the data layer
is pure resolution, the JSON-LD is homepage-scoped, the OG tags are site-scoped. Each is
independently testable.

## 7. `useBrandProfile()` — the data layer

Returns computed refs. Responsibilities:

**Absolute URLs.** JSON-LD `url`/`logo` and `og:image` must be absolute. Resolve every
candidate with `new URL(value, location.origin).href`; drop values that throw.

**The white-labeling logo trap — important.** `useWhiteLabeling().logoUrl` returns the
*visiting buyer organization's* logo when `isOrganizationLogoUploaded` is true (B2B white
labeling swaps branding per logged-in org). Organization JSON-LD describes the **store
brand**, so publishing that would attribute a customer's logo to the merchant's identity.

Logo resolution order:
1. `store.brandProfile.logoUrl` (Phase 2) — explicit store brand logo, always preferred.
2. `whiteLabelingSettings.logoUrl` **only when `isOrganizationLogoUploaded !== true`**.
3. `themeContext.settings.logo_image` (theme default), resolved to absolute.

**`url`** — `store.storeUrl` if absolute, else `location.origin`.

**`@id`** — `` `${location.origin}/#organization` ``. Stable per store domain, so other
nodes can reference it.

## 8. `useOrganizationSchema()` — the JSON-LD

**Mount point: `App.vue`.** Not `home.vue`. `/` has no dedicated route — it falls through
`/:pathMatch(.*)*` to `pages/matcher/matcher.vue`, which picks by priority Builder.io (1) →
Virto Pages CMS (2) → internal (3), and only the internal previewer maps `"/"` to
`home.vue` (`pages/matcher/internal.vue:21`). If a CMS or Builder.io homepage exists,
`home.vue` never mounts and anything placed there is silently absent. `App.vue` is above
that competition and already owns global head state.

**Homepage detection.** Locale-prefixed homepages (`/fr`, `/fr/`) count. Use the existing
helper from `useLanguages()`:

```ts
const isHomePage = computed(() => getUrlWithoutPossibleLocale(route.path) === "/");
```

Per Google's guidance the markup belongs on the homepage or a single about page and should
*not* be on every page — so gating is correct, not an optimisation.

**Emission.** A pure builder function, exported for testing:

```ts
export function buildOrganizationNode(facts: BrandFacts): Record<string, unknown> | null
```

It returns `null` when the node would not be worth emitting (see the degradation rules
below), and the caller emits no script tag in that case.

Emitted through `useHead` with a reactive getter, so it appears/disappears on navigation:

```ts
useHead({
  script: () =>
    isHomePage.value
      ? [{ type: "application/ld+json", innerHTML: JSON.stringify(buildOrganizationNode(facts.value)) }]
      : [],
});
```

Plain `useHead` rather than `@unhead/schema-org`: the latter would add a dependency and
bundle weight for a single node, and `defineOrganization`'s typing buys little here.

**Phase 1 output:**

```json
{
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": "https://store.example.com/#organization",
  "name": "Acme Industrial Supply",
  "url": "https://store.example.com/",
  "logo": "https://store.example.com/assets/logo.svg"
}
```

`@type: "OnlineStore"` per the ticket — a subtype of `OnlineBusiness` → `Organization`, so
consumers matching on `Organization` still resolve it.

**Degradation rules — omit, never emit empty.** A key is included only when its value
resolves to a non-empty string (or, for `sameAs`, a non-empty array of absolute http(s)
URLs after filtering and de-duplication). `contactPoint` is emitted only when at least one
of `telephone` / `email` is present. An empty `sameAs: []` or `"logo": ""` is worse than
the key's absence — it asserts "no profiles exist."

If `name` cannot be resolved, emit **nothing at all**: a nameless Organization node is not
useful and risks polluting entity resolution.

## 9. `useStoreSocialMeta()` — Open Graph

### 9.1 Existing state

Three facts from the audit in [`findings.md`](./findings.md) bear on this design:

1. OG tags are already emitted in seven places, each a page-local `useSeoMeta` copy with no
   shared owner. So there is no existing seam to extend.
2. `ogSiteName` occurs nowhere in the codebase (0 matches).
3. `builder-io.vue` and `vp-markdown.vue` set title and description only — **no OG tags at
   all** — and they are previewer priorities 1 and 2 for `/`. So a Builder.io or Virto Pages
   homepage today publishes zero Open Graph tags. That is the case the ticket's item 3 is
   really about, and it is not fixable without touching those pages.

### 9.2 What this composable owns

Given the above, the only thing that can be added safely without touching seven files is the
**site-level identity tag that nothing currently owns**:

| Tag | Owner | Why |
|---|---|---|
| `og:site_name` | this composable, **site-wide** | Nothing emits it today; it is a store-level fact, not a page fact |
| `og:image` (site default) | this composable, homepage only, **Phase 2** (`brandProfile.shareImageUrl`) | unhead dedupes meta by `property`, so a page setting its own `og:image` still wins |

`og:title` / `og:description` / `og:url` / `og:type` are **left with the pages**. Not because
that is a good design — it is not — but because centralising them means editing seven call
sites with seven different data sources and gating conventions. That is a refactor, and
`findings.md` proposes it as its own ticket.

Phase 1 therefore adds only `og:site_name` (from `store.storeName`). **No `og:image` in
Phase 1** — the only available image is the logo, whose aspect ratio is wrong for a 1200×630
share card, and a badly-cropped card is worse than none.

### 9.3 Interaction with the existing gating convention

Every page emitter gates on an anchor-visibility ref (`homePageAnchorIsVisible`,
`canSetMeta`, `staticPageAnchorVisible`) precisely because previewers mount concurrently and
would otherwise fight over the head. This composable sits in `App.vue`, above that
competition, so it needs no such gate — it gates on the route instead (§8). That is the
reason for the mount point, and it is why the JSON-LD does not inherit the same fragility.

## 10. Adjacent defects

Eight pre-existing defects surfaced while surveying the head/SEO code. None is fixed here
and none affects this design; they are recorded with file/line and evidence in
[`findings.md`](./findings.md) so they can be filed as tickets.

One is worth naming here because it interacts with §8: `index.html:32` ships
`<meta name="robots" content="noindex">` to every environment, which conflicts with Google's
requirement that the `logo` image be crawlable and indexable.

## 11. Test plan

Unit tests via vitest, no DOM assertions:

- `buildOrganizationNode()` is pure — assert the returned object directly. This is the
  reason it is extracted. Cases: full facts; missing `name` → returns null/undefined;
  empty `sameAs` → key absent; relative logo → absolutised; non-absolute `sameAs` entry →
  filtered; duplicate `sameAs` → de-duplicated.
- `useBrandProfile` logo precedence, with `isOrganizationLogoUploaded: true` asserting the
  org logo is **not** used.
- Homepage detection: `/`, `/fr`, `/fr/`, `/catalog`, `/fr/catalog`.

Deliberately no `document.querySelector` assertions on injected tags — jsdom state leaks
across tests within a file and such assertions can pass against a node left by an earlier
test.

**Verification before the PR:** `yarn validate:types` (`vue-tsc --build --force`),
`yarn lint`, `yarn test:unit`. Manual: Rich Results Test / `view-source` on a locally built
preview to confirm the node is present on `/` and absent on `/catalog`.

## 12. Acceptance criteria

1. Homepage `/` (and locale-prefixed equivalents) carries one `application/ld+json` script
   with a valid `OnlineStore` node including `@id`, `name` and `url`, plus `logo` whenever a
   store-brand logo resolves (§7).
2. The node is absent on non-homepage routes.
3. The node appears regardless of which previewer renders the homepage (internal,
   Virto Pages, Builder.io).
4. `og:site_name` is present site-wide.
5. No key is emitted with an empty or relative-URL value; a missing `name` suppresses the
   whole node.
6. A logged-in buyer whose organization has uploaded its own logo does **not** change the
   published `logo`.
7. Type-check, lint and unit tests pass.
8. Documented: the markup is client-rendered and therefore invisible to non-JS agent
   crawlers (§3).

## 13. Open questions

1. Does the `brandProfile` contract in §4 get accepted as specified, and by whom /
   when? Phase 2 is blocked on it.
2. Is a follow-up ticket opened for server/edge injection (§3), and does Oleg accept
   frontend-only as done for VCST-5536 given it is not a conformance blocker?
3. Should `foundingDate` and `legalName` be in the first backend cut at all — neither
   affects agent shopping behaviour, unlike return policy and contact point.
