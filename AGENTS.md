# AGENTS.md

The entry point for AI coding agents. Claude Code loads `CLAUDE.md` and the rule files on its own; any other agent
reads them from here.

1. Read `CLAUDE.md`: commands, architecture and the conventions every rule file shares.
2. Before you change a file, read each `.claude/rules/*.md` whose `paths:` front matter matches it. In short:
   `.vue` and `.ts` → architecture, data-graphql, i18n, security, vue-typescript, and for `.vue` also markup,
   styles, ui-kit; `.scss` → styles; `.graphql` → data-graphql; `locales/*.json` → i18n; `.html` → security;
   `*.test.ts` → tests; `client-app/ui-kit/**` → ui-kit-internals; `client-app/modules/**` and
   `client-app/router/**` → modules-and-routes; designs, presets and `settings_data.json` → designs-and-presets.
   This lists the main ones only; the front matter wins over this summary.
3. How a task runs, from the reuse inventory to done: `.claude/skills/implement/SKILL.md`.
4. Styles, designs and preset colours: `client-app/assets/styles/README.md`, starting with its "Where does my change
   go?" table.
5. Checks: `yarn lint`, `yarn validate:types`, `yarn test:unit run <file>`, `yarn check:designs`,
   `yarn test:unit run scripts/design-token-table.test.ts`; visual changes in Storybook's Design, Theme preset and
   dark toolbars.
6. A Claude Code hook (`.claude/hooks/guard-styles.mjs`) blocks three edits; keep to them by hand: no `!important`
   in any form; no edit to `client-app/assets/styles/_custom.scss` (reserved for forks); no `.vc-*` selector outside
   the UI kit, `client-app/assets/styles/`, a design's `blocks/` and `dark/` files and a preset stylesheet.
