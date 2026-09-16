# Technical fit with Virto Commerce

The operation names below were read out of `client-app/core/api/graphql/` and
`client-app/modules/*/api/graphql/` on `dev` at the time of writing. Field-level shapes
(filter grammar, facet support) are **not** verified yet — see
[10-open-questions.md](10-open-questions.md).

## The shape of the thing

The integration surface is two Python classes. That means the agent is a **server-side
service that sits beside x-api**, not something that lives in the Vue theme. The theme's
role is host: it owns the session, renders what the agent's presentation tool calls
describe, and links to our own checkout.

```
 Vue storefront (vc-theme-b2b-vue)
   │  chat surface + presentation components
   │  X-Session-Id, user's auth token bound at session start
   ▼
 Agent service  ── Messages API ──▶ Claude
   │  StorefrontBackend implementation
   ▼
 x-api (GraphQL)  ──▶  VC Platform modules
```

Three consequences worth stating up front:

1. The model never sees a user id, a token, or a checkout URL. All three stay server-side,
   which is exactly the boundary our customers' security reviews ask about.
2. The theme needs no new API of its own — the agent service calls x-api with the session's
   credential, the same one the storefront would use.
3. Nothing about this requires the theme. A headless customer gets the same agent with
   their own host. That is good for productising it.

## `StorefrontBackend` → x-api

| Method | x-api operation | Fit |
|---|---|---|
| `search_products` | `searchProducts` (+ `getSearchResults`, `getCategories`) | Direct. Filter/term grammar needs checking against `SearchFilters` |
| `get_product_details` | `getProduct` (+ `getProductConfigurations`) | Direct |
| `get_cart` | `getFullCart` / `getShortCart` | Direct |
| `add_to_cart` | `addItemToCart`, `addItemsCart`, `addBulkItemsCart` | Direct, and bulk is a bonus (see below) |
| `update_cart_item` | `changeFullCartItemQuantity` / `changeShortCartItemQuantity` | Direct |
| `remove_from_cart` | `removeCartItems` | Direct |
| `get_orders` | `getOrders`, `getOrganizationOrders` | Direct; org-scoped orders is a B2B bonus |
| `get_order` | `getOrder` | Direct |
| `get_account_context` | `getMe` + `getOrganizations` | Direct. This is where B2B context enters |
| `get_fulfillment_options` | `availableShippingMethods` on cart, `getCartPickupLocations`, `getFulfillmentCenters` | Direct |
| `checkout_handoff` | our own `/checkout` route — or a quote / purchase request | Default behaviour; see below |
| `get_preferences` | **no equivalent** | Gap |
| `search_policies` | `getPage` / `getPageDocument` | Partial — pages exist, search over them does not |
| `get_disclosure` | **no equivalent** | Switch off (`enable_disclosures` is off by default) |

Roughly ten of thirteen methods are a thin wrapper over an operation we already ship. That
is the headline finding: **the shopping agent is mostly plumbing against x-api, not new
backend work.**

### The three gaps

**`get_preferences`.** There is no `UserPreferences` object in x-api. Options, cheapest
first: return an empty object and let the blueprint's own memory extraction carry
preferences (it is designed to); or synthesise from wishlists, recently-browsed and the
organisation's defaults; or add a real preferences store later. Start with the first —
memory is the feature that actually fills this in.

**`search_policies`.** We have CMS pages but no full-text search across them. A returns or
shipping question is exactly the query the blueprint forces a grounding read for, so
stubbing it degrades a flow the agent is expected to be good at. Options: index a curated
set of policy pages into a small local index in the agent service; or expose search over
CMS content in x-api (bigger, and useful beyond this). Start curated.

**`get_disclosure`.** Server-authored disclosure rows are a telecom/ticketing concern (fee
disclosures). Leave the switch off; revisit only for a regulated vertical.

### Product shapes

Their three shapes (plain / family / variant) map onto our catalogue, but with one open
edge: **configurable products** (`getProductConfigurations`) are neither a plain product nor
a family-with-variants. A configured line item is created through
`changeCartConfiguredItem`, and the blueprint's cart-provenance gate accepts "only product
ids a tool returned this session". Whether a configuration id satisfies that gate, or needs
a fourth shape, is an unresolved design question — flag it early rather than discovering it
in the cart.

## Where B2B changes the picture

The ACME demos are B2C retail. Everything interesting about Virto's fit is in the
differences, and most of them are advantages.

**Checkout is not the only ending.** The README anticipates this exactly: *"With no checkout
of your own, turn the cart off or hand it to a quote, a purchase order, or a hosted checkout
URL."* We have both endings already — `createQuoteFromCart` / `submitQuoteRequest`, and
`createPurchaseRequestFromDocuments`. A B2B shopping agent whose natural close is "I've
built the basket, shall I turn it into a quote for your rep?" is a better fit for the
blueprint than a B2C one, because the handoff is a first-class shape rather than a
workaround.

**Contract pricing is already per-session.** The README: *"With account or contract pricing,
the price quoted is the session account's."* Our prices are resolved for the authenticated
organisation anyway, so the agent quotes the right number with no extra work — and the
provenance gate means it cannot quote a different one.

**Bulk is a native agent affordance.** `addBulkItemsCart` plus a list of SKUs is precisely
the kind of request that is miserable in a UI and natural in a conversation: "add the
standard monthly order for site B, but double the gloves." This is a stronger demo than
anything in the retail vertical.

**Organisations, roles and lists.** `getOrganizations`, org member roles, wishlists and
shared lists all feed `get_account_context`. The agent must respect role permissions — and
because identity is bound at session start and never passed as a tool argument, it
structurally cannot act for a different organisation.

**The merchant agent's user is probably the sales rep, not the store admin.** This is the
most Virto-specific idea in these notes. `MerchantBackend`'s read half — performance,
listings, inventory alerts, order issues — is close to what the Sales Rep Hub already shows,
and its staging half fits a rep who proposes rather than commits. Two cautions from prior
work: `salesRepOrders` is creator-scoped by design, so a rep agent sees the rep's own
orders, not the customer's full history; and the storefront API has no analytics or metrics
surface at all, so `get_business_snapshot` and `query_metrics` have no source today. A
merchant-side pilot is therefore a **second** phase and needs platform-side work, not just
plumbing.

## Where it would live in the repo

The Module Federation work (VCST-5159) already established the pattern: a backend module
ships its own frontend plugin, discovered at runtime. The same shape applies here — a
`vc-module-ai-agent` that serves the agent API and the storefront plugin, so the chat
surface is optional per deployment and does not weigh on themes that do not want it.

Frontend pieces, in the theme:

- A chat surface module composing existing ui-kit atoms — never editing ui-kit itself, and
  no hand-built buttons.
- Presentation components for the typed tool calls (product carousel, comparison, cart
  summary, order card). These are the visible product; they are also where our design system
  earns the difference against a generic chat box.
- WCAG: the retail guide names accessibility explicitly, and a conversational surface is
  easy to ship inaccessible. Screen-reader announcements for streamed output, keyboard
  navigation through results, and focus management belong in the first version, not a
  follow-up.

## The language problem

This is the one genuine architectural obstacle, and it deserves a decision rather than a
drift.

The blueprint is Python. Virto is .NET plus TypeScript. Three ways out:

| Option | What it costs | What it buys |
|---|---|---|
| **Run the Python service as-is**, as a sidecar beside the platform | A Python runtime in a .NET product line: packaging, deployment, support, our team's skills | Everything works on day one; the harness, gates and skills come free |
| **Port the harness to .NET** (Anthropic ships a C# SDK) | Large. The interfaces are ~20 methods, but the value is the harness — fencing, provenance gates, presentation validation, grounding, memory — and that is thousands of lines to reimplement and then keep correct | Fits the product line; one deployment story |
| **Take only the patterns**, build our own in .NET or TypeScript | Medium, and we lose the parts we do not think to copy | Full control, no fork to maintain |

For a **spike and a demo**, option 1 is obviously right and costs nothing to try. For a
**product**, the choice is between 2 and 3 and it is a platform-architecture decision, not
a frontend one. Do not let the spike's convenience decide it silently.

Note also that the repository is unmaintained ([01-what-it-is.md](01-what-it-is.md)): option
1 still means owning a fork, including the open bug fixes nobody will merge.
