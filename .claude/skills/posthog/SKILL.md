---
name: posthog
description: How PostHog analytics works in vc-frontend and how to extend or verify it — the posthog module on the useAnalytics bus, the event and identity contract shared with the backend VirtoCommerce.PostHog module, adding an event, checking events on qa, and querying PostHog. Use when the user asks about PostHog, product analytics events, page views, identify/groups, the analytics pilot, or wants to add or debug a tracked event.
---

# Working with PostHog in vc-frontend

Google Analytics stays. PostHog is a **second tracker** on the same bus (`useAnalytics().addTracker`), so a
component never talks to PostHog directly: it calls `analytics("<event>", …)` once and every tracker gets it.

## Where things are

| What | Where |
|---|---|
| Module (gate, SDK load, tracker, identity, page views) | `client-app/modules/posthog/` — read its `README.md` first |
| Event → PostHog mapping | `client-app/modules/posthog/events.ts` (GA4 names: `view_item`, `add_to_cart`, `purchase`, `search`, `login`, `form_open`…) |
| Identity (`identify`, `group("organization")`, `reset`) | `client-app/modules/posthog/identity.ts` |
| Bus and event types | `client-app/core/composables/useAnalytics/`, `client-app/core/types/analytics.ts`, custom events in `analytics-custom.ts` |
| Shared item mapper + pending login | `client-app/core/utilities/analytics/{items,pending-login}.ts` (used by GA and PostHog) |
| Markup-driven events (`view_item`, `select_item`, `view_item_list`) | `client-app/core/plugins/dom-analytics/` (`data-vc-track` roles) |
| Settings | store-level, module id `VirtoCommerce.PostHog`: `PostHog.EnableTracking`, `PostHog.ProjectToken`, `PostHog.ApiHost`, `PostHog.Autocapture`, `PostHog.SessionRecording` — registered by the backend module, read via `useModuleSettings` |

## The contract with the backend (do not drift)

- `distinct_id` = **platform user id** (`useUser().user.value.id`). The backend module sends `order_created`,
  `order_paid`, `order_cancelled`, `user_registered`, `user_logged_in`, `quote_requested` under the same id.
- Group type `organization`, key = organization id. No names, emails or addresses in any property — ids only.
- Person properties: `contact_id`, `organization_id`, `is_sales_rep`, `session_kind` (`self | impersonated | anonymous`);
  `session_kind` and `is_sales_rep` are also super properties on every event (filter impersonated sessions there).
- Shared property names: `store_id`, `order_id`, `order_number`, `currency`, `total`, `items_count`, `item_ids`,
  `item_skus`, `organization_id`, `quote_id`, `form_name`.
- Event names are GA4's, snake_case. A new event is named for the fact (`form_open`), never for the UI (`button_click`).

## Adding a tracked event

1. Is it already on the bus? Grep `analytics("` and `data-vc-track` before adding anything.
2. New event: add it to `ICustomAnalyticsEventMap` in `client-app/core/types/analytics-custom.ts`
   (`name: [arg, params?: EventParamsType]`), then `yarn build:core-types` (the map is part of the `@vc-frontend/core` contract).
3. Add a handler to **both** `modules/posthog/events.ts` and `modules/google-analytics/events.ts` — a tracker without
   a handler logs a warning on every fire. Map through `productToAnalyticsItem` / `lineItemToAnalyticsItem`.
4. Fire it from the feature: `const { analytics } = useAnalytics(); analytics("formOpen", "quote_request", { quote_id })`.
   Fire only in the branch that is the event (a quantity change is not an add); mirror a copied handler's tracking.
5. Tests: one case per handler in `events.test.ts` of each module (mock `./client` / `./utils`), and the
   "handles every event the bus dispatches" list in `modules/posthog/events.test.ts` gets the new name.
6. A page view needs nothing: `page-views.ts` sends `$pageview` with `route_name` on every navigation.

## Verifying

- Nothing is sent in development mode (`IS_DEVELOPMENT` gates the bus and the module). Build and preview:
  `APP_BACKEND_URL=https://vcptcore-qa-storefront.govirto.com` in `.env.local`, then `yarn build-only && yarn preview`
  (proxy on :3000). Add `?__posthog_debug=true` to the URL to see every capture in the console.
- Settings reach the SPA? `curl -s $APP_BACKEND_URL/graphql -H 'content-type: application/json' -d '{"query":"{store(domain:\"<host>\"){settings{modules{moduleId settings{name value}}}}}"}'`
  must list `VirtoCommerce.PostHog`.
- PostHog → Activity → Live events: filter by `distinct_id` (the platform user id) or `source = virto-platform`
  for backend events. Persons → the `organization` group on the person.
- Sign-in reloads the page: expect exactly one `login` on the page the sign-in lands on (`pending-login.ts`);
  sign-out → the next page starts a fresh anonymous id (`reset()` on boot).
- Bundle: `posthog-js` must be its own lazy chunk (`DEFERRED_LIBS` in `vite.config.ts`), never in `vendor`.
- Unit gate: `yarn vitest run client-app/modules/posthog client-app/modules/google-analytics client-app/core/utilities/analytics`.

## Querying PostHog (when asked what the data says)

- UI: Product analytics → Trends / Funnels; HogQL in Data management → SQL, e.g.
  `select event, count() from events where timestamp > now() - interval 7 day group by event order by count() desc`.
- API: `POST https://us.posthog.com/api/projects/<id>/query/` with `{"query":{"kind":"HogQLQuery","query":"…"}}` and a
  **personal** API key (`Authorization: Bearer phx_…`). The project token (`phc_…`) only captures; it cannot read.
- Free plan: 1M events/month, 1 project, 1-year retention; group analytics free for the first 1M events.

## Pitfalls

- `hasModuleSettings` from `useModuleSettings` is a `ComputedRef`: gate on `.value` (GA/Hotjar's `!hasModuleSettings` is a latent bug — don't copy).
- The bus catches only synchronous throws: keep handlers synchronous and wrap risky mappings in `try/catch` + `Logger.error`.
- `person_profiles: "identified_only"`: an anonymous visitor has no person until `identify`; don't "fix" that.
- The project token is a public browser key by PostHog's design, but never log it and never put a personal key in the SPA.
- No consent layer exists in the theme yet (`TODO` in `modules/posthog/index.ts`); autocapture and recording stay off until there is one.
