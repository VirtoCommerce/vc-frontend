# VCST-6050 — where the catalog departs from the design

The design is the Claude Design project **🍫 Paprika Front Design**
(`d210690e-2705-4415-a3f3-735cc2e0992d`), exported whole and rendered locally; the catalog was
diffed against it element by element — computed styles, positions and visible text — at 1440 and
390, grid and list, light and dark. Everything not listed here matches the rendered design.

## Kept by decision

| The design draws | The catalog | Decided |
|---|---|---|
| A tier-price line under the price — `Qty 10+ −5.8%` | Not shown | Ivan, 2026-09-22 |
| `/ EA` after the price | Not shown — goes with the pack sizes | Ivan, 2026-09-22 |
| Five sortings, `Relevance` among them | Four: Featured · Price ↑ · Price ↓ · Newest | Ivan, 2026-09-22 |
| The discount badge in the brand orange | Red, the storefront's `DiscountBadge` | Ivan, 2026-09-22 |
| No product-type badge | `Variants` / `Configurable` beside the brand | Ivan, 2026-09-22 |

## Built differently, because the storefront works differently

| The design draws | The catalog, and why |
|---|---|
| Two switches: In stock, Available at branches | Three: the store's `Purchased before` stays. With three, the switches and the sort do not fit one line at 1440, and the group takes a line of its own. |
| A 124px stepper in the list row | 150: the storefront's stepper does not go narrower. |
| `New`, `Bestseller`, `B2B` badges | Not built: the `Product` type carries no such field. |
| A category picture on every category | Only where one is set in the admin; otherwise the heading row is the text plate alone. |
| Static photo dots, one grey | The kit's carousel bullets at the design's 6px and grey, hidden from lg; the current photo's is darker, because ours is a real carousel. |
| A 49px floor under the spec chips | 51.8, exactly two rows of the design's own chip: at 49 a card with two rows sits lower than its neighbours. |
| The facet search inset 12 with a second rule under it | The field on the column's edges under the heading's one rule — the design's is a leftover of the kit's old padded facet. |
| A fixed page of cards | The page rounds 16 up to whole rows of the columns drawn — 16, 18 or 20 — so no page ends on a part-filled row. `columnsAmountDesktop` / `columnsAmountTablet` no longer steer the catalog grid. |
| One "Categories" in the rail | Two: the category list, and the category facet the store returns under the same name. |
| "Low stock" wherever the design's product is flagged | "Low stock" at 10 or fewer — the threshold is ours; the design's data has a flag, not a number. |

## PR #2494's — page and shell tokens

- On a phone (below 600) the design's page gutter is 12 and a plate's inside 24; ours 24 and 28.
- The wide mode (from 1680 / 1920): a 1900 column, larger type, plates 40 high inside.
- The stuck header is 129 tall against the design's 65; the rail's sticky offset follows it.
- Dark: plate shadows off the neutral ramp where the design's are black; the footer plates have
  no top sheen.
- The filters drawer is a floating plate; the design's is full height.
- The seg tabs are set to the design's (13 each side, no rim, the soft shadow) inside the catalog
  only; elsewhere they are still 14, with a rim and `shadow-md`.

## ui-kit's — shared components and assets

- The outline stroke ladder is a step off the design's: 16 — 1.5 / 1.4, 24 — 1.75 / 1.85,
  28 — 1.8 / 2.0, 36 — 2.0 / 2.2, 56 — 2.7 / 2.9. The arrow ladder matches.
- `heart` and `list` are a newer Lucide cut than the design's.
- The chip's close cross and the link icon under `N variations` are outline where the design, under
  16px, draws the solid glyph; the kit picks the glyph.
- The stepper's 3.7 stroke is set in the catalog card only; the cart, compare and product-page
  steppers do not have it.
- Strings: `Add to Compare` beside `Add to list` (design: `Add to wishlist` / `Add to compare`), and
  `You have reached the end of the list.` (design: `You've reached the end of the list`).
- The product title's line-height is pinned by the kit with `!important`; the design's 1.32 is set
  on the title's inner text instead, with the same result.

## Motion

Built as drawn, in `useCatalogGridMotion`: the crossfade on a layout change (130ms, 6px blur), the
rise on entry (14px, 420ms, staggered 40ms, capped at twelve), the split-flap on a sort change
(105ms out, 125ms back, staggered 55ms), all skipped under `prefers-reduced-motion`.

For the split-flap the grid keeps its cards through a sort change instead of dropping them for
skeletons, because a card can only turn from one product to the other if both are in hand; every
other reload — a filter, a category, a search — keeps its skeletons. Cards are keyed by seat, and the
flip is armed by the press, not by the backend's `selected` flag.
