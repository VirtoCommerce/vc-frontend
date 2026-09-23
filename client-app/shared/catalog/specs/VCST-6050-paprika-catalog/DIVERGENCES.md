# VCST-6050 — where the build departs from the design

The design is the Claude Design project **🍫 Paprika Front Design**
(`d210690e-2705-4415-a3f3-735cc2e0992d`, owner Ilya), read through `DesignSync`.
The screen is `ui_kits/storefront/CatalogScreen.jsx`; the card is `ui_kits/storefront/ProductCard.jsx`.

This file lists what the design draws that the storefront does **not** build, and why.
Everything not listed here is being built.

## Cut by decision

| # | The design draws | Decision |
|---|---|---|
| 1 | An `Authorized distributor` badge on the product card | Cut (Ivan, 2026-09-22) |
| 2 | A tier-price line on the card — `Qty 10+ −5.8%` | Cut (Ivan, 2026-09-22) |
| 3 | A pack picker on the card — `EA · Pack · Case` | Cut (Ivan, 2026-09-22) |

## Cut because the data does not exist

_(filled in as each is confirmed against the backend — see the iteration notes)_

## Superseded by PR #2494

| # | The design draws | What ships instead |
|---|---|---|
| 4 | A header with a full-width search, an icon rail (`Lists / Compare / Orders / Alerts / Cart`) and a second nav row | The header PR #2494 built: one glass pill with the mega menu. The mock in Jira is an older generation. |

## Where the design contradicts itself

| # | Source | Says |
|---|---|---|
| 5 | `CatalogScreen.jsx` | Sort rail is `Featured · Relevance · Price ↑ · Price ↓ · Newest` |
| 5 | Ivan's screenshot of the live prototype | Sort rail is `Relevance · Price · Lead time` |
| 5 | The storefront | The rail is whatever the store's backend returns from `sortings`; `Relevance` and `Lead time` are not among the seven the storefront knows. The rail renders the backend's list and shortens only the ids it recognises. |

| # | Source | Says |
|---|---|---|
| 6 | `storefront.css` (synced) | No `category__head`, no `category__head-art`, no `vc-catalog-empty`, no `seg` group variant |
| 6 | `CatalogScreen.jsx` | Uses all four |
| 6 | Conclusion | The synced CSS is behind the JSX. Styles for those are derived from the screenshots, not ported. |

## Built, but not as the design draws it

| # | The design draws | What ships, and why |
|---|---|---|
| 7 | The toolbar as one row: layout rail, two switches, five sort tabs | Two rows at the design's own 1550px container. The storefront's toolbar carries **three** switches (`Purchased before` is store-configurable and the design has no such control) and **seven** sortings, which measure 1316px against 1261px of column. This is more content, not looser styling — every part matches the design's own geometry (40px rails, 3px track padding, 14px tab padding, 14px type). |
| 8 | `In stock` as the switch label | `Show in stock` — the storefront's existing string, unchanged. Renaming it would move the label in thirteen locales for every theme, not just this one. |

## Fixed against the design's own warning

| # | Note |
|---|---|
| 9 | The design warns that the sort control "must answer the press instantly, or a second and a half reads as a control that did not take the press". The storefront's `selectedSort` follows the backend's `selected` flag, which is a round trip away — measured at ~1.5s on QA, during which the rail did not move. `category-sort.vue` now holds the pressed value until the search it started settles, then hands authority back. |

## Built, after changing how the page reports a sort

### 10. The split-flap on a sort change

`CatalogScreen.jsx` turns every card on its own axis and swaps its contents **exactly at the edge**,
as a wave down the grid — `rotateY` in the grid, `rotateX` in the list, 105ms out and 125ms back,
staggered 55ms.

It cannot be built here, and the reason is not styling.

The prototype re-sorts an array it already holds, so at the moment a card stands edge-on, both the
old product and the new one are in hand. The storefront asks the backend for a new page and shows
skeletons while it waits. Measured on QA, clicking a sort tab:

| t | the grid holds |
|---|---|
| 0 ms | 16 cards, the old result |
| 135 ms | 16 skeletons |
| 1560 ms | 16 cards, the new result |

The old cards are gone a tenth of a second in and the new ones arrive a second and a half later, so
there is no frame in which a card can be turned from one product to the other.

**What was changed to allow it:** on a sort change only, the grid holds the cards it has instead of
dropping them for skeletons. Sorting does not change the question, only the order of the answer, so
the old answer is still true while the new order is fetched. Every other reload — a filter, a
category, a search — is a different question, and keeps its skeletons.

Two consequences worth knowing:

- Cards are keyed by **seat**, not by product id, because a card that turns has to be the same
  element on the way back. `ProductCard` therefore outlives the product it was opened on and now
  clears what it worked out about the last one.
- The flip is armed by the **press**, not by `selectedSort`. That follows the backend's `selected`
  flag and only moves once the search has answered — a second and a half after the grid has already
  had to decide whether to hold its cards.

Measured after the change: no skeleton phase, all sixteen cards turned, contents changed at 1071ms
and the wave finished at 1689ms.

### Built exactly as drawn

| Animation | Where |
|---|---|
| Crossfade on a layout change — opacity to 0 with a 6px blur over 130ms, then the new shape | `useCatalogGridMotion` |
| Rise on entry — 14px up, 6px blur, 420ms, staggered 40ms and capped at twelve cards | `useCatalogGridMotion` |
| Both skipped under `prefers-reduced-motion` and where Web Animations do not exist | `useCatalogGridMotion` |
| The timer race against `finished`, which never settles in a background tab | `useCatalogGridMotion` |
| Cancelling the filled fade rather than painting over it — the grid element is reused across a layout change (measured), and a filled animation beats an inline style | `useCatalogGridMotion` |

## Card badges and stock

| # | The design draws | What ships, and why |
|---|---|---|
| 11 | `New`, `Bestseller`, `B2B` badges on the photo | Not built. The prototype hard-codes them per product; the storefront's `Product` type carries no such field. The discount badge (from the price) and the purchased-before badge are drawn, at the design's size and position — 22px, 8px in from the photo's corner. |
| 12 | Stock as "Low stock" / "In stock" / out of stock | "Only N left" at 10 or fewer, "In stock: N" above that, "Out of stock" at none. The threshold of 10 is ours — the design has no number, only the state. |
| 13 | A `PACK` column in the list | Cut with the pack picker (#3). The list keeps photo · product · availability · unit price · add to cart · actions. |
| 14 | An "Add to cart" button on simple products | The storefront's quantity stepper, kept by decision (Ivan, 2026-09-22): the design's button is one control where a B2B buyer needs two. |

## Re-audit against the full `storefront.css` (2026-09-23)

DesignSync's `get_file` stops at 256 KiB, and `storefront.css` is 611 KB: every earlier pass read
its first 3,403 of 8,064 lines, which hold the base kit and none of the Paprika layer. The whole
file (downloaded from the project by hand) moved these to the design's numbers: the rail as a stack
of 16px cards, the 140px heading row with the breadcrumbs inside it and the picture as a framed
plate, the grid card's 8px plate and 10px text inset, chips side by side, the column ladder by the
listing's own width, the list row's link-blue title, and the sidebar/drawer switch at lg, not md.

Kept against the design by earlier decision:

| # | The design draws | What ships, and why |
|---|---|---|
| 15 | Quick actions always on the photo | Shown on hover and focus, on hover-capable devices only (Ivan, 2026-09-22). |
| 16 | List rows at rest with the kit's `shadow-md` | Flat at rest, shadow on hover — the same as the grid (Ivan, 2026-09-23). |
| 17 | No product-type badge ("the button already names it") | "Variants" / "Configurable" beside the brand, as asked earlier. |
| 18 | Two switches, "In stock" and "Available at branches" | Three: the storefront's "Purchased before" stays. With three, the switches and the sort do not fit one line at 1440, and the group wraps onto a line of its own. |
| 19 | A 124px stepper in a 196px last column | 150: our stepper does not go narrower, so the last track is 150 plus the actions. |
| 20 | A sticky-free toolbar | Matches: the storefront's own sticky toolbar on phones is gone. |
| 21 | A fixed page of cards | The page size follows the columns the grid draws — 16 rounded up to whole rows: 16 on 1, 2 and 4 columns, 18 on 3 and 6, 20 on 5 — so no page ends on a part-filled row. The column count is read off the listing's width, the same ladder the CSS uses, and `columnsAmountDesktop` / `columnsAmountTablet` (brand page, Builder.io blocks) no longer steer the catalog grid. |
| 22 | The discount badge in the brand orange (`primary`) | Red (`danger`), the storefront's `DiscountBadge`: it was compared against the reference and kept (Ivan, 2026-09-22). |
| 23 | Static photo dots, all one grey | The kit's carousel bullets at the design's 6px and grey, hidden from lg as the design has it; the current photo's bullet stays darker, because ours is a real carousel. |

Limits:

- The seg tabs pad 14px each side where the design pads 13. That is #2494's `VcTabSwitchGroup`
  (`--vc-tab-switch-padding-x: 3.5`), so it is theirs to move, not the catalog's to override.
- The kit pins the product title's line-height with `!important`. The design's 1.32 goes on the
  title's inner text instead, and the title box is sized to two such lines.
- The design's phone layer (below 600: page gutter 12, plate step 13), its wide mode (from 1920: a
  1900 content column, type ×1.0625; from 1680: plate inside 40 high) and the drawer's full-height
  shape are page-level rules and belong to PR #2494.
- In dark every design plate carries a 1px sheen along its top edge. The catalog's plates and rail
  cards now do; the footer plates (#2494) do not yet.
- Icons. The design draws anything under 16px from the solid set (its rule R2); the catalog's
  stock, in-cart, reset and purchased glyphs now ask for `variant="solid"`. What the catalog cannot
  reach, because the kit picks the glyph: the chip's close cross (outline `x`, the design's solid
  `delete-2`) and the link under N variations (outline `external-link` at 12). The kit's outline
  stroke ladder is also a step off the design's — 16: 1.5 against 1.4, 24: 1.75 / 1.85, 28:
  1.8 / 2.0, 36: 2.0 / 2.2, 56: 2.7 / 2.9 — and `heart` and `list` are a newer Lucide cut than the
  design's (a rounder heart; list dots at 5/12/19 against 6/12/18). All of that is `vc-icon.vue`
  and `ui-kit/icons`, site-wide, not the catalog's to override. The arrow ladder matches exactly.
- The stepper's minus and plus carry the design's own 3.7 stroke in the catalog card; the cart,
  compare and product-page steppers do not yet.
- The stuck header is 129px tall where the design's is 65; the rail hangs off it through the kit's
  sticky logic, so it follows #2494 when the header shrinks. The catalog reads `--page-stack`, so it follows
  #2494 once they land there.
