---
paths:
  - "client-app/designs/**"
  - "client-app/assets/presets/**"
  - "client-app/config/settings_data.json"
  - "scripts/check-designs.ts"
---

# Designs and presets (`client-app/designs`, `client-app/assets/presets`)

Which file a change goes in, the full rules and the checks: `client-app/assets/styles/README.md`, starting with its
"Where does my change go?" table. BEM and colour rules are in `styles.md`. `yarn check:designs` enforces most of
what follows; the rest is review-only.

1. **Colour only from preset variables**: `var(--color-*)`, a `_colors.scss` semantic, a public `--vc-*` token, and
   `color-mix()` / `rgb(from …)` of these. No hex, numeric `rgb()` / `hsl()` or named colour, in a design or a
   preset stylesheet alike. A colour that belongs to one preset goes in that preset, not in a design.
2. **Token first.** Set the component's public `--vc-<component>-…` token when it has one; write a block rule only
   when it has none. Never set a private variable (`--bg-color`, `--radius`). A preset sets a component's colour
   token on the preset root, `html[data-preset="<preset>"]` (dark: `html.dark[data-preset="<preset>"]`): it is
   inherited, so a block that sets the same token on its own element wins. It targets a block or BEM part only for
   a part with no token.
3. A design's `blocks/<block>.scss` and `dark/<block>.scss` style only their own BEM block (block, elements,
   modifiers), and restate every state that should look different (hover, disabled, modifiers).
4. **Block order in `index.scss`:** kit blocks (`vc-*`) first, then app blocks. At equal specificity the later rule
   wins, so an app block on a kit component's root (`footer-links` on a `VcWidget`) beats the kit block.
5. Keep that specificity equal: a `:not()` / `:has()` condition in a design block goes inside `:where()` (soft's
   `blocks/vc-widget.scss`).
6. **A kit component's code changes for a design only through a new token** whose fallback is today's value, so
   classic computes exactly as before. A new token is public API: agree its name with the developer first.
7. **Preset stylesheet** (`assets/presets/<preset>.scss`): every rule inside `@layer vc.preset`; colours only.
   Public `--vc-*` colour tokens on `html[data-preset="<preset>"]` or `html.dark[data-preset="<preset>"]` itself
   (rule 2), and a rule below it only for a block or BEM part with no token. Only a preset bundled here
   with its `<preset>.json` can have one; a preset fetched from the platform cannot. A bundled preset is listed in
   `presets/index.ts`: its JSON in `presets`, its `.dark.json` in `darkPresets`.
8. **Dark lives in the same file:** a design's dark token values on `html.dark[data-design="<design>"]` in
   `_tokens.scss`, a preset's dark rules in `<preset>.scss` (never a `<preset>.dark.scss`). The one exception: a
   design block's dark values go in `dark/<block>.scss`.
9. The `design` setting in `settings_data.json` is `classic` or the name of a folder in `client-app/designs/`.
10. One story set per component. Check every design and preset with Storybook's Design, Theme preset and dark
    toolbars (`&globals=design:<design>;themePreset:<preset>;darkMode:dark`); never add a per-design story.
11. Host designs and presets never target a Module Federation remote's blocks (README, "Modules and remote plugins").
12. A change to `scripts/check-designs.ts` updates the README "Checks" tables and `scripts/check-designs.test.ts`.
