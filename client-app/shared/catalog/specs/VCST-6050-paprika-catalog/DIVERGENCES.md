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
