# VCST-5707 — frontend implementation plan (Lists sharing: one recipient → many)

**Branch:** `feat/VCST-5707-lists-sharing-improvements` @ `78d02b0e1` (= origin/dev, clean)
**BE contract:** VCST-5925 (Draft), comment 108733. `temp-VCST-5707-BE-contract.md` mirrors it — both are current.
**Layout authority:** `temp-VCST-5707-UI-spec.md` — measured Figma geometry for desktop and mobile, plus the
design gaps and the a11y/touch-target items this plan does not cover.
**Plan only.** Nothing below has been applied.

---

## 0. Still unsettled — read first

Resolved since this plan was drafted, and now reflected in both the contract comment and
`temp-VCST-5707-BE-contract.md`: the write shape is `addSharedWithIds` / `removeSharedWithIds` with an optional
revision; §1.2 is `sharingSettings[].sharedWith: SharingTargetType` — a core-declared type filled by the module
that owns the scope, so names and addresses arrive with the grant and no second lookup is needed; §2.4 now requires
BE to say where the list-level key lives; `share_replace_hint` is 13 locale files. The design is final — the Figma frames in VCST-5707
(the twelve frames inventoried in `temp-VCST-5707-UI-spec.md`) are the spec, and nothing here is design-gated.
`415:4589` and `477:11114` are **superseded** VCDZ-894 variants — do not read them. `467:4614` is a special case:
it is not in Ivan's list of current frames, but **VCST-5707's Acceptance links it** as the reference for the
multiselect dropdown, so the *behaviour* it prescribes is binding while the *visuals* come from the current frames. Two cells of the
current frames are knowingly overruled, both recorded below: Notify via (item 3) and the My-organization link
(item 6).

What is still open:

1. **The sharing key still needs BE's answer — with one fact now measured.** The share dialog reads the key from
   `list.sharingSetting?.id` (`share-wishlist-modal.vue`) and mints `crypto.randomUUID()` when absent. Contract §2.4
   asks BE to state whether `sharingSettings[].id` keeps being the list-level key or a `WishlistType.sharingKey` is
   added — until they answer, do not touch the key logic. **Measured on vcst-qa 2026-09-09:** across a create and four
   `changeWishlist` writes (two of them with a client-chosen `sharingKey: "probe-key-…"`, one with none),
   `sharingSetting.id` stayed the same server-generated GUID and never took the client value. So on today's BE the
   key we send is not what the row is keyed by, and the row id is stable across scope changes — which is what the
   link needs. Still worth BE's written confirmation, but the FE's current reading of `sharingSetting.id` is correct.

2. **In PR-A, grant display is only as good as the picker's loaded pages.** Nothing is missing from the contract —
   §1.2 delivers `sharedWith` on the grant — but it arrives with PR-B. Until then, names come from `knownOptions`
   with the raw id as fallback, exactly today's rule at `wishlist-customer-sharing.vue:75-86`.

3. **"Notify via" checkboxes — closed, not open.** **VCST-5724 is Done** on the option that removes the channel
   selection outright: Email and Push are always used and the checkboxes are gone from the dialog. VCST-5724 /
   PR #2438 (2026-08-20, `12b0112e6`) already shipped it — `wishlist-customer-sharing.vue:109-110` hardcodes both
   channels and the component has no checkboxes. The Figma frames still draw the block, so **the frames are stale
   here**: do not build the fieldset, and tell the designer to re-cut. Layout consequence in
   `temp-VCST-5707-UI-spec.md` → "Notify via — decided against the frame".

4. **Server-side search waits on VCST-5923, and is droppable.** That ticket has no description and "No
   requirements" in its AC field (assignee Maya Diachkovskaia); its title covers Select-all and load-more only.
   `VcSelect` filters client-side (`filteredItems`, `vc-select.vue:310`) and emits only `update:modelValue` /
   `change` — with no search-text emit, server-side keyword search is impossible. **Decided fallback:** wait for
   5923's implementation, and if the emit is not in it, drop server-side search from this ticket's scope and keep
   client-side filtering over accumulated pages. Nothing else depends on it.

5. **Menu entry point — decided.** Two separate dialogs: a short **Edit** (name + description) and a dedicated
   **Share**. The sharing block is extracted into its own component; see §3.4 for what that costs. **Create** is
   also name + description only: a new list starts `Private` and is shared afterwards through the Share dialog.

6. **Shareable link on the My organization tab — asked, code unchanged meanwhile.** The frames show no link field on
   that tab; `useWishlistSharingScopes.ts:55` says `supportsLink: true` and the modal derives the field from it
   (`:180`, field at `:50-66`). **Decision 2026-09-09: leave the code as it is.** Ivan is asking BE whether
   `/shared-list/:sharingKey` enforces the scope — the link carries no scope (`:182`) and the route is public and
   unguarded (`router/routes/main.ts:153`), so only the resolver decides who gets in. That question is already a line
   in VCST-5925's Acceptance. Either answer is one line in `CORE_SHARING_SCOPES`; do not pre-empt it.

---

## 1. State architecture — where the selected set lives

### 1.1 The constraint

`add-or-update-wishlist-modal.vue:68-75` renders the scope element as `<component :is="activeScopeElement" v-if=…>`.
Switching the scope select changes `activeScopeElement`, so the Customer element is **unmounted** and its
`selectedOrganizationId` / `shareMessage` refs (`wishlist-customer-sharing.vue:62-63`) die. The requirement is that
Customers → Private → Customers keeps the draft. Therefore the draft must be owned above the mount boundary, or the
instance must survive it.

### 1.2 Decision: keep the instance alive with `<KeepAlive>` in the modal

```vue
<KeepAlive>
  <component
    :is="activeScopeElement"
    v-if="activeScopeElement"
    ref="scopeControls"
    :shared-with-ids="listSharedWithIds"
    :sharing-link="sharingLink"
    :saving="saving"
  />
</KeepAlive>
```

Why this and not the alternatives:

| Option | What it costs | Why not / why yes |
| --- | --- | --- |
| **A. `<KeepAlive>` around the dynamic component (chosen)** | 2 lines in core; no new contract surface | Retains *everything* the element owns — selection, message text, channel checkboxes, the picker's already-loaded pages. The element stays a self-contained unit with pure unit tests. Cache key is `vnode.type`; the registry hands back the same `defineAsyncComponent` object every time (`sales-rep/index.ts:95`), so the key is stable. |
| B. Modal-owned draft via `provide`/`inject` (`Map<scope, unknown>`), element reads/writes through `useSharingScopeDraft(scope, init)` | New injection key in core, a helper composable, element rewritten to store every retained field in the bag | Explicit and KeepAlive-free, but every field to retain must be opted in (message, channels, loaded pages…), and it puts a second state owner next to the `defineExpose` contract. Fallback if A fails in tests. |
| C. Global store keyed by `listId` (`createGlobalState`) | Small | Wrong lifetime: survives across dialog opens and across other users' saves; needs explicit reset; a "new list" has no id. Rejected. |
| D. Move the set into the modal itself (core owns `sharedWithIds`) | Modal knows about targets | Breaks the seam's premise (`useWishlistSharingScopes.ts:26-30`: core cannot see per-scope input). Rejected. |

Two behaviours of A that must be covered by tests, because they are where it can silently fail:

- When the element is deactivated, `unmount` unsets its template ref → `scopeControls.value` is `null` →
  `scopeDirty` (`modal:210`) is `false` and `scopeCanSave` (`modal:209`) is `true` for element-less scopes. That is
  the correct meaning (Private is dirty only through `meta.dirty`). On reactivation the ref must re-bind, including
  through the `defineAsyncComponent` wrapper (Vue forwards the ref to the resolved inner component on activate;
  vuejs/core#4999). Test with an async-wrapped stub, not a plain component.
- `saving` and `sharedWithIds` props keep flowing to the deactivated instance and are patched on activate.

Lifetime is right by construction: `useModal().openModal` pushes a fresh component per open
(`shared/modal/composables/useModal.ts`), so the cached instance dies with the modal — the draft never outlives the
dialog, and server truth is re-read on the next open.

### 1.3 Inside the Customer element: server truth, draft, deltas

```ts
// Server truth — from the modal, from list.sharingSettings; NEVER from the picker.
const persistedIds = computed(() => new Set(props.sharedWithIds));

// Draft — seeded once at setup; KeepAlive is what keeps it across scope switches.
const selectedIds = ref(new Set(persistedIds.value));

// Deltas — derived, never stored.
const addedIds   = computed(() => difference(selectedIds, persistedIds));
const removedIds = computed(() => difference(persistedIds, selectedIds));

// Display rows are driven by selectedIds, resolved against three sources in order.
const recipients = computed(() => [...selectedIds.value].map(id => ({
  organizationId: id,
  name: grantTargets.get(id)?.name ?? knownOptions.get(id)?.organizationName ?? id,
  subtitle: grantTargets.get(id)?.subtitle ?? formatCustomerLocation(knownOptions.get(id)?.address),
})));
```

- `grantTargets` = `sharedWith` off each persisted grant (contract §1.2, arrives in PR-B) — already carries a
  formatted `subtitle`, so no client-side address formatting for those rows. `knownOptions` = every option ever
  loaded by the picker in this dialog (accumulated, never evicted); it covers rows the rep just picked, which have
  no grant yet. Raw id = last resort. In PR-A `grantTargets` is simply empty.
- **Correctness rule (brief constraint 3):** `payload` is built from `selectedIds` vs `persistedIds` only. The
  picker's `options` never enter the payload. A persisted grant on a page never fetched stays in `persistedIds`,
  stays in `selectedIds`, appears in the list (by id), and is neither added nor removed. Test in §7.1.
- `dirty = addedIds.size > 0 || removedIds.size > 0`. A → remove A → re-add A is not dirty (matches today's
  "A → B → A is no change" at `:67-70`).
- `canSave = selectedIds.size > 0` (today's rule, `:139`). Zero recipients under Customer scope does not save;
  see §9 Q4.

### 1.4 How the modal passes server truth

`listSharedWithIds` replaces `listSharedWithId` (`modal:139`):

```ts
const listSharedWithIds = computed<string[]>(() =>
  (props.list?.sharingSettings ?? [])            // BLOCKED — needs 1.1 + codegen
    .filter(s => s.scope === listSharingScope.value && s.sharedWithId)
    .map(s => s.sharedWithId!));
```

Until 1.1 lands the same computed reads `[props.list.sharingSetting.sharedWithId].filter(Boolean)` — one line to
swap. The element's prop becomes `sharedWithIds: string[]` (`IProps`); the singular `sharedWithId` prop goes (single
consumer; modal test stub at `add-or-update-wishlist-modal.test.ts:70-86` updates with it).

---

## 2. The `defineExpose` contract

Current (`useWishlistSharingScopes.ts:31-38`): `{ canSave?, dirty?, payload?: { sharedWithId?: string }, onSaved? }`.

Change **only the payload type**, additively:

```ts
/** Mirrors the target fields of Input{Create,Change}WishlistType. Deltas are union/difference against the persisted set. */
export type WishlistSharingTargetsPayloadType = {
  sharedWithId?: string;            // legacy single target (§2.3 of the contract keeps accepting it)
  addSharedWithIds?: string[];
  removeSharedWithIds?: string[];
};

export interface IWishlistSharingScopeControlsType {
  canSave?: boolean;
  dirty?: boolean;
  payload?: WishlistSharingTargetsPayloadType;
  onSaved?: (context: WishlistSharingScopeSavedContextType) => Promise<void> | void;
}
```

`CreateWishlistPayloadType` (`core/types/create-wishlist-payload.ts`) is untouched — create does not share; `changeWishlist`
/ `addWishlist` spread it into `command` unchanged. Once codegen has run, tighten to
`Pick<InputChangeWishlistType, "sharedWithId" | "addSharedWithIds" | "removeSharedWithIds">` so drift is a compile
error — not before (types.ts is generated; never hand-edited).

Consequences:

- **Core scopes** (Private / Organization / AnyoneAnonymous) have no `element`, contribute no payload → unchanged.
- **Test scope** in the modal test uses `{ sharedWithId }` → still type-valid.
- **Emission is gated, types are not.** Sending `addSharedWithIds` to a BE without the field is a GraphQL variable
  validation error → the save fails. The element emits deltas only in the wire step (§6), never behind a runtime flag.
- **`carriesPersistedTarget`** (`modal:215-218, 233-234`) exists because today omitting `sharedWithId` *detaches*
  the target. Under 2.1 "both omitted = untouched", so for the plural wire it degenerates to contributing `{}` — but
  only if BE accepts `scope: Customer` re-sent with no deltas on a list that already has Customer rows as a valid
  no-op. Add that sentence to VCST-5925. Keep the current carry-through until the wire step.
- **`onSaved` context** gains nothing; the element already has everything it needs (added ids, channels, message).

---

## 3. Component breakdown

### 3.1 `client-app/shared/wishlists/components/add-or-update-wishlist-modal.vue` (core)

- `<KeepAlive>` wrapper (§1.2).
- `listSharedWithIds` (§1.4); prop rename on the dynamic component.
- `scopeDirty` / `scopeCanSave` unchanged; `canSave` unchanged.
- Scope selector: today `VcSelect` (`:38-48`). The four pills exist in the ui-kit as `VcTabSwitch` — radio input +
  button, already used as a segmented control in `shared/compare/components/compare-table.vue:18-36`. The Figma
  frames in VCST-5707 (`566:550`-`566:618`, `535:15951`-`535:16526`) are the final design, so this swap is in scope now. It
  keeps the existing rules: only available scopes are offered, a persisted-but-unavailable scope stays listed
  (`listSharingScopes`, `:155-173`), and it stays behind `isCorporateMember`.
- **`IWishlistSharingScopeType` needs an `icon` field.** Every tab in the design carries a glyph, and the registry
  (`useWishlistSharingScopes.ts:12-21`) has no slot for one. Add `icon: string` to the interface and supply it in all
  four registrations — `hat-glasses` / `briefcase-business` / `link` in `CORE_SHARING_SCOPES` (`:41-56`), `user-plus`
  in `sales-rep/index.ts:88-96`. Names verified against `ui-kit/icons/outline` by path data; see the icon table in
  `temp-VCST-5707-UI-spec.md`.
- Colours, borders, paddings, icon sizes and the token for every element are in
  `temp-VCST-5707-UI-spec.md` → "Visual spec". Build from there, not from the frames' raw hexes: the mock was drawn
  on a non-default palette, so `#e5e5e5` must become `neutral-200` and `#000` must become `neutral-950`.
- Sharing link field (`:50-66`) stays as is — `supportsLink` already covers all shared scopes including Customer.
- Save button label stays Save/Create unless product asks for "Share".

### 3.2 `client-app/modules/sales-rep/components/wishlist-customer-sharing.vue` (module) — rewritten

Sections, top to bottom, all inside the existing `.wishlist-customer-sharing` root:

1. **Picker** — `VcSelect` `multiple` (exists today, `vc-select.vue:200`) with `v-model="selectedIdsArray"`
   (array ↔ Set adapter), `autocomplete`, `#item` slot (exists, `:148`) for a two-line option (name / location),
   plus whatever VCST-5923 adds for Select-all and load-more. Label carries the "N of M" counter
   (`t("…selected_counter", { selected, total })`, M from `useSalesRepCustomersCount` — the `first: 0` count query
   already exists).
2. **Recipients list** — new component `wishlist-sharing-recipients.vue` (module), see 3.3.
3. **Message** — `VcTextarea`, `counter`, `:max-length="MESSAGE_MAX_LENGTH"` = **250** fixed. Drop the dynamic
   `1000 − link − 2` (`:58-65`): a 250 cap plus any realistic link is far under the BE's 1000. Visible when
   `addedIds.size > 0` (today's `v-if="isNewTarget"` generalised), since it only feeds notifications.
   The frame also prescribes the copy — label *Message (optional)*, placeholder *Add a note for the recipients*,
   hint *Recipients get this in their notification.* — see the UI spec's "The Message field".
4. ~~**Notify via**~~ — **not built.** VCST-5724 shipped the decision to remove the channel choice (§0.3); the
   frames are stale here. Both channels are always requested.
5. **Retire the single-target rule** (wire step): delete `replacesPreviousTarget` + comment (`:72-73`), the
   `share_replace_hint` branch in `fieldMessage` (`:93`), the key in 13 locales, and the two tests at
   `wishlist-customer-sharing.test.ts:234-250`.

`defineExpose` shape: `{ canSave, dirty, payload, onSaved }` exactly as today; only `payload`'s content changes.

### 3.3 New: `client-app/modules/sales-rep/components/wishlist-sharing-recipients.vue`

```ts
interface IProps { recipients: WishlistSharingRecipientType[]; disabled?: boolean; collapsedRows?: number /* 3 */ }
interface IEmits { (e: "remove", organizationId: string): void; (e: "clear"): void }
```

- Header: `Recipients · N` + "Clear all" (`VcButton` variant ghost, size xs). Emits `clear`; the parent empties
  `selectedIds` (§9 Q4 on what that means for Save).
- Row: line 1 `organizationName`, line 2 `location` (`formatCustomerLocation(address)` — the profile variant,
  "City, Region", `sales-rep/utils.ts:28-32`); trailing `VcButton icon` with `<VcIcon name="delete-2">` (the icon the
  card's Remove item already uses) and `aria-label` — no hand-built buttons.
- Collapse: renders `collapsedRows` rows; below them one `VcButton` ghost toggling `Show all N` / `Show less`
  (module locale keys; `VcButtonSeeMoreLess` has fixed "See more/less" copy so it does not fit). Local `expanded`
  ref; resets when the list shrinks to ≤ 3.
- Pure presentational; no composables. Types in `modules/sales-rep/types/index.ts`.

### 3.4 Menu entry point — decided: two modals

**The menu is designed** — frame `535:16177` inside `535:16064`, three `VcMenuItem` md in the order
**Rename / Share / Remove list**, full spec in `temp-VCST-5707-UI-spec.md` → "List-actions dropdown menu".
`wishlist-dropdown-menu.vue` gets the `share` item in the middle, shown only when
`sharingSetting.access === Write` (already the card's condition, `wishlist-card.vue:34`). `lists.vue:99-106` and
`list-details.vue:226-233` open one of two dialogs:

- **Rename** — name + description only. Sends `changeWishlist({ listId, listName, description })`. Note the design
  says *Rename*, not *Edit*, so this needs a new locale key; the existing `list_edit_button` stays "Edit".
- **Share** — scope tabs, picker, recipients, link, message. Sends
  `changeWishlist({ listId, scope, sharingKey, addSharedWithIds, removeSharedWithIds })`. Its footer primary is
  **scope-dependent**: `Share` on Specific customers, `Save` on Private / My organization / Anyone with link, and it
  flips live as tabs change. Both keys already exist in all 13 locales.
  There is **no Notify via block** — VCST-5724 removed it (§0.3).

The sharing block (scope selector + link + `<KeepAlive>` slot for the scope element) is extracted from
`add-or-update-wishlist-modal.vue` into `wishlist-sharing-section.vue`; the create flow keeps the name/description
form. The scope registry and the `defineExpose` contract are unaffected — the scope element behaves the same
wherever it is hosted.

Two consequences worth naming, because they are what the split actually costs:

- **Partial writes become the normal case — verified safe on today's BE.** Rename omits every sharing field; Share
  omits `listName`/`description`. Probed on vcst-qa 2026-09-09 with a throwaway list: `changeWishlist({ listId,
  listName, description })` left `scope: Organization` and the whole `sharingSetting` untouched; `changeWishlist({
  listId, scope, sharingKey })` and `changeWishlist({ listId, scope })` both left name and description untouched. So
  neither dialog can wipe the other's fields on the current backend. Contract §2.1 keeps the requirement written down
  so the new BE cannot regress it.
- **Create no longer shares.** Name + description only; the new list starts `Private` and is shared afterwards.
  So `createWishlist` takes no sharing fields and the create path drops the scope selector entirely. Worth
  watching in review: sharing a brand-new list is now two dialogs where it used to be one, so if the rep's common
  case is "make a list for customer X", offer Share straight from the create-success toast rather than making them
  reopen the menu.

### 3.5 Consumers that do not change

`wishlist-card.vue`, `wishlist-status.vue`, `add-to-wishlists-modal.vue:37-39,111-113`, `pages/shared-list.vue`
keep reading the singular `sharingSetting` for viewer-centric fields (`access`, `isOwner`, `scope`, `id`). With
every grant carrying `Read` and `access` meaning "current viewer's access", a recipient sees the list with
`isOwner: false` → status `shared_with_me` (`wishlist-status.vue:43-45`), no cog menu. This depends on BE keeping the
singular as the viewer projection (contract §1.1 "deprecated" must not mean "removed").

### 3.6 Consumed from VCST-5923 (not built here)

Select-all inside the dropdown, load-more/lazy loading inside the dropdown. Assumed surface (to be aligned when
their PR exists): a `select-all` affordance that emits the full loaded array, and a `load-more`/`reach-end` emit
plus `loading` prop. If 5923 exposes a search-text emit, §4.2 wires it; if not, §4.2's fallback applies.

---

## 4. The picker: server-side paging and search

### 4.1 Today

`useSalesRepCustomerOptions.ts` sends `first: 100, after: "0", keyword: "", sort: "name:asc"` once, filters
client-side inside `VcSelect`, and logs a warning when `totalCount > 100`. A rep with 101+ customers cannot reach
the overflow. The customers page already pages correctly: `after: String((page - 1) * PAGE_SIZE)`
(`useSalesRepCustomers.ts:91`).

### 4.2 Change (same file, renamed `useSalesRepCustomerPicker` if the shape changes enough; keep the narrow query)

- Inputs: `keyword: Ref<string>` (debounced ~300 ms by the caller), `PAGE_SIZE = 20`.
- Variables: `{ storeId, first: PAGE_SIZE, after: String((page - 1) * PAGE_SIZE), keyword, sort: "name:asc" }`
  through `useSalesRepHubQuery` (lint forbids direct `useQuery` in the module — `eslint.config.js:445-452`).
- Accumulate pages into a local `Map<organizationId, OptionType>` on `onResult` (not Apollo `fetchMore`: with
  `cache-and-network` each page is its own cache entry and the connection has no typePolicy). Reset the
  *visible* accumulation on keyword change; **never** reset `knownOptions` (the name-resolution cache, §1.3).
- `hasMore = loaded.length < totalCount`; `loadMore()` bumps `page`. `failed` flag stays.
- Query document `salesRepCustomerOptionsQuery.graphql` adds `address { city regionName }` — fields already exist on
  `SalesRepCustomer` (the customers query selects them). Module codegen only; **buildable now**.
- Delete the `> OPTIONS_LIMIT` warning and its two tests (`useSalesRepCustomerOptions.test.ts:118-139`).

**Keyword source.** `VcSelect` has no search emit (§0.4). Until it does: keep client-side filtering over the
*accumulated* pages, and set `keyword` from the select's search text once 5923 (or a follow-up) exposes it. Raise
with 5923's owner now; it is a one-emit change on their side.

**Shipped 2026-09-10, and it is not the load-more shape above.** `VcSelect` has no reach-end emit either, so a
20-per-scroll page has nothing to trigger it — shipping `PAGE_SIZE = 20` with no trigger would have shown the rep
*fewer* customers than today's single page of 100. And client-side filtering is only correct over the whole set:
filtering half the customers silently hides the rest behind a search box that looks like it searched everything.
So `useSalesRepCustomerOptions` keeps `first: 100` and **advances pages by itself** until
`loaded.size === totalCount`, an empty page comes back, or `MAX_PAGES = 20` (2000 customers) stops it — the cap
warns, exactly as the old `> 100` warning did, but three orders of magnitude further out. `loading` stays true for
the whole run so the field never looks settled mid-set. Scroll-triggered paging becomes worth building only once
5923 gives the picker a search emit, because then the server does the filtering.

**Select all.** Two candidates: (a) select the loaded rows — cheap, but on an ACL "all" that means "the 20 I have
scrolled to" is a trap; (b) select every customer matching the keyword — `selectAll()` pages through the id+name
projection with `first: 100` until `loaded === totalCount`, with a busy state and a sanity cap (e.g. 1000 →
warn). Recommend (b) and surface the cost; the contract's open item 7 leaves this to product.

---

## 5. Notification behaviour

Today (`wishlist-customer-sharing.vue:103-148`): `onSaved` calls `notifyCustomer(selectedOrganizationId)` once,
only when `isNewTarget`, with `sendEmail: true, sendPush: true` hardcoded (VCST-5724).

Change:

```ts
onSaved: async (context) => {
  if (!addedIds.value.size || (!sendEmail.value && !sendPush.value)) return;
  const results = await Promise.all([...addedIds.value].map(id => sendCommunication({
    organizationId: id,
    sendEmail: sendEmail.value,
    sendPush: sendPush.value,
    title: t("…share_default_title"),
    message: [body(id), context.sharingLink].join(SEPARATOR),
  })));
  toastAggregate(results);   // one toast, not N
}
```

- One call per **newly added** org (`addedIds`), never for kept or removed ones. `sendCommunication` never throws
  (`useSalesRepCommunication.ts:166-177`), so `Promise.all` is safe; 30 recipients = 30 requests (contract §6 accepts).
- Channels from the checkboxes. Both off → nothing is sent, no toast about notifications.
- Body: the rep's text or `share_default_message` with `{ listName, organizationName }` — AC bullet "template
  includes the Organisation Name" is satisfiable client-side because the call is per org; if product means the
  *email template* itself, that is BE (`SalesRepMessageEmailNotification` exposes Title + Message only).
- Aggregate toast: all succeeded → `share_success` (pluralised "with {n} customers"); some failed/partial →
  `share_partial` naming the failed orgs plus localised warning codes (`localizeWarning` stays); none → 
  `share_notify_error`. `notifications.*` with `single: true` as today. New plural keys follow the repo's 2/3/4-form
  convention.
- `saving` stays up until all calls settle (modal awaits `onSaved`, `modal:251-258`).

---

## 6. Sequencing — what is buildable now, what is blocked

Two PRs. **PR-A** is single-target on the wire and identical to today in what it sends to BE; it can merge any time.
**PR-B** is the only PR whose runtime depends on VCST-5925 and it stays small so its time-in-flight is short. Never
hand-edit `client-app/core/api/graphql/types.ts` or the module `types.ts`; PR-B runs `yarn generate:graphql-types`
against a backend that has VCST-5925 and bumps `generate:backend-packages` in the same commit.

| # | Step | Status | Unblocked by |
| --- | --- | --- | --- |
| 1 | Spec: `client-app/modules/sales-rep/specs/VCST-5707-lists-sharing/<date>-sharing-design.md` (decisions + verified facts, this plan condensed) | BUILDABLE NOW | — |
| 2 | **Done 2026-09-10:** picker composable — `address { city regionName }` in the options query (module codegen run against vcst-qa; only the two `SalesRepCustomerOptions` lines changed), accumulation into a `Map` that doubles as `knownOptions` (`findOption`), self-advancing paging to the whole set with a 2000 cap, formatted `location` on the option, `OPTIONS_LIMIT` warning retired. 15 tests | DONE | — (keyword wiring: VcSelect search emit) |
| 3 | Modal: `<KeepAlive>`, `sharedWithIds` prop, contract type widening, modal tests for retention + ref rebind (§1, §2) | BUILDABLE NOW | — |
| 4 | **Done 2026-09-10:** customer element on a Set draft capped at one (`canSave = size === 1`, payload still `{ sharedWithId }`), deltas as `addedIds`/`removedIds`, two-line picker options with the avatar (`467:4745`), new `wishlist-sharing-recipients.vue` (header + `Clear all`, rows, sticky `Show all N` / `Show less`) and `wishlist-sharing-avatar.vue`, message capped at **250** with the frame's hint, notify looped over `addedIds` with one aggregate toast, 8 new locale keys ×13 + the frame's Message copy. **No Notify-via fieldset** — VCST-5724 removed it (§0.3). Deferred to PR-B with the plural wire: `multiple` on the picker, Select-all + its `2 of 5` counter (VCST-5923), a pluralised success toast, `sharedWith.imageUrl` on the avatar | DONE | — |
| 5a | **Done 2026-09-09:** Rename / Share / Remove list menu; `AddOrUpdateWishlistModal` reduced to name + description (create + rename); new `ShareWishlistModal` with the scope selector, link and scope element; Share button on list details; scope-dependent primary label; 13 locales; tests split | DONE | — |
| 5b | **Done 2026-09-10:** scope tabs — `VcTabSwitch` sm with `icon` from the registry (`hat-glasses` / `briefcase-business` / `user-plus` / `link`), "Who can access" label, 2×2 grid below `md`, one wrapping row above; the two `VcSelect` locale keys retired in all 13 locales | DONE | — |
| 5c | **Done 2026-09-10:** stop-sharing confirmation — `stop-sharing-confirmation-modal.vue` with the ticket's verbatim copy (the kit organism hardcodes "OK"), opened from Save only when an already-shared list changes scope; plus the zero-recipient hint (§9.3). 13 core locales | DONE | — |
| — | **PR-A = steps 1–5.** Wire unchanged: `sharedWithId`, one target. | | |
| 6 | Codegen against BE with 1.1 + 1.2 + 2.1; `getWishlists` / `getWishlist` / `changeWishlist` documents select `sharingSettings { id scope access isOwner sharedWithId sharedWith { id name subtitle imageUrl } }`; `listSharedWithIds` reads the plural; payload → deltas; `multiple` on; `carriesPersistedTarget` → `{}`; tighten payload type to the generated `Pick`; retire `share_replace_hint` (13 locales, comment `:72`, tests `:234-250`, `:270-277`, `:347-351`); Select-all (§4.2 b) | **BLOCKED on VCST-5925** deployed to the dev backend the theme's dev branch runs against | BE merge + deploy; then codegen |
| — | **PR-B = step 6.** Recipient names and addresses come with `sharedWith`, so there is no separate resolution step. | | |
| 7 | Recipient-side verification of 3.1/3.2: list appears with `isOwner: false`, status `shared_with_me`, no cog, `/shared-list/:key` opens without 403. No FE change expected; e2e in vc-testing-module | BLOCKED on BE (independent of cardinality) | BE ships 3.1/3.2 |

Half-broken-dev guard: PR-B is not opened until the dev backend reports the new schema (codegen fails loudly on a
missing field, which is the right signal); PR-A carries no plural semantics that a singular BE could misread.

---

## 7. Test plan

Scope vitest with `--dir client-app`; types with `yarn vue-tsc --build --force`. Stubs must carry every prop the
component reads (a `VcSelect` stub without array `modelValue` would hide the `multiple` path).

### 7.1 Truncation rule — `wishlist-customer-sharing.test.ts` (PR-B; the fixture exists in PR-A with one id)

Fixture: `sharedWithIds = ["org-a", "org-b", "org-far"]`, picker options `[org-a, org-b, org-d]` — `org-far` is
on a page that was never fetched.

- renders three recipient rows; `org-far` by its id.
- untouched → `dirty === false`, `payload` has neither `addSharedWithIds` nor `removeSharedWithIds`.
- add `org-d` → `payload` is exactly `{ addSharedWithIds: ["org-d"] }`; **no `removeSharedWithIds`**.
- remove `org-a` → `{ removeSharedWithIds: ["org-a"] }` only; `org-far` still listed.
- remove `org-a`, re-add `org-a` → not dirty, empty payload.
- `payload` never contains an id that is only in `options` and not in `selectedIds`.
- modal level (`add-or-update-wishlist-modal.test.ts`): with the stub reporting deltas, `updateWishlist` receives
  them merged and **not** `sharedWithId`; with an untouched stub it receives neither.

### 7.2 Scope-switch retention — `add-or-update-wishlist-modal.test.ts` (PR-A)

Stub scope element registered as `defineAsyncComponent(() => Promise.resolve(Stub))` with a local counter and a
button, exposing `controls`.

- select targeted scope → click twice → switch to Private → element gone, `saveButton` state follows `meta.dirty`
  only → switch back → counter still 2 (instance retained, not remounted).
- after switching back, `controls` reached through the modal's template ref is live again: set `dirty` → Save enables.
- `saving` toggled while the element is deactivated is reflected when it comes back.
- a scope with no element (Private) never renders a stale Customer element.

### 7.3 Picker composable (PR-A)

- variables progress `after: "0" → "20" → "40"` as `loadMore()` is called; `hasMore` flips at `totalCount`.
- keyword change resets `page` to 1 and the visible list; `knownOptions` keeps earlier ids.
- options carry `location` from `address`; missing name falls back to id (existing test).
- failed fetch keeps `failed` true until a later success (existing tests).

### 7.4 Recipients list (PR-A)

- ≤ 3 rows: no toggle; 4+ rows: 3 shown + "Show all 4"; toggle shows all + "Show less"; shrinking under 4 hides it.
- trash emits `remove` with the row id; "Clear all" emits `clear`; both disabled while `disabled`.
- row shows name line + location line; location line absent when no address.

### 7.5 Notifications (PR-A generalises today's suite, `:319-415`)

- one `sendCommunication` per added org; none for kept; none for removed.
- channels mirror the checkboxes; both unchecked → zero calls, no notification toast.
- default body carries list name **and** organisation name; rep text still gets the link appended.
- aggregate: all ok → one success; one partial → one warning naming the org and the localised code; all failed →
  `share_notify_error`; never `notifications.error` (list is saved).
- message `maxlength` is 250 (replaces `:279-284`).

### 7.6 Retired behaviour (PR-B)

- delete `:234-242` (warns about detaching) and `:244-250`; invert `:270-277` (channels are offered);
  replace `:347-351` (channels honoured).
- `grep -r share_replace_hint client-app` returns nothing.

### 7.7 Non-rep / availability (existing modal tests still hold)

- corporate non-rep: Customer scope absent from the selector; persisted Customer list still shows the scope
  (`:273-303`).

---

## 8. Risks

1. **VcSelect API is a moving target.** 5923 has no written AC; Select-all/load-more shape unknown; no search emit.
   Mitigation: PR-A consumes only `multiple` + `#item` (exist today); everything 5923-shaped is one adapter layer.
2. **KeepAlive + async component + template ref.** Works on Vue 3.5.40 (repo `package.json:92`), but the failure
   mode is silent (Save never enables after switching back). §7.2 covers it; option B (§1.2) is the fallback.
3. **Singular `sharingSetting` "deprecated".** Five FE consumers read it for viewer-centric fields (§3.5). If BE
   removes or repurposes it, the card menu, status line and shared-list page break. Contract must keep it as the
   viewer projection.
4. **Sharing key location** (§0.1) — silent link rotation on every save if `sharingSetting.id` stops being the key.
5. **Grant display beyond loaded pages** (§0.2) — PR-A shows raw ids for grants the picker never fetched; PR-B fixes it via `sharedWith`.
6. **N notification calls** are fire-and-await; a slow mail gateway holds the Save spinner for N round-trips.
   Acceptable per contract §6; consider `Promise.allSettled` with a per-call timeout if QA flags it.
7. **BE 500 on auth denial** (contract 3.3) — the modal's catch shows `save_error`; fine, but the toast cannot name
   the rejected org until errors are `errors[]` with an org id.
8. **`generate:backend-packages` coupling** — PR-B's codegen snapshot must come from an env that has *both* the
   x-cart and sales-rep module versions with the change, or core and module types drift.

---

## 9. Open questions — surfaced, not answered

1. **AC contradiction.** The description says Edit shows sharing *read-only* with a remove option; the Acceptance
   field says editable multiselect with per-row remove. Ivan chose editable ("it will be not read only mode - fully
   customizable share options"), so the description sentence is the stale one and should be corrected before QA
   tests it.
2. **Entry point — not open, the Acceptance settles it.** Acceptance item 1 is *"Rename (previous “Edit”)"* and
   item 2 is *"Share (new popup)"*, with item 3 *"Delete"* and an "Action wheel" screenshot. So the three-item menu
   and the separate Share popup are requirements, not our design choice, and the "Rename" label is prescribed there
   rather than discovered in Figma. The only divergence to note: the Acceptance says **Delete** for item 3 (matching
   today's `list_card.remove_list_button`), while frame `535:16177` labels it *Remove list* — keep the existing key.
3. **Zero recipients / "Clear all" — settled and built 2026-09-10.** Contract says Clear all = scope switch to
   Private, but in the UI that would need the element to change the *modal's* scope, an upward channel the seam does
   not have. Built as the recommended default instead: Clear all (and the per-row trash) empties the draft, Save
   stays disabled at zero, and the field carries `share_empty_hint` — "An empty list does not stop sharing — change
   who can access instead." — shown only when the list actually had recipients, so a never-shared list is not
   lectured. Stop sharing stays the Private tab, which is where the confirmation fires. `onRequestScope` was not
   added; nothing else wants it.

   The hint is plain copy, not a linked message: all 153 `@:` references in `locales/` are whole values, none
   embedded mid-sentence, so naming the field by its own visible label beats interpolating core's scope name into a
   module string.
4. **Non-rep corporate member.** Sees three pills (Customer is `isAvailable: isSalesRepUser`,
   `sales-rep/index.ts:94`); a persisted Customer list still shows the scope, read-only. Confirm that is intended.
5. **Search — parked by decision (2026-09-09).** Waiting on Maya's ticket (VCST-5923); if it does not bring what
   the picker needs, **hide the search affordance** rather than build a substitute. Acceptance item 2.1 asks for
   "native search", which reads as `VcSelect`'s own filter (`filteredItems`, `vc-select.vue:310`) and already exists,
   so nothing here is blocked either way — but a native filter only sees loaded pages, so with paging it silently
   hides matches. Do not build server-side keyword search in this ticket. The `30 selected` summary in the frames is
   the same Acceptance line and **is** required.

6. **Confirmation dialog — settled 2026-09-09, both copy and trigger.** The copy is prescribed verbatim in
   VCST-5707's description: *"Stop sharing this page? / Anyone with the link will lose access. You can share it again
   at any time. / `Cancel` · `Stop sharing`"*, followed by *"If sharing is removed, I can create a new sharing
   option."* **Trigger, decided:** it fires only when the scope of an **already-shared** list changes — i.e. on Save,
   when the persisted scope is a sharing scope and the selected scope differs from it. One `VcConfirmationModal`.
   That means it does **not** fire on a first share (`Private` → anything), does **not** fire when only the
   recipient set changes inside the Customer scope, and does **not** fire on the per-row trash icon. It does fire on
   shared → `Private` and on shared → a different sharing scope, because both revoke the current audience.
   Still worth raising with product, but not blocking: the given copy says "page" where this is a list, and "anyone
   with the link" is wrong for the Customer scope, where access follows org membership rather than the link. Until
   product amends it, ship it as written.
7. **Select all semantics** (§4.2) — loaded rows vs every match.
8. **Message visibility** — only when someone new is added (today's rule, recommended) or always.
9. **Organisation name in the notification — deferred 2026-09-09, Ivan is clarifying with product.** Do not build
   it either way yet. What is already established, so the answer lands on a decision rather than an investigation:

   - There are **two layers**. The platform email template owns the shell and is selected by `storeId` +
     `cultureName` (per the input's own doc comments, `modules/sales-rep/api/graphql/types.ts:662-677`) — unreachable
     from the FE. `title` + `message` are free-form strings we compose (`wishlist-customer-sharing.vue:104-113`).
   - **If the name goes in `title`/`message`, it is FE-only, no BE change.** `notifyCustomer(organizationId, …)`
     runs once per organization, so the name is in hand — from `knownOptions` now, from `sharedWith.name` after PR-B.
     Today's default already says "with your organization" unnamed, so the ask is to name it.
   - **Put it in `title`, not the body.** `body = shareMessage.trim() || t('share_default_message', { listName })`,
     so a rep's custom note replaces the default entirely and the name would vanish. `title` is sent unconditionally
     and the rep never edits it.
   - **Who the name is for changes what to build.** For the *recipient* (disambiguating a shared inbox or a person
     in several orgs) → `title`. For the *rep* — which is what "to clarify which organisation was shared" sounds
     like — it belongs in the success toast (`share_success` → "List shared with {organizationName}") and in the
     recipients list, not in the recipient's email; with N recipients the aggregate toast should name what went
     where.
   - **Recommendation when the answer comes:** both — `title` plus the toast — which covers either reading with one
     interpolation param added across the module's 13 locale files and no BE work. If product literally means the
     platform template, that is a separate `vc-module-sales-rep` ticket and is not in VCST-5925's contract.
10. **VCST-5335 item 2.2 "Lists can be edited"** is Done but targeted customers stay on Read — ticket text to amend.
