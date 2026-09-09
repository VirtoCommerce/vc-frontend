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
`467:4614`, `415:4589` and `477:11114` are **superseded** VCDZ-894 variants — do not read them. Two cells of the
current frames are knowingly overruled, both recorded below: Notify via (item 3) and the My-organization link
(item 6).

What is still open:

1. **The sharing key still needs BE's answer.** The modal reads the key from `props.list?.sharingSetting?.id`
   (`add-or-update-wishlist-modal.vue:181`) and mints `crypto.randomUUID()` when absent. Contract §2.4 now asks BE to
   state whether `sharingSettings[].id` keeps being the list-level key or a `WishlistType.sharingKey` is added — but
   until they answer, do not touch the key logic. If the key moves off the row PK with no documented home, every
   edit-save mints a new one and the link rotates on every save.

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
4. **Notify via** — `VcCheckbox` × 2 (`sendEmail`, `sendPush`), both default `true` (preserves VCST-5724's
   behaviour when untouched). Reuse `sales_rep.communication.email_label` / `push_label` / `channels_label`
   (`locales/en.json` "communication" block); the `share_*_label` keys deleted in #2438 do not need resurrecting.
   Both unchecked → no notifications are sent and the message field is disabled.
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

`wishlist-dropdown-menu.vue` gets a third item `share`, shown only when `sharingSetting.access === Write` (already
the card's condition, `wishlist-card.vue:34`). `lists.vue:99-106` and `list-details.vue:226-233` open one of two
dialogs:

- **Edit** — name + description only. Sends `changeWishlist({ listId, listName, description })`.
- **Share** — scope pills, picker, recipients, link, message, Notify via. Sends
  `changeWishlist({ listId, scope, sharingKey, addSharedWithIds, removeSharedWithIds })`.

The sharing block (scope selector + link + `<KeepAlive>` slot for the scope element) is extracted from
`add-or-update-wishlist-modal.vue` into `wishlist-sharing-section.vue`; the create flow keeps the name/description
form. The scope registry and the `defineExpose` contract are unaffected — the scope element behaves the same
wherever it is hosted.

Two consequences worth naming, because they are what the split actually costs:

- **Partial writes become the normal case.** Edit omits every sharing field; Share omits `listName`/`description`.
  For the delta inputs the contract already guarantees "omitted = untouched", but a write that omits `scope` must
  also leave sharing alone or renaming a list would wipe it. Contract §2.1 now states this; verify it before the
  Edit dialog ships.
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
*accumulated* pages with load-more (already removes the 100 cap), and set `keyword` from the select's search text
once 5923 (or a follow-up) exposes it. Raise with 5923's owner now; it is a one-emit change on their side.

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
| 2 | Picker composable: paging + accumulation + `knownOptions` + address in the options query + tests (§4). Client-side filter over accumulated pages until a search emit exists | BUILDABLE NOW | — (keyword wiring: VcSelect search emit) |
| 3 | Modal: `<KeepAlive>`, `sharedWithIds` prop, contract type widening, modal tests for retention + ref rebind (§1, §2) | BUILDABLE NOW | — |
| 4 | Customer element rewrite on a **Set draft capped at one** (`multiple` off, payload `{ sharedWithId: [...selected][0] }`, `canSave = size === 1`), recipients list component, message cap 250, Notify-via, per-added-org notify with aggregate toast (§3.2, 3.3, 5). **No Notify-via fieldset** — VCST-5724 removed it (§0.3) | BUILDABLE NOW | — |
| 5 | Scope pills (`VcTabSwitch`) and Rename/Share/Delete menu + `focus: "sharing"` entry point (§3.1, 3.4) | BUILDABLE NOW | entry-point answer (which menu item owns the sharing UI) |
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

1. **AC contradiction.** Description: Edit shows sharing *read-only* with remove; customfield_10175: editable
   multiselect with per-row remove. Product chose editable — the description text should be corrected so QA does
   not test the old sentence.
2. **Entry point.** "Rename (previous Edit)" vs "Edit list should show Sharing details": one modal with a `share`
   menu item that focuses the block (§3.4, recommended) or a separate Share dialog (extraction, more work).
3. **Zero recipients / "Clear all".** Contract says Clear all = scope switch to Private. In the UI that needs the
   element to change the *modal's* scope (an upward channel the contract does not have). Recommended default:
   Clear all empties the draft, Save stays disabled at zero with a hint "choose Private to stop sharing"; Stop
   sharing = the Private pill. Alternative: add `onRequestScope?: (scope) => void` prop from modal to element.
4. **Non-rep corporate member.** Sees three pills (Customer is `isAvailable: isSalesRepUser`,
   `sales-rep/index.ts:94`); a persisted Customer list still shows the scope, read-only. Confirm that is intended.
5. **Notify-via reversal** of VCST-5724 (§0.3).
6. **Confirmation dialog.** AC: "Stop sharing this page? Anyone with the link will lose access." Copy is wrong for
   Customer scope (access is by org membership) and says "page". When does it fire — on choosing Private, or on
   Save with a shared→Private transition (recommended, one `VcConfirmationModal`)? Per-row trash should not confirm.
7. **Select all semantics** (§4.2) — loaded rows vs every match.
8. **Message visibility** — only when someone new is added (today's rule, recommended) or always.
9. **Organisation name in the template** — client-side interpolation (§5) or the BE email template.
10. **VCST-5335 item 2.2 "Lists can be edited"** is Done but targeted customers stay on Read — ticket text to amend.
