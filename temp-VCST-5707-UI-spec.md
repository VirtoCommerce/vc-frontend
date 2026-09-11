# VCST-5707 — UI/UX spec (Share dialog, desktop + mobile)

Measured from Figma `L8yojzDZ4ng6nZwBPpG6PD` on 2026-09-09 against the 12 frames Ivan listed as
current. Geometry is read off the frames, not inferred. Companions:
`temp-VCST-5707-BE-contract.md` (data), `temp-VCST-5707-FE-plan.md` (state architecture). This file
is the layout authority.

## Frames — 12 nodes

**The desktop six are a sequence, not six copies of the dialog.** An earlier draft of this file
said they were the same six states as the mobile row and that only `535:16411` needed measuring.
That was wrong, and it cost a false claim that the dropdown menu had no design. All six are now
opened and identified:

| # | Desktop frame | What it actually shows |
| --- | --- | --- |
| 1 | `535:15951` | Lists page, no overlay — the layout reference |
| 2 | `535:16064` | Lists page with the **list-actions menu open** (`535:16177`) |
| 3 | `535:16181` | Share dialog · **Private** |
| 4 | `535:16296` | Share dialog · **My organization** |
| 5 | `535:16411` | Share dialog · **Specific customers** (popup instance `535:16525`, measured) |
| 6 | `535:16526` | Share dialog · **Anyone with link** |

Mobile frames sit in a row at y=6099-6131, x ascending by ~500 in this order:

| State | Mobile | Total h |
| --- | --- | --- |
| Private | `566:550` | 278 |
| My organization | `566:563` | 278 |
| Specific customers | `566:576` | 743 |
| Anyone with link | `566:618` | 363 |
| Specific customers · 30 collapsed | `483:9790` | 879 (measured in full) |
| Specific customers · 30 expanded | `483:16521` | 857 (clipped) |

Frame 4 is the visual proof of the My-organization link conflict recorded below: the dialog is tabs
only, with no link field, and its footer reads **Save**.

Superseded prototypes, **not** in the current set: `415:4589`, `477:11114` (two of the three
un-chosen variants from VCDZ-894). `467:4614` is the third, and it is a **special case, not simply
superseded**: VCST-5707's Acceptance links it as the reference for the multiselect dropdown, so its
dropdown (`467:4739`) is binding for *behaviour and row structure* while the current frames own the
*visuals*. Its scope control is stale — radios, not the `VcTabSwitch` tabs of `576:22868` — so read
only the dropdown out of it. Measured below.

`🩹` marks a local patch rather than a real component: **Recipients list**, **Avatar**,
**Field / Shareable link**, and the **WishlistCard** rows. Real instances: `VcDialogHeader` /
`VcDialogContent` / `VcDialogFooter`, `VcTabSwitch`, `VcLabel`, and the `Field / Customers` and
`Field / Message` instances. So the recipients list and the link field are built from scratch — accepted, no ui-kit work is
expected here.

## List-actions dropdown menu — `535:16177`

The entry point for the whole split, and it **is** designed (frame 2 of the desktop sequence).

Container: `bg-additional-50`, `border border-neutral-200`, radius 8, `p-1` (**4**),
`overflow-clip`, shadow `0 4px 6px -4px rgb(0 0 0 / .1), 0 6px 15px rgb(0 0 0 / .1)`. Anchored
under the cog, right-aligned — today's `<VcDropdownMenu :y-offset="4" :x-offset="0"
placement="bottom-end">` already matches.

**The menu is an Acceptance requirement, not just a frame.** VCST-5707's Acceptance field lists it
under "Action wheel": *1. Rename (previous "Edit") · 2. Share (new popup) · 3. Delete*. So the three
items, their order and the Rename label are prescribed in the ticket; the frame supplies the
geometry. Where the two disagree, the Acceptance wins.

Three `VcMenuItem` **md** (40h, `px-3`, `gap-1.5`, `text-sm` Regular), in this order:

| # | Label | Colour | Today's code |
| --- | --- | --- | --- |
| 1 | **Rename** (Acceptance + frame) | neutral-950 | `list_card.list_edit_button` = "Edit" |
| 2 | **Share** (Acceptance + frame) | neutral-950 | does not exist |
| 3 | **Delete** — Acceptance; the frame says *Remove list* | **danger-500** on the *label* | `list_card.remove_list_button` = "Delete", danger on the *icon* only |

Four things to get right, none of them guessable from the geometry:

- **Item 1 is "Rename", not "Edit"** — stated in the Acceptance as *Rename (previous "Edit")*.
  Existing key `shared.wishlists.list_card.list_edit_button` is "Edit" in all 13 locales, so this
  needs a new key, not a re-translation of the old one.
- **Item 3 keeps today's "Delete".** The Acceptance says Delete and the existing key already says
  Delete in all 13 locales; the frame's *Remove list* is the outlier, so no key change.
- **Item 2 needs no new key.** `shared.wishlists.list_card.share_button` already exists and is
  translated in all 13 locales ("Share" / "Поделиться" / "Teilen" / …) and is currently unused —
  left over from an earlier design. Reuse it.
- **Remove colours the label**, not just the glyph. Today `wishlist-dropdown-menu.vue:27` puts
  `<VcIcon name="delete-2" class="text-danger" />` in the *default* slot with a plain label, while
  the Edit item uses `<template #prepend>`. Design shows both prepends aligned and the whole Remove
  label in danger, so that item wants `color="danger"` and its icon moved into `#prepend`.
- **The Figma prepend slots are 14×14 and empty, but the Acceptance's own "Action wheel" screenshot
  is not.** It shows a bare pencil for Rename, a two-person glyph for Share and a trash can for
  Remove list, with the Remove glyph in danger as well as its label. Built as `pencil`, `users` and
  today's `delete-2`; `users` matches the screenshot's silhouette, and the pencil replaces `edit`
  (pencil-in-square) because the screenshot draws no square.

Built with the dropdown's `close()` called before each emit — previously the menu stayed open under the
modal's scrim (pre-existing, visible on dev).

Ignore two artefacts: the frame is 190 wide while each `VcMenuItem` instance inside it is left at
its default **240** and is clipped, so neither number is a spec — the menu is content-sized; and
`535:16151`'s cog is `hidden="true"` on the "Shared with me" row, which is just today's
`access === Write` rule (`wishlist-card.vue:34`) drawn correctly.

## The primary button label changes with the scope

Read off all four dialog states:

| Scope | Footer primary |
| --- | --- |
| Private | **Save** |
| My organization | **Save** |
| Anyone with link | **Save** |
| Specific customers | **Share** |

Desktop and mobile agree (`535:16525` and `483:9790` both read `Share` on Specific customers).
So the label is not "Share" for the dialog and not "Save" for the form — it follows the selected
scope, and it flips live as the user switches tabs. Cancel is `Cancel` in every state.

There is no new locale key for either: `add_or_update_wishlist_modal.save_button` and
`list_card.share_button` both exist in all 13 locales.

## The Customers field has two display states

- **Nothing selected** (`535:16525`): placeholder `Search customers by name or email`.
- **Something selected** (`483:9790`): the control reads `30 selected` — a summary, not a chip list.

Two notes. The placeholder promises **email** search, which the picker cannot do (no search emit
from `VcSelect`, and our rows are organizations that carry no single email — see the FE plan §0.4).
**Shipped 2026-09-10 as "Search customers by name"**, which is what the client-side filter over the
loaded set actually does; if server-side search ever covers more, the placeholder grows with it.
The same slip is why a row's second line is an **address**: raise both with the designer together,
since email is wrong for an organization in either place.

## Stop-sharing confirmation — copy is prescribed

VCST-5707's description gives the dialog verbatim, so this is not a copy decision:

> **Stop sharing this page?**
> Anyone with the link will lose access. You can share it again at any time.
> `Cancel` · `Stop sharing`

followed by *"If sharing is removed, I can create a new sharing option."* Two caveats to raise
rather than fix silently: the copy says "page" where this is a list, and "anyone with the link" is
wrong for the Customer scope, where access follows org membership and not the link. Amending
prescribed copy needs product's yes; **shipped as written on 2026-09-10**.

**Built as its own component, not `VcConfirmationModal`.** The kit organism hardcodes its confirm
button to `ui_kit.buttons.ok` and exposes no way past it, while this dialog's copy prescribes
**Stop sharing** — and "OK" on a button that revokes an audience is worse than a small duplicate.
`stop-sharing-confirmation-modal.vue` is the organism's shape (VcModal `variant="danger"`,
`icon="warning"`, outline-secondary Cancel, solid-danger confirm) with the ticket's own copy, in 13
locales under `shared.wishlists.stop_sharing_modal`. Editing the ui-kit was never an option.

**Trigger, decided 2026-09-09, built 2026-09-10:** it fires only when the scope of an
**already-shared** list changes — on Save, when the persisted scope is a sharing scope and the
selected scope differs. So: not on a first share from `Private`, not when only the recipient set
changes inside the Customer scope, and never on the per-row trash icon. It does fire on
shared → `Private` and on shared → a different sharing scope, since both revoke the current
audience. In code that is one computed in `share-wishlist-modal.vue`: the persisted scope is not
`Private` **and** the selected scope differs. "Not `Private`" is the whole test for "already
shared" — every other scope, core's or a module's, is a sharing option by definition.

## Field visibility per scope — the important table

| Field | Private | My organization | Anyone with link | Specific customers |
| --- | --- | --- | --- | --- |
| Who can access (tabs) | ✅ | ✅ | ✅ | ✅ |
| Customers (picker) | — | — | — | ✅ |
| Recipients list | — | — | — | ✅ |
| Message | — | — | — | ✅ |
| Shareable link | — | ⚠ frame says — , **code wins** | ✅ | ✅ |
| Notify via | — | — | — | **not built** |

Private is **tabs only** — the dialog collapses to 278px. Anyone-with-link adds just the link
(363px). Everything else belongs to Specific customers.

Two cells above disagree with the frames on purpose.

**Shareable link on My organization — frame says no, code says yes, code stays.**
`useWishlistSharingScopes.ts:55` declares `supportsLink: true` for `WishlistScopeType.Organization`
and the modal derives the field straight from that flag
(`listSharingScopeSupportsLink`, `add-or-update-wishlist-modal.vue:180`; field at `:50-66`). Frame
`566:563` is 278px — tabs only, no room for a link. **Decision 2026-09-09: do not touch it.** Ivan
is asking BE whether `/shared-list/:sharingKey` enforces the scope, and the answer decides the
frame's fate, not us. Until then the tab renders the link exactly as it does today, and the frame
is treated as incomplete. The change either way is one line in `CORE_SHARING_SCOPES`.

Why it hangs on BE: `sharingLink` is built from the sharing key alone
(`/shared-list/${sharingSetting.id}`, `:182`) with no scope in it, and the route
(`router/routes/main.ts:153`) is public and unguarded — access is entirely the BE resolver's call.
If the resolver honours the scope, the link is a redundant convenience and dropping it is a product
choice. If it does not, the field hands out a public link under the label "my organization", and the
frame is right for a reason that has nothing to do with layout. That exact question is already a
line in VCST-5925's Acceptance.

**Notify via is not built — see the decision below.**

Message being Customer-only means it belongs in the scope element, not in the shared dialog shell —
which matches where `wishlist-customer-sharing.vue` already puts it.

## Dialog shell

Built 2026-09-10 as `<VcModal max-width="46rem">` (736px; the kit's default is 35.25rem = 564px, which wrapped
the four tabs onto two rows). Whole-rem widths are the repo convention, hence 46 rather than 45.8125.

| | Desktop | Mobile |
| --- | --- | --- |
| Width | 733 | 390 |
| Header | 68 | 68 |
| Footer | 76 | 76 |
| Horizontal inset | 24 → 685 usable | 24 → 342 usable |
| Content height | 557 (Specific customers) | 134 / 219 / 599 / 735 / 736 by state |

Vertical rhythm between fields is **16**. Content scrolls, header and footer stay pinned.

## Recipients — the three designed states

**Short list** (2 recipients, no header):
- Desktop row **54h**: avatar 32×32 at x=12, meta x=56 (w 567), remove **38×38** at x=635.
- Mobile row **52h**: inner `Person` frame inset 12, avatar 32×32, meta x=44 (w **230**),
  remove **32×32** at x=286.

**Collapsed** (`483:9790`, 30 selected, list 342×240):
- List header 40h — `Recipients · 30` at x=12, `Clear all` 67×32 right-aligned at x=269.
- 1px divider, **3 rows**, 1px divider.
- `Show all` bar 42h, button `Show all 30` 128×38 **centred** — x=107 = (342−128)/2.

**Expanded** (`483:16521`, list 342×**1644**):
- Same header, then all 30 rows inline, then `Show less` 118×38 centred at x=112.
- No inner scroll and no max-height on the list: Message lands at y=1874, link at 1992, Notify via
  at 2077 — the content column is ~2123 tall inside a 736 viewport, so the dialog content scrolls.

**Decided, and it differs from the frame:** the `Show all` / `Show less` bar **sticks to the bottom
of the scrolling content, directly above the footer**, whenever the expanded content overflows the
viewport. The list itself is not capped and keeps the frame's full-length layout; only the toggle
follows the reader, so collapsing never requires scrolling past 30 rows first.

Implementation notes:
- The bar lives inside the scroll container (`VcDialogContent`) with `position: sticky; bottom: 0`.
  Sticky is a no-op when the content fits, so the "only when it overflows" condition needs no
  measurement — no `ResizeObserver`, no height math.
- Give it an opaque background from the dialog surface token and a top divider, or rows will show
  through as they pass under it.
- **No bottom padding is needed, contrary to an earlier draft of this note.** The bar is the list's
  last in-flow child, so once the list's end scrolls into view the bar detaches from the scrollport
  and settles after the last row — nothing is permanently occluded. A 42px `padding-bottom` would
  only leave a dead band under the last row in the settled state. Built without it.
- The footer (Cancel / Share) sits outside the scroll container, so "above the footer" comes for
  free — the bar must not be placed in the footer itself.
- DOM order is unchanged (bar stays last in the list), so keyboard order stays correct.

## Customers dropdown — `467:4739` (row `467:4745`)

Read on 2026-09-10, and it settles two things the earlier draft left open.

- **Row** 44h, `px-3` (12), `gap-3` (12), radius **6** (the in-input radius rule), `items-center`.
  The frame's `bg` is `secondary-50` (`#f3f6f9`) — that is `VcMenuItem`'s hover/active state, not a
  resting fill.
- **Checkbox** `VcCheckbox` MD (20) at the head of the row — it comes from `VcSelect multiple`, so
  it appears only in PR-B.
- **Avatar** 32×32 `rounded-full`, initials `Lato Black` white. The frame fills it `#0e7490`, while
  the recipients list fills the same avatar `secondary-500` (`#688198`). **Two raw hexes for one
  element is a designer slip, not two states** — build both from `secondary-500`, and raise it.
- **Meta**, two lines, `flex-1 min-w-0`: line 1 `Lato Bold` **14** neutral-950, line 2
  `Lato Regular` **13** neutral-500 (`#737373`). 13 is not on the project scale — use `text-xs`
  (12/14), per the "every size is a project class" rule.
- **`Row / Select all`** 44h: checkbox, `Select all`, and a right-aligned **`2 of 5`** counter.
  That is where the selected count lives — **not** on the field label, which is where the FE plan
  §3.2 first put it. The row is VCST-5923's to build; the counter arrives with it.

The option row is a two-line row *by design*, so a picker that renders only the organization name
is under-built even before PR-B.

## The Message field — `483:9820`, copy included

The frame prescribes the copy, and it is not what the module shipped before:

| Slot | Frame | Was |
| --- | --- | --- |
| Label | **Message (optional)** | "Message" |
| Placeholder | **Add a note for the recipients** | "Optional message to include" |
| Hint | **Recipients get this in their notification.** | — |
| Counter | **0 / 250** | dynamic `1000 − link − 2` |

`VcTextarea rows=2` → h 66, `p-3`, `border-neutral-300`, radius 8; details are `VcInputDetails`
(`text-xxs` 10/12 neutral-500, hint grows, counter right, danger-500 at the limit). All four are
`VcTextarea`'s own props — `label`, `placeholder`, `message`, `counter` + `max-length` — so nothing
is hand-built.

**Label sizes are the kit's, not the frame's.** Every field label in these frames is 14/18 (`SM`),
but `VcLabel` inside `VcInput`/`VcTextarea` resolves from the input context: MD input → **MD label
(16/20)**. Rendering our own `VcLabel size="sm"` instead would drop the `for`/`id` pairing the kit
generates, so this one is accepted as-is — the same call as the footer button widths. Only labels
outside an input (Who can access, Shareable link's own label) are ours to size.

**The Customers label carries no asterisk** in any frame, while `wishlist-customer-sharing.vue`
passes `required` to the picker. Save *is* blocked without a customer, so the marker is true and it
stays; flagged for the designer rather than silently dropped.

## Visual spec — tokens, colours, borders, spacing, icons

Read off `483:9790` (mobile, full HTML) and `535:16525` (desktop, geometry + the same
component instances) on 2026-09-09, then cross-checked against
`client-app/assets/presets/default.json` and the ui-kit component docs published in Figma.

**How to read it.** Every value is either a **project token** — use it — or a **raw hex the
designer typed**, in which case the mapped token is given and the hex must not be copied. The
mock was drawn on a palette that is not the default theme, so copying its hexes breaks every
other preset.

### Palette

| Figma / mock | Token | `default.json` | Used for |
| --- | --- | --- | --- |
| `--color-additional-50` | `additional-50` | `#ffffff` | dialog bg, tab checked bg, input bg |
| `--color-neutral-950` | `neutral-950` | `#0a0a0a` | dialog title, labels, field text, recipient name |
| `#262626` | `neutral-800` | `#262626` | recipient line 2 (subtitle) |
| `--color-neutral-900` | `neutral-900` | `#171717` | Notify-via channel labels |
| `--color-neutral-600` | `neutral-600` | `#525252` | textarea placeholder |
| `--color-neutral-500` | `neutral-500` | `#737373` | tab label (unselected), tab icon (unselected), input details |
| `--color-neutral-400` | `neutral-400` | `#a3a3a3` | input border, checkbox border |
| `--color-neutral-300` | `neutral-300` | `#d4d4d4` | textarea border |
| `--color-neutral-200` | `neutral-200` | `#ebebeb` | tab border |
| **`#e5e5e5`** ⚠ | `neutral-200` | `#ebebeb` | dialog content top/bottom dividers, recipients-list border, list dividers |
| **`#f5f5f5`** | `neutral-100` | `#f5f5f5` | recipient row divider, read-only link input bg |
| `--color-secondary-500` | `secondary-500` | `#688198` | avatar bg, Remove/Copy icon, Cancel border |
| `--color-secondary-600` | `secondary-600` | `#516477` | header close ✕, Cancel label |
| `--color-primary-500` | `primary-500` | `#f99e24` | tab icon (selected), Share bg/border, checked checkbox bg |
| `--color-danger-500` | `danger-500` | `#de3131` | `VcLabel` required asterisk (unused here) |
| **`#c61717`** ⚠ | ghost-danger **hover** | — | mock painted `Clear all` in its hover colour at rest |
| **`#000000`** ⚠ | `neutral-950` | `#0a0a0a` | mock's `Shareable link` label is raw black |
| `--vc-button-ghost-primary-text` | that token | `#b46b0f` | `Show all` / `Show less` label + chevron |

⚠ = raw hex, replace with the token in the same row.

### Radius, borders, elevation

- Radius **8** everywhere (`--radius-8`) — dialog, tabs, inputs, recipients list, every button.
  `VcDialog` already resolves this from `--vc-dialog-radius → --vc-radius → 0.5rem`.
  Exception: a `VcButton` **inside** `VcInput` gets radius 6 (`--vc-button-radius = --radius − 2px`),
  which is what the Copy button in the link field must use.
- Radius **4** — the Notify-via checkbox box (`VcCheckbox`, its own default).
- Radius **9999** — the avatar.
- Border widths: **1px** on containers (tabs, inputs, textarea, recipients list, dividers);
  **2px** on every `VcButton` (the kit's own rule, including the transparent-bordered ghosts).
- Dialog shadow = **Shadow/LG**:
  `0 0 6px -1px rgb(0 0 0 / .12), 3px 9px 15px -3px rgb(0 0 0 / .08)`. `VcDialog` ships
  `shadow-lg`; take the kit's, don't hand-write it.
- Selected tab shadow = **Shadow/MD**:
  `0 0 1.5px rgb(0 0 0 / .08), 2px 4px 5px rgb(0 0 0 / .08)`. `VcTabSwitch` already applies it in
  its checked state.

### Typography — Lato, and every size is a project class

| Element | Mock | Class | Weight |
| --- | --- | --- | --- |
| Dialog title | 20/28 | `text-xl` | Bold 700 |
| Field labels, tab labels, recipient name, list header, link label | 14/18 | `text-sm` | Bold 700 |
| Input / textarea value + placeholder, footer buttons | 16/20 | `text-base` | Regular 400 / Bold on buttons |
| Recipient subtitle | 14/18 | `text-sm` | Regular 400 |
| Notify-via channel label | 14/20 | `text-sm` | Regular 400 (`VcCheckbox` MD sets 14/20) |
| Avatar initials | 12/14 | `text-xs` | **Black 900** |
| `Clear all` | 12/14 | `text-xs` | Bold 700 (`VcButton` XS) |
| `Show all 30` | 14/16 | `text-sm` | Bold 700 (`VcButton` SM) |
| Input details (hint + counter) | 10/12 | `text-xxs` | Regular 400 |

The only mismatch is `leading`: the mock draws 14/16 on `Show all` and `leading-normal` on the
list header, where `text-sm` gives 18. Take the class, not the mock — the delta is ≤2px and the
buttons set their own line-height anyway.

### Icons — exact lucide names, verified by path data

Each was downloaded from the Figma export and matched against `client-app/ui-kit/icons/outline`
by comparing path geometry, not by eye.

| Slot | Icon | Rendered | Stroke | Colour |
| --- | --- | --- | --- | --- |
| Scope tab · Private | **`hat-glasses`** | 16 | 1.4 (kit: 1.5) | neutral-500 / primary-500 when selected |
| Scope tab · My organization | **`briefcase-business`** | 16 | 1.4 | ” |
| Scope tab · Specific customers | **`user-plus`** | 16 | 1.4 | ” |
| Scope tab · Anyone with link | **`link`** | 16 | 1.4 | ” |
| Header close | **`x`** | 20 | 2.6 | secondary-600 |
| Recipient remove | **`trash-2`** | 16 | 1.4 | secondary-500 |
| Copy link | **`copy-text`** | 20 | 1.5 | secondary-500 |
| Show all / Show less append | **`chevron-down`** | 20 | **2.6** | `--vc-button-ghost-primary-text` |

`chevron-down` at 2.6 and `x` at 2.6 both match `VcIcon` rule R6 exactly (arrow family, ≤20 → 2.6),
so the mock is internally consistent there. The 1.4 on the 16px outline glyphs is 0.1 off the R1
curve (≤16 → 1.5) — use the component default and do not chase 1.4.

**`IWishlistSharingScopeType` has no `icon` field.** `useWishlistSharingScopes.ts:41-56` registers
`Private` / `AnyoneAnonymous` / `Organization` with `labelKey` only, and
`sales-rep/index.ts:88-96` does the same for `Customer`. Every scope now needs a glyph, so the
interface gains `icon: string` and all four registrations must supply one from the table above.
This is the one type change the tab row forces.

### Notify via — decided against the frame, do not build it

**VCST-5724 is Done**, and the option it settled on is explicit: *"Remove the channel selection
completely: hide/remove the Email and Push checkboxes from the Share dialog. Email and Push are
always used as the default notification channels."* The code already implements it —
`wishlist-customer-sharing.vue:109-110` sends `sendEmail: true, sendPush: true` and the component
has no checkboxes at all.

The frames still draw the block, and both boxes are **checked** in them (the exported box is
`#f99e24` with a white check, not an empty outline), which is the frame agreeing with the outcome
while still showing controls that were decided away. The frame is stale. Nothing here is blocked
and nothing is waiting on product.

**Consequence for the layout, which the geometry above still includes:** dropping the block removes
label 18 + gap 8 + channels 20 + the preceding 16 gap = **62**. Desktop content goes 557 → **495**,
and the specific-customers dialog 701 → **639**. The per-element spec for the block is kept below
only so the decision is auditable — it is not a build instruction. Tell the designer the frame
needs re-cutting, or it comes back as a defect at acceptance.

### Per-element geometry and classes

**Dialog shell.** `bg-additional-50`, radius 8, `shadow-lg`, `overflow-clip`.
Width 733 desktop / 390 mobile. The content's top and bottom hairlines come from
`<VcDialog dividers>` (`divide-y`) — but the project's `divideColor.DEFAULT` is **neutral-300**
(`#d4d4d4`), one step darker than the mock's `#e5e5e5`≈neutral-200. Either accept the kit default
or pass `divide-neutral-200` on the dialog; pick one and note it, don't leave it to chance.

**Header** — `VcDialogHeader` MD, `showIcon={false}`, `closable`: `min-h-[68px]`, `px-6 py-3`,
title `text-xl` Bold neutral-950, close hit box **68×68** with the 20px ✕ at its centre
(`left-24 top-24`). No icon circle in this design.

**Content** — `VcDialogContent` already ships `py-4 px-6` (= the mock's 16/24) and is itself the
scroll container. Field stack is `flex flex-col gap-4` (**16**), verified against both breakpoints:
desktop fields land at y = 16 / 88 / 168 / 292 / 410 / 495 inside a 557 box, i.e. 16 top padding,
16 between every pair, 16 bottom.

**1 · Who can access** — `gap-2` (**8**) between label and tabs. *(An earlier draft of this file
said 26 — that was the label's y-offset, not the gap. Same correction applies to Notify via and
Shareable link: all three are 8.)*
- `VcTabSwitch`: `border border-neutral-200`, radius 8, `p-1.5` (**6**), `gap-1.5` (**6**),
  label `text-sm` Bold, icon 16.
  - default: transparent bg, label + icon neutral-500
  - checked: `bg-additional-50` + Shadow/MD, label neutral-950, **icon primary-500**
  - hover: label + icon accent-500 · disabled: neutral-400 · focus: 2px ring primary-500 @30%
- Desktop: one row, content-sized — 79 / 136 / 151 / 139 wide, `gap-4` (16), row 30h.
- Mobile: `flex flex-wrap gap-4`, every tab **163** wide → 2×2, field 56 → **102** tall.
- **Order** is Private → My organization → Specific customers → Anyone with link. The registry appends
  contributed scopes after core's, which would have put Specific customers last, so each registration now
  declares `order` (10 / 20 / 30 / 40); a contribution without one lands at the end.
- Tab labels are the design's: "My organization" and "Anyone with link" replaced "Organization" and
  "Anyone (readonly)" in `sharing_scope.*`, "Specific customers" replaced "Customer" in the sales-rep
  `scope_label` — 26 locale files, values only.

**2 · Customers** — `Field / Customers`, 64h. Outer `gap-1` (4), inner label→control `gap-0.5` (2).
Control = `VcInput` MD: h **44**, `border-neutral-400`, radius 8, `bg-additional-50`, text inset
**11** (`p-0.5 + m-px + px-2`), value `text-base` Regular neutral-950. Placeholder in the mock
reads `30 selected`. Select-all and load-more are VCST-5923.

**3 · Recipients list** — `bg-additional-50`, `border border-neutral-200`, radius 8,
**`overflow-clip`**. Use `overflow-clip`, *not* `overflow-hidden`: `hidden` creates a scroll
container and would break the sticky toggle below, `clip` does not.

- *List header* (collapsed/expanded only, absent in the 2-recipient state): `pl-3 pr-1.5 py-1`,
  `gap-2`, 40h. Title `Recipients · 30` `text-sm` Bold neutral-950, grows.
  `Clear all` = `VcButton` **XS ghost danger**: h 32, `px-3`, radius 8, 2px transparent border,
  `text-xs` Bold. Let the component own resting/hover colour — the mock's `#c61717` is the hover token.
- *Divider* under the header: `h-px bg-neutral-200`.
- *Row*: `px-3 py-2` both breakpoints; the row's height falls out of the remove button, not out of
  padding — desktop 8 + **38** + 8 = **54**, mobile 8 + 36 + 8 = **52**.
  - `Person`: `flex items-center gap-3` (**12**).
  - Avatar 32×32, `rounded-full`, `bg-secondary-500`, initials `text-xs` **Black** white, centred.
  - Meta: `flex-1 min-w-0 flex flex-col`, both lines `text-sm` `leading-[18px]`, `truncate`.
    Line 1 Bold neutral-950, line 2 Regular **neutral-800**.
    Desktop meta column **567** wide; mobile **230**.
  - Remove = `VcButton / Icon` with `icon="trash-2"`, radius 8, icon secondary-500 —
    **SM (38 box / 16 glyph) on desktop**, **XS (32 box / 14 glyph) on mobile**. The mock draws a
    16 glyph in the 32 box; XS gives 14. Take XS as-is unless one line of
    `--vc-button-icon-size: 16px` is acceptable.
  - Row separator: `#f5f5f5` = `neutral-100`. **In the mock only the first row carries it** —
    rows 2 and 3 have none. Build it uniformly as `divide-y divide-neutral-100` on the row wrapper
    (last row excluded); the mock's single border is a leftover, not a pattern.
- *Show all / Show less bar*: full-width `py-0.5` wrapper, button **centred**
  (mock x=107 = (342−128)/2, and 112 when collapsed→expanded swaps the label).
  Button = `VcButton` **SM ghost primary** with a `chevron-down` append icon: h **38**, `px-3.5`
  (14), `gap-2`, radius 8, label `text-sm` Bold. The append glyph is **20**, which SM does not give
  by default (SM = 16), so pass `icon-size="1.25rem"`. `Show less` swaps the glyph for `chevron-up`
  rather than rotating it — the kit has both, and a rotation would need its own transition rule.
  Above it, `h-px bg-neutral-200`.

**4 · Message** — 102h. Outer `gap-1` (4), label→control `gap-0.5` (2).
`VcTextarea` `rows=2` → h **66**, `p-3` (12), `border-neutral-300`, radius 8, `bg-additional-50`,
value/placeholder `text-base`, placeholder neutral-600.
`VcInputDetails`: `gap-2`, `min-h-3` (12), `text-xxs` Regular neutral-500 — hint
`Recipients get this in their notification.` on the left, `0 / 250` right-aligned; the counter
turns danger-500 at the limit.

**5 · Shareable link** — `gap-2` (8), 69h. The mock's label is a bare text node in raw black;
build it as `VcLabel` SM (neutral-950). Input row 44h:
- read-only input, `bg-neutral-100`, `border-neutral-400`, radius 8, `pl-[11px] pr-[49px]`,
  value `text-base` Regular neutral-950 — the right padding is what keeps the URL clear of the
  button.
- Copy button **inset inside** the input: absolute, `right-[3px]`, vertically centred,
  **38×38**, `icon="copy-text"` at 20, icon secondary-500, **radius 6** (the in-input rule).

**6 · Notify via** — **reference only, not built** (see the decision above). `gap-2` (8), 46h. `VcLabel` SM, not required. Channels row `gap-4` (16),
`items-center`. Each channel = `VcCheckbox` MD: box **20**, radius 4, 2px `neutral-400` border,
`gap-2`, label `text-sm`/20 Regular neutral-900; checked = `bg-primary-500`, borderless, white
check. Widths in the mock: `Email` 62, `Push notification` 132.

**Footer** — `VcDialogFooter` already ships `py-4 px-6`, `gap-x-5`, and `me-auto` on the first of
two children, which reproduces the mock's `justify-between`: `Cancel` left, `Share` right.
- `Cancel` = `VcButton` MD outline secondary — h 44, `px-4`, radius 8, 2px `secondary-500` border,
  `bg-additional-50`, label `text-base` Bold secondary-600.
- `Share` = `VcButton` MD solid primary — h 44, `px-4`, radius 8, `bg-primary-500`, 2px
  `primary-500` border, label `text-base` Bold white.
- **Widths will not match the mock, and that is correct.** The mock fixes both at 120. The kit
  sizes footer buttons by container query: `flex-1` between `containers.xs` (320) and
  `containers.md` (448), then `min-w-32 w-auto`. Mobile's footer box is 342 → each button ≈161,
  not 120. Desktop's is 685 → `min-w-32` = **128**, not 120. Accept the kit; editing ui-kit is
  out of bounds.

### Sticky toggle — the ancestor chain checks out

`VcDialogContent` renders a `VcScrollbar`, which is a single element with native overflow and a
`@scroll` listener — no inner viewport wrapper. So `position: sticky; bottom: 0` on the toggle
resolves against that scrollport, and the toggle additionally cannot leave its containing block
(the recipients list), which is exactly the wanted behaviour: it follows the reader while the list
is on screen and settles at the list's end. Two constraints:
- the recipients list must use `overflow-clip`, never `overflow-hidden`;
- `VcScrollbar` only adds its own tab stop when the region has **no** focusable descendants, and
  ours is full of buttons, so no stray tab stop appears.

## Design vs our data model

Mock rows are **people** — initials avatar, person name, **email** on line 2
(`aubrey.kane@lakeside.com`). Our recipients are **organizations** (settled). Keep the structure,
swap the content:

| Slot | Mock | Build |
| --- | --- | --- |
| Avatar | person initials | `sharedWith.imageUrl`, initials of the organization name as fallback |
| Line 1 | person name | `sharedWith.name` |
| Line 2 | email | `sharedWith.subtitle` — "City, Region" |

Never render an email: access belongs to the whole organization, so showing one person's address
asserts something false.

## Decisions the design does not make

1. **Zero recipients.** No empty state anywhere. Hide the block, or show a placeholder? Ties to
   whether Save is disabled at zero.
2. **Picker loading.** No skeleton or spinner while a page loads.
3. **Long names.** Mobile gives the meta column **230px** for name + address, and no truncation is
   drawn. One line each with `truncate`; full value in `title` on desktop.
4. **Unresolvable target.** When `sharedWith` is null (deleted organization, contract §1.2) the row
   has neither name nor subtitle and would render a raw GUID. Needs a designed fallback.
5. **Error state.** No treatment for a rejected share (contract §3.3 returns `errors[]`).
6. **Scope transition.** Switching Specific customers → Private hides five fields at once; nothing
   says whether that is animated or instant, or whether the draft is warned about.

## Not covered by the FE plan, and required

- **Touch targets — deferred by decision.** Mobile draws Remove at **32×32** and `Clear all` at
  67×32, below the ≥44px the project otherwise enforces (see
  `BUG-layout-undersized-touch-targets-mobile.md` in vc-mcp-testing-module). Ivan's call on
  2026-09-09: build to the frame, this is tracked by its own ticket and not fixed here. If raising
  the hit area while keeping the 32px visual turns out to be a one-line change, take it — but do not
  block on it and do not redesign.
- **Keyboard and a11y.** `VcTabSwitch` is a radio group: one tab stop, arrows move between scopes.
  Each Remove needs an `aria-label` naming the organization ("Remove Watermelon Inc."), not a bare
  "Remove". The recipients list should be a list landmark so its count is announced. After removing
  a row, move focus to the next row, or to the list header when the last one goes.
- **Focus order:** tabs → picker → recipients → message → link input → copy → channels → footer. The
  copy button is inside the input, so it must follow it.
- **Reduced motion** on the Show all / Show less transition.
- **Dialog scroll:** content scrolls, header and footer pinned. The 879px collapsed state and the
  ~2123px expanded column both require it.

## Reference: Lists page (desktop, `535:16411`)

Unchanged by this ticket, useful when wiring the `share` menu item: `VcContainer` px-32 pt-24 pb-36;
`VcLayout` with a 240 left sidebar, gap 20; content column 1116 wide, `gap-y-5`. Card rows 60h (48h
without a description), cog 32×32 at x=1064.
