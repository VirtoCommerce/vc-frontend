# PostHog Module

A second analytics provider next to [Google Analytics](../google-analytics/README.md): it registers a tracker on
[`useAnalytics`](../../core/composables/useAnalytics/README.md), so every event the storefront already sends —
by `analytics()` calls or [from markup](../../core/plugins/dom-analytics/README.md) — reaches PostHog with no change
to the call sites. On top of that it sends page views, identifies the signed-in customer and attaches their
organization as a PostHog group.

The backend half is the `VirtoCommerce.PostHog` platform module: it registers the settings below and sends the
server-side facts (orders, sign-ups, logins, quotes) under the same identity, so one PostHog person carries both the
browsing and the money. The event vocabulary and the identity contract are documented in that module's README.

## Configuration

Store-level settings of the `VirtoCommerce.PostHog` module (public, read from `store.settings.modules`):

| Setting                    | Value                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `PostHog.EnableTracking`   | `true` to load the SDK and register the tracker                                         |
| `PostHog.ProjectToken`     | The PostHog project token (`phc_…`). A browser key by PostHog's design — not a secret   |
| `PostHog.ApiHost`          | `https://us.i.posthog.com` (default) or `https://eu.i.posthog.com`                      |
| `PostHog.Autocapture`      | `false` (default): the commerce events come from the analytics bus, not from DOM clicks |
| `PostHog.SessionRecording` | `false` (default)                                                                       |

Nothing runs in development mode (`IS_DEVELOPMENT`), the same rule as the analytics bus itself. To see events
locally: `yarn build-only && yarn preview` against a backend where the module is configured, then
`?__posthog_debug=true` in the URL and PostHog → Activity → Live events.

## Events

Event and property names are the GA4 ones the Google Analytics module sends (`view_item`, `add_to_cart`,
`begin_checkout`, `purchase`, `search`, `login`, `sign_up`, …; see [`events.ts`](./events.ts)), so a funnel built
in PostHog reads like the GA4 one. Items use the shared [`AnalyticsItemType`](../../core/utilities/analytics/items.ts).

On top of the bus events:

- `$pageview` after every router navigation, with `route_name` ([`page-views.ts`](./page-views.ts)). The SDK's own
  page-view capture is off: it fires on `pushState`, before the route is resolved.
- `form_open` / `form_submit` with `form_name` (`quote_request`, `sign_up`) — the `formOpen` / `formSubmit` events
  of [`analytics-custom.ts`](../../core/types/analytics-custom.ts).

The tracker joins the bus before the SDK chunk has loaded; events captured in between (a form opened by the first
render of a direct page load) are kept in [`client.ts`](./client.ts) — fifty at most — and sent once the SDK is up
and the identity applied.

## Identity

[`identity.ts`](./identity.ts) runs on boot and whenever the user changes (a sign-in in another tab replaces the user
in place):

- signed in: `identify(<platform user id>, { contact_id, organization_id, is_sales_rep, session_kind })` and
  `group("organization", <organization id>)`. The distinct id is the platform user id because the backend module
  sends its events under the same id; the organization's name is not sent (free text, can be a person's name);
- `session_kind` and `is_sales_rep` are also registered as super properties, so every event carries them: a person
  property keeps only the latest session, and an impersonated visit must stay distinguishable from the customer's own
  ones after they sign in themselves. A user without an organization clears the group (`resetGroups`);
- signed out: `reset()` when the SDK still holds a person. A sign-out reloads every tab before the user ref clears,
  so the reset happens on the next boot — without it the next visitor's events would land on the previous customer.

A successful `login` is not sent from the sign-in page, which is about to reload: [`pending-login.ts`](./pending-login.ts)
keeps it for the page the sign-in lands on (the shared [`createPendingLogin`](../../core/utilities/analytics/pending-login.ts)).

`person_profiles: "identified_only"` — anonymous visitors cost no person profile; one is created on sign-in and the
anonymous events merge into it.

## Extending events

```ts
// client-app/app-runner.ts
void initPostHog(router, { extendEvents: extendPostHogEvents });

// posthog-events-extension.ts
import type { ExtendEventsType } from "@/modules/posthog/types";

export const extendPostHogEvents: ExtendEventsType = ({ capture, productToAnalyticsItem }) => ({
  addItemToWishList: (product) => {
    capture("add_to_wishlist", { items: [productToAnalyticsItem(product)] });
  },
});
```
