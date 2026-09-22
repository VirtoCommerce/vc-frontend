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

## Cut because the storefront's data flow cannot carry it

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

**What would make it possible:** hold the old cards through the fetch instead of showing skeletons,
for a sort change only. That is a change to how the page reports loading, not a change of animation,
so it is Ivan's call rather than something to slip in behind a visual ticket.

**What ships instead:** the new result set rises in — the design's own entry animation — so the wave
still reads down the grid when the order changes.

### Built exactly as drawn

| Animation | Where |
|---|---|
| Crossfade on a layout change — opacity to 0 with a 6px blur over 130ms, then the new shape | `useCatalogGridMotion` |
| Rise on entry — 14px up, 6px blur, 420ms, staggered 40ms and capped at twelve cards | `useCatalogGridMotion` |
| Both skipped under `prefers-reduced-motion` and where Web Animations do not exist | `useCatalogGridMotion` |
| The timer race against `finished`, which never settles in a background tab | `useCatalogGridMotion` |
| Cancelling the filled fade rather than painting over it — the grid element is reused across a layout change (measured), and a filled animation beats an inline style | `useCatalogGridMotion` |
