# VCST-5707 — BE/FE sharing contract

**Ticket:** VCST-5707 "[BFE] [Sales Rep] [Lists] Sharing improvements" · epic VCST-5142 Sales Rep Hub
**Related:** VCST-5332, VCST-5335, VCDZ-894
**FE branch:** `feat/VCST-5707-lists-sharing-improvements` @ `78d02b0e1`
**Verified against:** live introspection of vcst-qa + module sources at the QA manifest tags — Cart 3.1009.0, XCart 3.1033.0, SalesRep 3.1008.0
**Published copy:** https://claude.ai/code/artifact/6abe1baf-fb8e-451b-b1cb-c1cc17bb699e

What the frontend needs from the backend so a Sales Rep can share one list with several
customer organizations without detaching the previous one.

---

## What is by design, and what is actually broken

VCST-5707 is a **Story**, not a defect — "[BFE] [Sales Rep] [Lists] Sharing improvements", In
progress, Medium. The overwrite it describes is intended behaviour, and the frontend says so out
loud.

**By design: one active sharing per list.** `CartSharingService.EnsureSharingSettings`
(vc-module-x-cart), when a cart already has sharing rows, sets **every** existing row's `Scope` to
`Private` and then mutates `SharingSettings.First()` in place. The frontend documents the rule at
`wishlist-customer-sharing.vue:72` — "The backend keeps a single sharing setting per list, so
targeting another customer detaches the current one" — and warns the rep before they do it, via
`share_replace_hint`: "The previously selected customer will lose access to this list." That string
ships in 13 locales and `wishlist-customer-sharing.test.ts:241` asserts it renders. So the 403 in
the ticket description is the documented rule working: Watermelon's row was deactivated, the
sharing-key lookup skips `Private` rows, denial is correct. What this Story asks for is a **product
rule change** — from one recipient to many — not a repair.

**Actually broken: sharing with even one customer grants nothing usable.** A targeted customer
holds persisted `Read`, but the ordinary list-id path defaults `requestedAccess` to `Write` and
denies them (§3.1), and a shared list never appears in the recipient's own `wishlists()` (§3.2).
That is the genuine defect — QA has it open as High — and it is independent of cardinality, so it
can and should ship before the plural work.

**Why the plural ask is still cheap:** the relational model already supports N rows —
`ShoppingCart.SharingSettings` is `IList<CartSharingSetting>`, `ShoppingCartEntity.SharingSettings`
is an `ObservableCollection` with `Patch` — and `SalesRepCartSharingService.IsAuthorized` already
matches *any* Customer-scoped row. Only the write path and the read projection collapse to one.

---

## 0. Product decisions, settled (2026-09-09)

These were open when this document was first written. All five are now answered, and the answers
are folded into the requirements below rather than left as forks.

| Question | Answer | Effect on the contract |
| --- | --- | --- |
| Editable recipient set, or remove-and-recreate? | **Fully editable.** Add or remove a customer at any time. | §1.1, §2.1, §2.2 and §2.5 all stand. This is the core ask. |
| Recipients: organizations or individual people? | **Organizations** — exactly what a customer is today. | Id space stays organization ids; no new principal type. The people-with-personal-emails in the mocks are placeholder data. |
| What can a targeted customer do? | **Read** — unchanged from today. No change for other scopes either. | No capability split needed; `viewerCapabilities` drops out of the counter-proposal. §3.1 is still required so a Read holder can actually read. |
| Can a list hold rows of several scopes at once? | **No** — the scope pills are single-select, so exactly one scope is active. Plural applies only *inside* Specific customers. | §3.4 becomes a stated invariant BE must enforce, not an open design question. |
| Does Stop-sharing rotate the link? | **No** — reuse the existing key when link sharing is re-enabled, per the AC. | §2.4 loses the rotation requirement and states the reuse rule plus its consequence. |

---

## 1. Current state

| Scope | Target id | Persisted access | Who gets in |
| --- | --- | --- | --- |
| `Private` | none | `Write` | owner only |
| `Organization` | none — `sharedWithId: null` | `Write` | members of the *owner's own* org |
| `AnyoneAnonymous` | none | `Read` | anyone — `IsAuthorized` returns true unconditionally |
| `Customer` (sales-rep) | customer **org id** | `Read` | members of an org matching a Customer row's `SharedWithId` |
| `AnyoneAuthorized`, `User` | — | — | in the enum; `User` has no `ApplyScope` branch, so it throws |

`Customer` is the only *targeted* scope and its id space is **organization ids** — a user id is
rejected. Person-level sharing stays out of scope; VCST-5335 reads "if the Rep shares with my
organization (for future just me)".

**Link possession alone grants nothing on a Customer-scoped list.** Verified chain:
`CheckWishlistUserContext` → any sharing rows → `CheckSharedWishlistUserContext` → `IsAuthorized`
first, then the access check. Independently confirmed by the QA bug report: "Cross-org isolation
holds — a member of a different org correctly does not see the shared list. No data leak." This
guarantee survives plural rows only if §3.4 is enforced.

**No message field exists on BE.** `InputChangeWishlistType` is
`listId, listName, scope, sharingKey, sharedWithId, description, cultureName`; `SharingSettingType`
has none either. The only message in the system is `sendCustomerCommunication.message` (required,
max 1000). The frontend's message box is notification-only and never persisted — nothing is
requested here.

---

## 2. Schema — read

### 1.1 Plural sharing settings on the wishlist

```graphql
WishlistType.sharingSettings: [SharingSettingType!]!
```

Keep `sharingSetting` (singular), deprecated. Today `ResolveSharingSetting` synthesises one row
from `Cart.SharingSettings.FirstOrDefault()`, so a plural *input* alone would still surface one
recipient.

### 1.2 The resolved target on the grant

Declared by x-cart, so the field exists on every store; filled by whichever module owns the scope
(vc-module-sales-rep for `Customer`).

```graphql
type SharingTargetType {
  id: String!
  name: String
  subtitle: String   # for Customer grants, "City, Region"
  imageUrl: String
}

extend type SharingSettingType {
  sharedWith: SharingTargetType   # null when the scope has no target, or it cannot be resolved
}
```

A recipient row renders `sharedWith.name` on line 1 and `sharedWith.subtitle` on line 2.

**Why on the grant and not a separate lookup.** We considered asking for an id filter
(`salesRepCustomers(organizationIds:)`) and resolving names ourselves. It costs the frontend a
reconciliation layer: collect unresolved ids, decide which are already in the picker's loaded pages,
fire a second query with its own loading and error states, merge two asynchronous sources into one
display map, keep that map consistent as the picker pages in and the same organization arrives from
both places, and do all of it inside a component that must survive being kept alive across scope
switches. Reading one field off the grant replaces all of that.

**It has to be declared by core, not by the module.** Our first attempt was
`sharedWithCustomer: SalesRepCustomerDetails` contributed by sales-rep — that breaks twice, and both
were verified against vcst-qa. The wishlist documents are generated against core `/graphql`, so on a
store without the sales-rep module the field would not exist, GraphQL validation would reject the
whole operation and `GetWishlists` — the Lists page — would die. And the module cannot serve it
either: `/graphql/sales-rep` has 21 root fields and no `wishlist` among them. A core-declared type
with a module-supplied value has neither problem.

`sharedWith` must resolve for every grant on a list the caller **owns**, independent of the caller's
current assignment. Do not reuse the `ServesOrganizationAsync` gate here: it returns null for an
organization the rep no longer serves, which is exactly the grant they most need to recognise before
revoking it (§2.5 guarantees they still can). Owning the list is the authorisation for reading its
own grant targets, and the organization's name is not privileged information to someone who already
holds a grant to it.

`null` then means one thing only: the target no longer exists — a deleted organization. We fall back
to the raw `sharedWithId`, which is what revocation uses anyway.

`imageUrl` is optional for us — the design shows an avatar, and `iconUrl` already exists on the
customer, so it is free if the resolver has it to hand.

> **Constraint — do not change the meaning of `sharingSetting.access`.** It is the *current
> viewer's* effective access. `wishlist-card.vue` gates the rep's own cog menu on
> `access === Write`, so redefining it to the grant's access would hide the owner's menu. Since
> every grant now carries `Read`, no per-grant access field is needed at all.

---

## 3. Schema — write

### 2.1 Additive and subtractive target inputs — *the rule change*

```graphql
changeWishlist(command: { addSharedWithIds: [String!], removeSharedWithIds: [String!] })
```

Only on `changeWishlist`. Creation is a separate dialog now — name and description only — so a new
list starts `Private` and is shared afterwards. `createWishlist` needs no sharing fields at all.

| Input | Meaning |
| --- | --- |
| both omitted | targets untouched |
| `addSharedWithIds` | union with the current set |
| `removeSharedWithIds` | difference from the current set |

Adding an already-granted id, or removing an absent one, is a no-op — retries are safe. If the same
id appears in both lists, reject the mutation rather than pick a winner.

Deliberately **not** a replace-set `sharedWithIds`: this is an access-control list, and replace-set
mass-revokes whenever the client's view of the set is incomplete — the exact failure this work
exists to fix. Per-principal add/remove is also how Drive permissions, GitHub collaborators and IAM
bindings work.

The selected set comes from `sharingSettings` (§1.1), never from the loaded rows of the lazily
paged customer picker — a granted org may sit on a page that was never fetched. With deltas that
degrades to a no-op instead of silent data loss, but the rule still holds on our side and needs a
test.

"Clear all" and "Stop sharing" are a scope switch to `Private`, not an empty set. See §2.4.

**A write that omits `scope` must not touch sharing at all.** The storefront is splitting into two
dialogs — a short Edit (name + description) and a dedicated Share — so partial writes become the
normal case, not the exception. Renaming a list sends `listName` and `description` with no sharing
fields whatsoever, and must leave scope, grants and the link exactly as they were. Worth stating
because today's convention runs the other way: omitting `sharedWithId` detaches the target, which is
why the storefront currently carries the persisted value through on every save.


### 2.2 A sharing revision echoed on read — *optional*

Deltas make this unnecessary for correctness: concurrent adds merge, and a stale view yields a
no-op. We would use it only to warn a rep that the recipient list changed while their dialog was
open. Not needed for correctness.

### 2.3 Defined behaviour for a singular write against plural state

A legacy `sharedWithId` is treated as a one-element set, or rejected outright — not a silent
collapse. Released clients still send it.

### 2.4 One list-level sharing key, stable for the life of the list

The design shows a single shareable link for all recipients. Today `EnsureSharingSettings` assigns
`sharingSetting.Id = sharingKey` and `Id` is the row PK, while `GetWishlistBySharingKeyAsync` looks
the cart up by `ShoppingCartSearchCriteria.SharingKey` assuming uniqueness — so N rows cannot all
carry the key. The key has to move off the row PK to a list-level value.

**Decided: the key is reused, not rotated.** Stop-sharing deactivates the grant; re-enabling link
sharing later restores the same URL. The consequence, stated deliberately: someone who kept the old
link from a previous sharing period regains access when link sharing is switched back on, without
the rep re-sending it. Accepted as the AC's preference for link stability.

**Say where the frontend reads it.** Either `sharingSettings[].id` continues to *be* the list-level
key, or add `WishlistType.sharingKey`. This is not cosmetic: the modal today reads
`list.sharingSetting.id` and mints a fresh `crypto.randomUUID()` when it is absent
(`add-or-update-wishlist-modal.vue:181`). If the key moves off the row PK with no documented home,
every edit-save mints a new one and the link rotates on every save — exactly what the reuse rule
above forbids.

### 2.5 Adding a target and removing one need separate authorization

*(new requirement created by 2.1)*

Removal is always allowed to the list owner. Scenario: rep R shares list L with org O, then R is
unassigned from O. R must still be able to revoke.

This works today only by accident — `AuthorizeCustomerShareAsync` returns early unless the incoming
scope is `Customer`, so revoking via `Private` never reaches the `ServesOrganizationAsync` check.
Concretely with §2.1: authorize the ids in `addSharedWithIds`, and do **not** authorize those in
`removeSharedWithIds`. Running the serves-organization check over removals would block R from a list
they own and leave O with access indefinitely.

---

## 4. Behaviour observable through the API

### 3.1 A read must not require Write — *the standing defect, ship first*

`PurchaseSchema.InitializeWishlistUserContext` defaults `requestedAccess` to `Write`, and
`CheckSharedWishlistUserContext` then rejects a Read holder — so a targeted customer, who holds
`Read`, can neither read nor edit. `sharedWishlist(sharingKey)` requests `Read` explicitly and is
**not** affected; this is the ordinary-id resolver only. Also `RequestedAccess.IsNullOrEmpty()`
returns denied, so every caller must set it explicitly.

With targeted customers staying on `Read`, this is the whole of the access requirement — no
capability split, and the card's cog menu stays hidden for customers automatically because it gates
on `access === Write`.

### 3.2 Shared lists appear in the recipient's own `wishlists()` — *the standing defect, ship first*

With `isOwner: false`, and they disappear immediately on revoke. `wishlists(storeId, userId)`
builds owner user/org criteria and never consults `CartSharingSetting.SharedWithId`.

Two traps when adding it: `EnsureSharingSettings` leaves deactivated rows' old target ids intact,
so filtering on `SharedWithId` alone would resurrect revoked shares — the predicate must test the
**active scope** too. And `ClearSearchCache` invalidates only the empty key plus the cart's owner
user/org, while Customer sharing nulls the owner org, so recipient-keyed results need both the old
and new target orgs in the invalidation.

### 3.3 Defined error shape for a rejected share

All-or-nothing is acceptable and simplest. Whatever is chosen must arrive as GraphQL `errors[]`,
never HTTP 500 — one auth denial reportedly surfaced as a 500 from `PurchaseSchema.AuthorizeAsync`
while others returned `200` + `errors[]`.

### 3.4 Scopes stay mutually exclusive, and BE must enforce it

*(new requirement created by 2.1)*

Exactly one scope is active on a list at a time — the pills are single-select, and plural targets
exist only *within* Specific customers. Setting a scope must clear rows belonging to other scopes.

Today that invariant holds by accident, because there is only ever one row. It has to become
explicit the moment N rows are stored, because the precedence behind it is broken: base
`IsAuthorized` returns **true for anyone** if any row is `AnyoneAnonymous`, but
`SalesRepCartSharingService.IsAuthorized` short-circuits on `IsCustomerShared` and runs first — so
a stray Customer row would silently suppress an "Anyone with link" grant. `GetSharingScope` has the
same bias, reporting `Customer` whenever any Customer row exists. Existing rows also need checking:
`EnsureSharingSettings` deactivates by flipping `Scope` to `Private` while leaving `SharedWithId`
populated.

> §3.1 and §3.2 are not extras, and strictly they are not even part of this Story — they are the
> pre-existing defect that makes single-customer sharing useless today. They are independent of
> cardinality and can ship on their own, before any plural work. Fix the overwrite while they stand
> and you get several recipients who are all equally locked out.

---

## 5. Counter-proposal

If the sharing shape is being touched anyway, one list-level object is cleaner than bolting a plural
array onto the current one — it replaces §1.1, §1.2, §2.2, §2.4 and §3.4:

```graphql
sharing {
  scope
  link
  revision      # optional, see §2.2
  grants { principalType principalId displayName }
}
```

With notification recipients modelled separately, and a dedicated sharing mutation so editing a
list's name stops being coupled to changing its grants. An explicit list-level `scope`
alongside typed `grants` forces the §3.4 exclusivity question to be answered in the schema rather
than in service-override ordering. `principalType` costs nothing now and absorbs VCST-5335's "for
future just me" without another breaking change. No per-grant access field and no
`viewerCapabilities`, since every grant carries `Read` and viewer access is already on
`sharingSetting.access`.

---

## 6. Explicitly not asked of BE

| Not asking for | Why not |
| --- | --- |
| Customer list pagination | Already there. `salesRepCustomers` is a full Relay connection — `first`/`after`, `pageInfo`, `totalCount` — and the customers page already pages it at `useSalesRepCustomers.ts:30`. The picker's 100-item cap is ours: `useSalesRepCustomerOptions.ts` hardcodes `first: 100, after: "0"`. |
| Server-side customer search | Same query already accepts `keyword`, `sort` and `filter`; the FE passes `""` and filters client-side. Our bug. |
| Batch notification | `sendCustomerCommunication.organizationId` is a required single string, so 30 recipients means 30 calls. Slow, not blocking — a scaling item after the feature works. |
| Organisation Name in the notification | The FE builds the message body, so it can always include the org name. Only a BE ask if the email *template* itself must carry it — `SalesRepMessageEmailNotification` exposes only Title and Message. |
| A persisted message field | Nothing requires it; the message is notification-only. |
| Who gets notified on add | Entirely client-side today: `onSaved` calls `notifyCustomer` only when `isNewTarget`, one call per org. With a set the FE computes the added ids. Product decides the intent; we implement it. |
| A new principal type | Recipients are organizations, confirmed. `principalType` in §5 is future-proofing, not a requirement. |

---

## 7. Open on our side

None of this changes the contract. Item 1 still blocks building the dialog.

1. **The old single-target rule is encoded in shipped copy and tests.** Retiring it is part of this
   Story: `share_replace_hint` ("The previously selected customer will lose access to this list.")
   exists in 13 locale files, the rule is documented in a comment at
   `wishlist-customer-sharing.vue:72`, and `wishlist-customer-sharing.test.ts:241` asserts the
   warning renders. All three go when sharing becomes additive.
2. **VCST-5335 needs amending.** Its item 2.2 reads "Lists can be edited" and the ticket is *Done*,
   but targeted customers stay on `Read`. Knowingly not delivered — reopen or correct that ticket so
   it stops reading as shipped behaviour.
3. **"Rename (previous Edit)" vs "Edit list should show Sharing details".** With a fully editable
   recipient set the sharing UI is a dialog of its own, so this is now mostly a naming question — but
   the AC still says Edit list shows sharing details, and something has to own that entry point.
4. **Confirmation copy describes the wrong mechanism.** "Stop sharing this page? Anyone with the
   link will lose access." For Specific customers, access comes from org membership, not link
   possession — that copy is only correct for *Anyone with link*. Unspecified whether the dialog is
   shared across all four scopes or worded per scope. Also "this page" — it is a list. Worth
   revisiting alongside §2.4: since the key is reused, "lose access" is true but reversible.
5. **Should losing an assignment auto-revoke the grants it created?** A rep shares list L with
   organization O, then stops serving O. Today the grant simply stays. Auto-revoking is defensible —
   the authority to share came from the assignment — but it means a customer silently loses access to
   a list they are using because of an internal reassignment, the incoming rep cannot recreate what
   they cannot see, and one admin action changes access across N lists and M customers with no trace
   in the UI. Recommendation: do not auto-revoke; keep the grant, resolve its name (§1.2) so the
   owner can see and clean it up deliberately. Product's call, and currently unstated anywhere.
6. **"Notify via" Email/Push checkboxes are a product reversal.** VCST-5724 / PR #2438 (`12b0112e6`,
   2026-08-20) deliberately removed that fieldset and hardcoded both channels, "so the behaviour is
   identical for a new share and for editing". The Figma brings the checkboxes back. Confirm which
   decision stands before we rebuild them.
7. **Message counter.** The mock says `0/250`; the real limit is `1000 − link length − 2`. 250 is
   the safe fixed choice.
8. **"Select all" scope.** The picker loads exactly the first 100, so today it can only mean "the
   100 loaded". BE paging exists, so this is FE work — but if product means every customer matching
   the current keyword, decide whether that enumerates client-side over pages or needs an id-only
   projection.
9. **Zero recipients.** Is `Share` disabled at 0? No frame, no AC bullet.
10. **Non-rep users.** Figma shows four pills unconditionally, but Specific customers is rep-only
   (`isAvailable: isSalesRepUser`) and the whole block is `isCorporateMember`. Nothing states what a
   plain corporate member sees.
11. **No acceptance scenario for the actual repro.** Nothing states "share with Watermelon, then
   Purple Pink, both retain access".

---

## 8. Blind spots

Content referenced by the tickets that cannot be read:

- VCST-5707's description image is a `blob:` media id (`d9c42461-…`, 1199×754) with no attachment
  row, so it is unfetchable even with an API token. May carry requirements.
- VCDZ-894's comment carries 7 more blob images, all unfetchable. The design itself is settled — the
  Figma frames in VCST-5707 are final — so these are only historical prototypes.
- Attachment `81440` (Oleg, 2026-08-12) is referenced by no field — requirement or stray, unknown.

---

*Backend claims verified against module sources at the QA manifest tags and live introspection of
vcst-qa; frontend claims against origin/dev @ `78d02b0e1`. Cross-checked by an independent Codex
pass, whose corrections are folded in.*
