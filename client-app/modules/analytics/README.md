# Analytics Module

Sends storefront events to the platform's own analytics event store (the `VirtoCommerce.Analytics` backend module).
It is one more tracker on [`useAnalytics`](../../core/composables/useAnalytics/README.md), next to
[Google Analytics](../google-analytics/README.md): the call sites stay as they are, and no third-party service takes
part. The platform adds what it knows itself (sign-ins, registrations, orders) to the same store.

## Configuration

Store-level settings of the `VirtoCommerce.Analytics` module:

| Setting                      | Value                                                        |
| ---------------------------- | ------------------------------------------------------------ |
| `Analytics.Enabled`          | `true` to register the tracker                               |
| `Analytics.CollectAnonymous` | `true` to also send events of signed-out visitors            |

Nothing runs in development mode (`IS_DEVELOPMENT`), the same rule as the analytics bus itself. To see events locally:
`yarn build-only && yarn preview` against a backend where the module is installed and enabled.

## Events

Event and property names are the GA4 ones of the shared mapping
([`core/utilities/analytics/events.ts`](../../core/utilities/analytics/events.ts)). This version sends
([`constants.ts`](./constants.ts), `COLLECTED_EVENTS`):

| Event                 | When                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------- |
| `session_start`       | The first page of a tab's session                                                      |
| `$pageview`           | After every router navigation, with `route_name` and `page_type`                       |
| `search`              | A search submitted from the search bar                                                 |
| `view_search_results` | A page of search results loaded, with `results_count` and `results_page`               |
| `view_item`           | A product page shown                                                                   |
| `add_to_cart`         | Products added to the cart                                                             |
| `update_cart_item`    | The quantity of a cart line changed                                                    |

`login` is not sent: the platform records every sign-in attempt itself, failed ones with their reason, and sees what
the browser cannot (a sign-in on someone's behalf).

`search` reports the count of the search bar's dropdown, which may belong to an earlier keystroke. The number of
results a search really gave is `results_count` of `view_search_results` with `results_page` 1.

`page_type` ([`page-type.ts`](./page-type.ts)) is the route name in snake_case for a named route, `home` for the root,
and for a URL served by the slug matcher what its slug resolves to (`product`, `category`, `catalog`, `brand`, …). That
lookup reuses the matcher's own cached query, so no extra request goes out.

## Identity and delivery

- The user, the organization and the operator are **not** sent as identity: the backend takes them from the token.
  Each event only states who the browser believed was signed in when the action happened, and the backend drops an
  event whose user or organization differs from the token (the session changed before the batch left).
- Events are queued ([`queue.ts`](./queue.ts)) and sent in one request a second later, or at once when the page is
  hidden or left. Every event carries its own id, so a retried request is stored once. A failed request is offered
  once more and then dropped.
- A session ([`session.ts`](./session.ts)) lives in the tab's session storage, so it survives the reload a sign-in
  makes. How the visit started — landing page, external referrer (origin and path only), `utm_*` — is read once and
  travels in the `context` of every event, together with the page path, the language and the screen size.

## Adding an event

1. The event must be on the bus: see "Extending with Custom Events" in the `useAnalytics` README.
2. Map it in the shared `createAnalyticsEvents`, so every tracker gets it under one name.
3. Add the name to `COLLECTED_EVENTS`. A new name needs nothing on the backend unless the store limits
   `Analytics.AllowedEvents`.
