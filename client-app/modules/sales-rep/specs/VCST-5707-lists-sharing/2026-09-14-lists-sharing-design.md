# Lists — share one list with several customers (VCST-5707, FE)

**Jira:** [VCST-5707](https://virtocommerce.atlassian.net/browse/VCST-5707) — "[BFE] [Sales Rep] [Lists] Sharing improvements" (epic [VCST-5142](https://virtocommerce.atlassian.net/browse/VCST-5142) Sales Rep Hub).
**Branch:** `feat/VCST-5707-lists-sharing-improvements` off `dev`. Blocked on [VCST-5925](https://virtocommerce.atlassian.net/browse/VCST-5925) (BE).

## Goal

A Sales Rep can share one list with several customer organizations at once, add and remove
recipients without disturbing the others, and see who the list currently reaches. Sharing gets its
own dialog, separate from renaming.

## At a glance

The bug the ticket exists to fix: sharing with a second customer replaced the first, and the first
then got a 403 on a link that used to work. The cause is a **replace-set** wire — one
`sharedWithId` per list — so any client with an incomplete view of the audience silently revoked
everyone it had not loaded.

```
BEFORE                              AFTER
sharingSetting.sharedWithId         sharingSetting.targets[]      ← read
  one id, owner only                  id + name + subtitle + imageUrl,
                                      resolved by the module owning the scope

changeWishlist(sharedWithId)        changeWishlist(               ← write
  replaces the single target          addSharedWithIds,
                                      removeSharedWithIds)
                                      both omitted = untouched

"List settings" — one dialog        Rename  ·  Share  ·  Remove list
  name + description + sharing        name + description | scope + audience + message
```

The list-actions menu and the two dialogs are prescribed by the Acceptance, not chosen here:
item 1 "Rename (previous Edit)", item 2 "Share (new popup)", item 3 "Delete", plus an Action-wheel
screenshot.

## Decisions (confirmed with requester)

1. **Delta writes, never a replace-set** (2026-09-09). The picker contributes `addSharedWithIds` /
   `removeSharedWithIds`; omitting both leaves the audience untouched. A replace-set would
   reintroduce the exact failure this ticket fixes the moment the client's view is partial.
2. **Emptying the recipients list does not stop sharing** (2026-09-10). Save stays disabled at zero
   and the field says where to go instead. Changing the scope is the way out. The contract calls
   "stop sharing" a scope switch to `Private`, and the scope lives in the modal, not in the element.
3. **Share is offered to the list's owner only** (2026-09-14). `targets` comes back for the owner
   and for nobody else, so a non-owner with Write access would be editing an audience they cannot
   see. The menu item and the list-details button both gate on `isOwner` plus `isCorporateMember`.
4. **The message is always offered, and travels with the share** (2026-09-11). It is persisted as
   `sharingSetting.message` (VCST-5728), so hiding the field until someone new is added would hide
   a value that is already saved. Recipients are notified only when customers were actually added.
5. **One notification per save, not one per organization** (2026-09-12). `sendCustomerCommunication`
   takes `organizationIds`, so a person who belongs to several of them still receives it once.
6. **The confirmation names the action it confirms** (2026-09-14). Moving to `Private` asks "Stop
   sharing this list?" with a **Stop sharing** button — the Acceptance's wording, with "page"
   corrected to "list". Swapping one sharing scope for another asks "Change who can access?" with
   **Change access**, because that moves the audience rather than ending it. The body names the
   result — "Everyone the list is shared with will lose access" — rather than the Acceptance's
   "anyone with the link", which is true for one of the four scopes it can be leaving, wrong for
   Specific customers (access follows org membership) and backwards when the scope being moved to
   _is_ Anyone with link.
7. **Select-all and picker paging are dropped, not pending** (2026-09-14). The frame draws Select-all
   as the dropdown's first row and `VcSelect` renders no slot there; a sentinel option in `items`
   disappears as soon as the rep types, which is exactly where "select all matching" is wanted.
   Paging needs the kit's search emit to be useful. Both belong to
   [VCST-5923](https://virtocommerce.atlassian.net/browse/VCST-5923). Acceptance 2.1 ("native
   search, shows how many is selected") is satisfied today: the kit's own client-side filter runs
   over the whole served set, since the picker loads it up front.

## Verified facts (from the codebase and the live backend)

- `SharingSettingType.targets: [SharingTargetType!]!` — `id` plus `name`, `subtitle` and `imageUrl`
  resolved server-side by the module owning the scope. Owner-only; empty for other viewers and for
  non-targeted scopes. `sharedWithId` remains as the deprecated first-target projection.
- `InputChangeWishlistType`: `addSharedWithIds`, `removeSharedWithIds` and `message` each **require
  `scope` in the same write** and are ignored by scopes without targets. A `message` of `null`
  leaves it unchanged; empty or whitespace clears it. Backend cap 1024 characters.
- **A write that omits `scope` must not touch sharing, and one that omits `listName` must not touch
  the name.** Verified against `vcst-qa` on a throwaway list: a rename left `sharingSetting` intact,
  a share left the name intact. This is what lets the two dialogs each send only their own fields.
- `VcSelect` in `multiple` mode carries whole **items** in its model and matches them through
  `valueField` (`vc-select.vue:351`), so a late-arriving option list cannot drop a preselection.
- `VcSelect`'s own clear emits an empty array through the same `change` event as unticking the last
  option — one interception point covers both.
- `VcTabSwitch` renders its `<input type="radio">` with `@apply hidden`, so `display: none` strips
  the checked state from the accessibility tree. Its `ariaLabel` prop lands on the visible
  `<button>`, which is the only consumer-side place left to say which tab is selected.
- `KeepAlive` nulls a template ref on deactivate: `unmount` calls `setRef(…, null)` before the
  keep-alive branch. The modal's `canSave` / `payload` reads rely on exactly that.
- `useWishlists` keeps `list`, `lists` and `listLoading` at **module** scope, shared by every caller
  including the dialogs. `list` survives navigation.
- `Mutations.changeWishlist` is `Maybe<WishlistType>` in the schema while `changeWishlist()` returns
  it as non-null, so reads through the mutation result must be optional or a persisted list reports
  itself as a failed save.
- `VcConfirmationModal` hardcodes its confirm button to "OK" with no way past it.
- HeadlessUI recognises a nested dialog through provide/inject, while `ModalHost` renders the modal
  stack as siblings. A confirmation opened through `openModal` therefore reaches the share dialog as
  an outside click and dismisses it, draft and all.

## Architecture

### 1. Two dialogs, each writing only what it owns

| dialog | component                          | sends                                                  |
| ------ | ---------------------------------- | ------------------------------------------------------ |
| Rename | `add-or-update-wishlist-modal.vue` | `listName`, `description`                              |
| Share  | `share-wishlist-modal.vue`         | `scope`, `sharingKey`, and the scope element's payload |

Creating a list goes through the Rename dialog and starts `Private`; sharing happens afterwards.
The Share dialog's primary action reads **Share** while a scope with recipients is selected and
**Save** otherwise. List details gains a Share button beside List settings.

`sharingKey` is minted once per open, never inside a computed: it is what the customer notification
links to, so it must not change between the link the rep copied and the one the save persists. The
save replaces it with the key the server actually stored.

### 2. The scope registry (`shared/wishlists/composables/useWishlistSharingScopes.ts`)

Core owns Private, My organization and Anyone with link; the sales-rep module contributes Specific
customers through `registerSharingScope`. The registration gained `icon` and `order` — the registry
appends contributions after core's scopes, which put Specific customers last.

`VcTabSwitch` replaces the select: four tabs, each under its provider's glyph. A scope the list
already carries stays listed even when it is not on offer, or saving would silently rewrite it; it
renders no controls in that state, so nothing can be contributed for a capability the viewer lacks.

The tab strip is a `<fieldset>` with the "Who can access" label as its `<legend>` — `role="group"`
on a div is what Sonar rejects (Web:S6819), and a `radiogroup` role would promise `role="radio"`
children the kit does not render.

### 3. What a scope element exposes

```ts
interface IWishlistSharingScopeExposeType {
  canSave?: MaybeRef<boolean>;
  dirty?: MaybeRef<boolean>;
  payload?: MaybeRef<WishlistSharingScopePayloadType>; // add/remove/message
  onSaved?: (context: WishlistSharingScopeSavedContextType) => Promise<void> | void;
}
```

Typing the raw side is what makes the contract checkable at the contributor's end; the modal reads
it through Vue's expose proxy, which unwraps every ref. `onSaved` receives the list name, the
sharing link and **the audience the server persisted**, so a scope reports what was saved rather
than its own draft. It must handle its own failures — the list is already persisted by then.

All four types are published through `@vc-frontend/core`, since the sales-rep module is being
prepared to ship as a federated plugin.

The selected scope's controls are wrapped in `<KeepAlive>` so a look at another tab does not throw
away the recipients the rep picked. The cache dies with the dialog, so the next open re-reads the
server. Rejected: a modal-owned draft bag through provide/inject — every field to retain has to be
opted in, and it puts a second state owner next to the expose contract.

### 4. The customer scope (`modules/sales-rep/components/wishlist-customer-sharing.vue`)

The draft is seeded once from `targets` and compared against it:

```ts
addedIds   = selected \ persisted
removedIds = persisted \ selected
```

The picker lists every served customer up front (one page of 100, warned above that) merged with
any persisted target the page never fetched, so unticking a granted customer stays possible. Options
and recipient rows are two-line — avatar, organization, city — and carry the organization's own logo,
with initials standing in.

`Clear all` and the field's own clear both route through `clearSelection`, which keeps the rows in
hand and offers them back; any other change retires the offer. Per-row remove moves focus to the row
that takes the deleted one's place.

### 5. Notification (`useSalesRepCommunication`)

One `sendCustomerCommunication` per save, over `addedIds` only. The body is the rep's note or a
default naming the list, with the sharing link appended. Delivery problems are a **warning** — the
list is already saved — and repeated warning codes are collapsed, since the backend repeats them
once per organization and the copy names none of them.

A save that only removed a recipient or reworded the note notifies nobody and says so.

### 6. The confirmation (`stop-sharing-confirmation-modal.vue`)

Fires from Save when the persisted scope is a sharing scope, the selected scope differs, and there
is an audience to lose. So: not on a first share out of `Private`, not when recipients change inside
one scope, and not when the scope being left has no recipients. Its `stopping` prop picks the copy
pair (Decision 6).

Built as its own component rather than `VcConfirmationModal`, and rendered inside the share dialog's
own tree rather than pushed onto the modal stack — see Verified facts.

### 7. Shared list state (`useWishlists`)

`updateWishlist` returns the saved list — the mutation is the only place the server's own sharing key
surfaces — and merges it into both `list` and `lists`. Merged rather than swapped in: the mutation
selects fewer fields than the list queries, so replacing the entry would blank the card's item count
and modified date. `list` is only touched when it holds the same list, since a save from the lists
page must not put another list under whatever page is mounted.

The list-details skeleton is gated on `list?.id !== listId` rather than `!list`: the ref survives
navigation, so the plain check leaves the previous list's frame up while the next one loads.

## Testing

| file                                      | covers                                                                                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `share-wishlist-modal.test.ts`            | which scopes are listed and in what order, the KeepAlive'd draft, Save gating, the payload, the confirmation's triggers and variants, the follow-up, the link |
| `wishlist-customer-sharing.test.ts`       | the picker, the recipients list and its undo, the message, the exposed contract, the notification and its counts                                              |
| `wishlist-sharing-recipients.test.ts`     | rows, collapse/expand, focus after remove, the list's accessible name, the avatar's fallbacks                                                                 |
| `stop-sharing-confirmation-modal.test.ts` | both copy pairs and both outcomes                                                                                                                             |
| `useWishlists.test.ts`                    | the saved list reaching the cards without blanking them, and not reaching another page's list                                                                 |
| `wishlist-status.test.ts`                 | the recipient count, including zero                                                                                                                           |

## Out of scope

- Select-all, its row counter, and picker paging — VCST-5923 (Decision 7).
- Person-level sharing. `Customer` is the only targeted scope and its id space is organization ids.
- Opening up link- and organization-shared lists to `shoppable`; that stays a product decision.
- The Acceptance's "notification template includes the Organisation Name" — deferred pending which
  layer product means, the platform email template (BE) or the free-form title we compose (FE).

## Open

- `yarn generate:graphql-types` and `generate:backend-packages` must be re-run against a backend
  carrying VCST-5925. The current `core/api/graphql/types.ts` was generated against `vcptcore-dev`
  and carries two unrelated fields from it (`isLockedForCurrentUser`, Loyalty's `storeId`).
- Recipient-side verification once the BE ships: the list appears with `isOwner: false` and the
  `shared_with_me` status, no menu, and `/shared-list/:key` opens without a 403. No FE change
  expected; the flows live in vc-testing-module, which also needs updating for the dialog split and
  the new `wishlist-sharing-*` test ids.
- `VcTabSwitch` has no `role="radio"` / `aria-checked` and no arrow-key roving — a ui-kit gap that
  the `ariaLabel` workaround only papers over.
- The success toast counts `context.targets.length || selected.length`. The fallback exists only
  because the current backend resolves no targets; once VCST-5925 lands it masks the opposite case,
  a save that persisted nobody, which would then report the drafted audience as saved. Drop the
  fallback with the regeneration above.
- The dialog leaves out the "Notify via" checkboxes the Figma carries, and its recipient rows show
  the customer's address where the Figma shows an email — both settled with the requester. Every
  share goes out on email and push, so the checkboxes would never be anything but ticked and
  disabled, and the picker has no email search behind it.
