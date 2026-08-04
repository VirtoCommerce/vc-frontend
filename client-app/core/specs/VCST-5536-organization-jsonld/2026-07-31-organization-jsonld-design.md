# VCST-5536 — Organization schema (JSON-LD) + social meta on the homepage

**Design spec — frontend only.** 2026-07-31 · branch `feat/VCST-5536-organization-jsonld`

## 1. Scope

Publish a schema.org `OnlineStore` JSON-LD node and the site-level Open Graph tags on the
storefront homepage, driven by store-configured brand data.

**In scope (this repo):** the Vue composables that build and emit the markup, homepage
route detection, degradation rules, unit tests.

**Out of scope, deliberately:** server-side / edge emission of the markup (see §3), the
backend `brandProfile` contract itself (§4 specifies it as a hand-off), and the adjacent
pre-existing defects noted in §10.

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
(`client-app/app-runner.ts`), no SSR, no prerender, no HTML rewrite anywhere in the
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

So be plain about the value split: this delivers **Google/SEO** benefit, and delivers
**nothing to the agent audience the ticket's first sentence names**. VCST-5536 should not be
closed as if it had.

### Why build-time injection into `index.html` is not the answer

It would land in the raw HTML, which is exactly where the agents look — so it is worth saying
precisely why it is rejected. Not because of a code-capability inference, but because
multi-brand-per-environment is a **documented, supported Virto configuration**:

> "Virto Commerce allows you to configure multiple stores, each with its own domain, within a
> single environment. This enables the management of diverse websites for different brands or
> business entities using one platform and codebase."
> — [configuring-multiple-stores.md](https://github.com/virtocommerce/vc-docs/blob/main/platform/developer-guide/docs/Tutorials-and-How-tos/How-tos/configuring-multiple-stores.md)

Two mechanisms implement it: `VirtoCommerce:Stores:Domains` in `appsettings.json` maps domain
→ store, and Virto Cloud's `environments.yml` takes a list of `routes:` entries each with its
own `host:` and `root:` store. The same docs state that themes may be **shared across stores**.

This repo is the shared upstream theme, not one customer's build. Baking one brand's identity
into `index.html` would publish the wrong brand on every other domain served by that artifact
— worse than emitting nothing.

(Nuance: `environments.yml`'s `themes:` map is keyed by store code, so a given deployment *can*
give each store its own artifact, in which case build-time would work for that deployment. It
can equally point several stores at one artifact, and a product theme cannot assume which.)

### The only correct fix

Per-request injection, at the one layer that knows the `Host` header:

- **Cloudflare Snippet / Worker** — the storefront already sits behind Cloudflare (`rocket-loader`,
  `cf-fonts` appear in live responses). `HTMLRewriter` into `<head>` for `/`, brand data cached
  per host. Small; the constraint is access to the zone, not difficulty.
- **The storefront pod** — correct by construction, but a Virto Cloud infrastructure change.

Neither is this repo. **Recommend a separate ticket**; this spec is its input, since it defines
the exact node to inject.

## 4. Backend dependency — `brandProfile` on `StoreResponseType`

> **Delivered differently.** §4.1–4.4 record the ask as it was made. The backend answered with
> public store *settings* rather than a typed field — see **§4.5** for the shipped contract and
> the deltas the frontend had to absorb.

None of the differentiating fields exist today. `StoreResponseType`
(`vc-module-x-api/src/VirtoCommerce.Xapi.Core/Schemas/StoreResponseType.cs`) exposes only
`storeId, storeName, catalogId, storeUrl, assetPublicUrl, languages, currencies, settings,
graphQLSettings, dynamicProperties`.

### 4.1 Already available — no backend work

| JSON-LD / OG | Source |
|---|---|
| `name`, `og:site_name` | `store.storeName` |
| `url` | `store.storeUrl` |
| `logo` | `whiteLabelingSettings.logoUrl` (see the §7 buyer-org caveat) |
| `contactPoint.telephone` | `Frontend.SupportPhoneNumber` — an existing xAPI module setting, already in the boot payload and already rendered by the header components |
| `@id` | Derived client-side from the origin; needs nothing from the backend |

### 4.2 Required by the ticket, missing from the backend

These five are the ask. Each is named in VCST-5536 — in its JSON example, its prose, or its
Open Graph block.

| Field | Where the ticket asks for it |
|---|---|
| `sameAs: [String!]` | JSON example + prose ("social profiles") |
| `description: String` | required as `og:description`; also reused for JSON-LD `description` |
| `tagline: String` | implied by `og:title content="Yourstore — short tagline"` |
| `shareImageUrl: String` | required as `og:image content=".../og-cover.jpg"`, ~1200x630 |
| `foundingDate: String` | prose ("founding date"); ISO 8601. Absent from the ticket's own JSON example, and of limited use to shopping agents — but it is in the requirements, so it is in the contract |

```graphql
type StoreBrandProfileType {
  sameAs: [String!]        # social / knowledge-graph profile URLs
  description: String      # one sentence on what the store sells
  tagline: String          # short; suffixes og:title
  shareImageUrl: String    # og:image, ~1200x630
  foundingDate: String     # ISO 8601 date
}

extend type StoreResponseType {
  brandProfile: StoreBrandProfileType
}
```

Of the five, only `description` already exists as data — `Store.Description` on the platform
entity (`vc-module-store/.../Model/Store.cs`), merely unexposed. The other four are new store
configuration.

### 4.3 Recommended, but NOT in the ticket

Listed separately so the backend team can accept or decline them on their own merits. None is
required to close VCST-5536, and none is assumed by this implementation.

| Field | Why it might be worth it |
|---|---|
| `hasMerchantReturnPolicy` / `returnPolicyUrl` | Google's ecommerce-specific recommendation, and a section of VCST-5537's `/llms.txt` — one source would serve both. Arguably more useful to a shopping agent than `foundingDate`. |
| `contactPoint.email` | `Store.Email` already exists and is unexposed; cheap |
| `legalName`, `alternateName` | Helps entity disambiguation |
| `hasShippingService` | Google recommendation for ecommerce orgs |

A schema.org `address` is deliberately **not** listed: `Store.Country`/`Store.Region` exist but
a `PostalAddress` needs street, city and postal code, which the `Store` entity does not carry.
It is not cheaply derivable and should not be promised as such.

### 4.4 Where it lands

Ticket item 1 says the backend should "revert back during initialization query." The theme has
two boot queries — `InitializeApplication` (module gates) and `GetPageContext` (store, user,
white labeling). `brandProfile` belongs on `StoreResponseType`, which `pageContext` returns and
which is already where `storeName` and `storeUrl` arrive. It should **not** be wired into
`InitializeApplication`.

Implementation home: `vc-module-ucp`'s already-scaffolded `VirtoCommerce.UCP.ExperienceApi`
project, which can extend `StoreResponseType` via `ExtendableGraphType`. That keeps one source
of brand data behind this ticket, VCST-5535's manifest and VCST-5537's `/llms.txt`.

**Interim option:** `store.dynamicProperties` is already exposed, so a pilot store could set
`sameAs` as a Store dynamic property with zero backend work while the typed contract is built.
Untyped and undisciplined, so a bridge rather than the design.

**Codegen:** once the field ships, regenerate with `yarn generate:graphql-types` against a
backend that has the module installed. Never hand-edit `client-app/core/api/graphql/types.ts`.

### 4.5 What the backend actually shipped

[vc-module-x-frontend#10](https://github.com/VirtoCommerce/vc-module-x-frontend/pull/10) —
six platform settings, all `IsPublic = true`, `GroupName = "Virto Commerce Frontend|Store
Information"`, registered against the `Store` type:

| Setting | Type | Maps to |
|---|---|---|
| `XFrontend.BrandProfile.Description` | LongText | `description`, `og:description` |
| `XFrontend.BrandProfile.SameAs` | LongText, one url per line | `sameAs` |
| `XFrontend.BrandProfile.Tagline` | ShortText | `slogan`, `og:title` suffix |
| `XFrontend.BrandProfile.LogoUrl` | ShortText | `logo` |
| `XFrontend.BrandProfile.ShareImageUrl` | ShortText | `og:image` |
| `XFrontend.BrandProfile.ContactPhone` | ShortText | `contactPoint.telephone` |
| `XFrontend.BrandProfile.FoundingDate` | ShortText | `foundingDate` |

**Consequences for this repo.** Four, none of them blocking:

1. **No codegen.** The values arrive through the `store.settings.modules[].settings{name value}`
   passthrough the theme already queries, so `useModuleSettings("VirtoCommerce.XFrontend")` reads
   them and `types.ts` is untouched.
2. **Nothing is typed, so the frontend validates.** `sameAs` is one string to split on newlines;
   `foundingDate` and `ContactPhone` are free ShortText. §7 lists what is enforced and why.
3. **Every setting defaults to `string.Empty`,** so an unconfigured store sends `""` rather than
   omitting the key. Blank collapses to `undefined` throughout.
4. **`description` was added afterwards** — the first cut of #10 omitted it; see below.

**`logoUrl` closes the buyer-org hole.** A store-level logo now exists, so the §7 fallback chain
begins with it and only reaches white labeling when it is unset. That was the ugliest compromise
in Phase 1.

**The `description` gap, and how it was closed.** Ticket item 3 lists `og:description` and §4.2
asked for it, but the first cut of #10 had no setting for it.

Exposing `Store.Description` instead is **not possible from vc-module-x-frontend**:
`StoreResponse` (`vc-module-x-api/.../Models/StoreResponse.cs`) carries only projected fields —
`StoreId, StoreName, StoreUrl, AssetPublicUrl, CatalogId`, currencies, languages, `Settings`,
`GraphQLSettings`, `DynamicProperties` — and never the `Store` entity, so it is unreachable from
`StoreResponseType`'s resolver. It would mean changing vc-module-x-api's model, projection and
schema, plus codegen here.

A seventh setting was pushed to #10 instead (`f92f96f`), which is arguably the better source
anyway: `Store.Description` is admin-facing free text with no audience discipline, and this value
is published verbatim to search engines and social scrapers.

## 5. Phasing

The frontend must not sit blocked on §4. Two increments, both now in PR #2415:

**Phase 1 — zero backend dependency.** Emit a valid, useful node from data that
already exists: `@id`, `@type`, `name`, `url`, `logo`, plus site-wide `og:site_name`. Google
specifies **no required properties** for Organization, so a partial node is legitimate, not
a stub.

**Phase 2 — the brand profile settings.** Adds `description`, `slogan`, `sameAs`,
`contactPoint`, `foundingDate`, the store-level `logo`, `og:description`, `og:image`, and the
homepage `og:title` with the tagline. That is every field the ticket names.

Phase 2 was folded into the same PR rather than following it, because #10 landed while #2415
was still unreviewed. The PR cannot merge before #10 ships and a store carries the settings;
until then Phase 2 degrades to exactly the Phase 1 output.

## 6. Files

```
client-app/core/composables/
  useBrandProfile.ts          # data layer: resolves and validates brand facts (new)
  useBrandProfile.test.ts
  useIsHomePage.ts            # the homepage gate, shared by both emitters (new)
  useIsHomePage.test.ts
  useOrganizationSchema.ts    # emits JSON-LD, homepage only (new)
  useOrganizationSchema.test.ts
  useOrganizationSchema.emitter.test.ts
  useStoreSocialMeta.ts       # emits store-level OG tags (new)
  useStoreSocialMeta.test.ts
client-app/core/composables/index.ts   # re-export
client-app/core/constants/modules.ts   # MODULE_XFRONTEND_KEYS
client-app/App.vue                     # call the two emitters once
```

Three units rather than one, because they have genuinely different lifetimes: the data layer
is pure resolution, the JSON-LD is homepage-scoped, the OG tags are mostly site-scoped. Each is
independently testable. `useIsHomePage` exists only because Phase 2 gave the second emitter a
homepage-only tag too, and the gate must not drift between them.

## 7. `useBrandProfile()` — the data layer

Returns computed refs. Responsibilities:

**Absolute URLs.** JSON-LD `url`/`logo` and `og:image` must be absolute. Resolve every
candidate with `new URL(value, location.origin).href`; drop values that throw.

**The white-labeling logo trap — important.** `useWhiteLabeling().logoUrl` returns the
*visiting buyer organization's* logo when `isOrganizationLogoUploaded` is true (B2B white
labeling swaps branding per logged-in org). Organization JSON-LD describes the **store
brand**, so publishing that would attribute a customer's logo to the merchant's identity.

Logo resolution order:
1. `XFrontend.BrandProfile.LogoUrl` — explicit store brand logo, always preferred.
2. `whiteLabelingSettings.logoUrl` **only when `isOrganizationLogoUploaded !== true`**.
3. `themeContext.settings.logo_image` (theme default), resolved to absolute.

**`url`** — `store.storeUrl` only when it already carries an http(s) scheme; otherwise the
origin root. Note the deliberate asymmetry with `logo`: a relative logo is normal (the theme
stores `logo_image` as a bare filename) and is resolved against the origin, but a relative
`storeUrl` is misconfiguration and is **rejected rather than resolved** — resolving it would
publish whichever host the visitor is on, e.g. a preview or staging domain, as the brand's
canonical url.

**`@id`** — `` `${location.origin}/#organization` ``. Stable per store domain, so other
nodes can reference it.

**Validating the untyped settings (§4.5).** Nothing upstream constrains these values, and bad
structured data is worse than absent structured data, so each is checked before it can reach
the markup:

| Value | Rule | Why |
|---|---|---|
| `sameAs` | split on newlines; keep only entries already carrying an http(s) scheme; dedupe | A profile is off-site by definition. Resolving a relative entry against the origin would claim one of the store's own pages as an external profile of itself. |
| `foundingDate` | `YYYY-MM-DD`, round-tripped through `Date` | ShortText accepts prose. The round-trip is required, not belt-and-braces: `new Date("2026-02-30T00:00:00Z")` silently rolls over to 2026-03-02 rather than returning an invalid date. |
| `contactPhone` | must start with `+`; the dedicated setting only | The number has to be dialable by an agent, and a national-format one is ambiguous. `Frontend.SupportPhoneNumber` is deliberately **not** a fallback even though QA's value (`+1 (213) 603 3536`) would pass: it is a header display value, and structured data should carry only what a merchant set for exactly that purpose. Having its own field was the reason it was asked for in §4.2. |
| `shareImageUrl`, `logoUrl` | `toAbsoluteUrl` | Same rule as the theme logo: relative is normal for a same-host asset. |
| `description` | whitespace collapsed | LongText preserves the merchant's line breaks, which would otherwise land inside a `content` attribute and a JSON string. |

Anything failing its rule is dropped, not corrected, and the corresponding key is omitted.

## 8. `useOrganizationSchema()` — the JSON-LD

**Mount point: `App.vue`.** Not `home.vue`. `/` has no dedicated route — it falls through
`/:pathMatch(.*)*` to `pages/matcher/matcher.vue`, which picks by priority Builder.io (1) →
Virto Pages CMS (2) → internal (3), and only the internal previewer maps `"/"` to
`home.vue` (`pages/matcher/internal.vue`). If a CMS or Builder.io homepage exists,
`home.vue` never mounts and anything placed there is silently absent. `App.vue` is above
that competition and already owns global head state.

**Homepage detection.** Locale-prefixed homepages (`/fr`, `/fr/`) count. Use the existing
helper from `useLanguages()`:

```ts
const isHomePage = computed(() => getUrlWithoutLocale(route.path) === "/");
```

`getUrlWithoutLocale`, **not** the `...PossibleLocale` variant: the latter's regex matches any
two-letter segment, so `/xy` would be treated as the homepage and publish Organization markup
on a 404. `app-runner` uses the looser variant only because it runs before the store — and
therefore the supported-language list — is available; `App.vue` has it.

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

Three facts bear on this design (verified on `dev` @ `a1e3cd1a4`; re-check before relying on
them, deliberately stated without line references so they cannot silently rot):

1. OG tags are already emitted by several individual pages, each a page-local `useSeoMeta`
   block with no shared owner. There is no existing seam to extend.
2. `ogSiteName` occurs nowhere in the codebase.
3. The Builder.io and Virto Pages previewers set title and description only — **no OG tags
   at all** — and they outrank the internal previewer for `/`. So a CMS homepage today
   publishes zero Open Graph tags. That is the case the ticket's item 3 is really about, and
   it is not fixable without touching those previewer pages.

### 9.2 What this composable owns

Given the above, the only thing that can be added safely without touching seven files is the
**site-level identity tag that nothing currently owns**:

| Tag | Owner | Why |
|---|---|---|
| `og:site_name` | this composable, **site-wide** | Nothing emits it today; it is a store-level fact, not a page fact |
| `og:image` | this composable, **site-wide fallback** (`XFrontend.BrandProfile.ShareImageUrl`) | A purpose-made share card for the store. Site-wide rather than homepage-only because it is the sensible default anywhere a page has no image of its own — and a page that does have one overrides it |
| `og:description` | this composable, **site-wide fallback** (`XFrontend.BrandProfile.Description`) | Same reasoning. It is also the only thing that gives a CMS homepage an `og:description` at all (9.1 #3) |
| `og:title` | this composable, **homepage only**, `name — tagline` | Nothing owns it on a CMS homepage (9.1 #3), which is exactly the case the ticket's item 3 describes. Elsewhere the page emitters own it |

`og:url` / `og:type` are **left with the pages**: centralising them means editing every page
emitter, each with its own data source and gating convention. That is a refactor with its own
ticket.

**Why the fallbacks are safe.** Verified in `unhead` 3.2.1 (`dedupeTags`): tags key on
`meta:<property>`, and when two entries share a key the one with the higher `_p` — the later
registration — replaces the earlier. `App.vue` registers before any page component mounts, so
a page's own `useSeoMeta` always wins. The same-entry arraying path (`isMetaArrayDupeKey`, which
matches `og:*`) does not apply, since these tags come from different entries.

**No `og:image` from the logo.** Its aspect ratio is wrong for a 1200×630 share card, and a
badly-cropped card is worse than none. The tag is emitted only when the store configures a real
share image.

### 9.3 Interaction with the existing gating convention

Every page emitter gates on an anchor-visibility ref (`homePageAnchorIsVisible`,
`canSetMeta`, `staticPageAnchorVisible`) precisely because previewers mount concurrently and
would otherwise fight over the head. This composable sits in `App.vue`, above that
competition, so it needs no such gate — it gates on the route instead (§8). That is the
reason for the mount point, and it is why the JSON-LD does not inherit the same fragility.

## 10. Adjacent defects

Several pre-existing head/SEO defects surfaced while surveying. None is fixed here and none
affects this design, so they are **not catalogued in this repo** — a point-in-time audit with
file/line references would be stale within a commit or two and would read as current. They
were handed over for ticketing instead.

One is worth naming because it interacts with §8: `index.html` ships
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
- Homepage detection: `/`, `/fr`, `/fr/`, `/catalog`, `/fr/catalog`, **and `/xy`** — an
  arbitrary two-letter path that is *not* a supported locale must not count as the homepage.

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
9. A store with the brand profile configured additionally publishes `description`, `slogan`,
   `sameAs`, `contactPoint.telephone` and `foundingDate` in the node, `og:description` and
   `og:image` site-wide, and `name — tagline` as the homepage `og:title`.
10. A store with the settings unset, or without the `VirtoCommerce.XFrontend` module,
    publishes exactly the AC 1–6 output — no empty keys, no empty tags.
11. An invalid `FoundingDate` or a `ContactPhone` without a country code is omitted rather
    than published (§7).

## 13. Open questions

1. ~~Does the `brandProfile` contract in §4 get accepted as specified?~~ **Answered:**
   delivered as public store settings instead — §4.5.
2. ~~Does `description` get a source?~~ **Answered:** `XFrontend.BrandProfile.Description`
   pushed to #10 as `f92f96f` — §4.5.
3. Is a follow-up ticket opened for server/edge injection (§3), and does Oleg accept
   frontend-only as done for VCST-5536 given it is not a conformance blocker?
4. Should `foundingDate` and `legalName` be in the first backend cut at all — neither
   affects agent shopping behaviour, unlike return policy and contact point.
5. Live verification is pending: QA has `VirtoCommerce.XFrontend` installed but its public
   settings list is still empty, so nothing can be configured until #10 merges and deploys.
