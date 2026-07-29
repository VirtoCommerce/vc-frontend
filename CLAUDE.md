# vc-frontend

Vue 3 + TypeScript + Tailwind + Apollo GraphQL B2B storefront theme for VirtoCommerce.

The conventions below are the ones that recur most often in PR review on this repo. Rules that
a linter already enforces are deliberately **not** repeated here — run `yarn lint` for those.
What follows is the judgment-call knowledge that tooling cannot check.

## Commands

| Task              | Command                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Dev server        | `yarn dev`                                                                                 |
| Types             | `yarn validate:types` (`vue-tsc --build --force`; plain `--noEmit` at root checks nothing) |
| Lint              | `yarn lint` / `yarn lint:fix`                                                              |
| Unit tests        | `yarn test:unit`                                                                           |
| Full gate         | `yarn validate` (types + dependency-cruiser)                                               |
| GraphQL types     | `yarn generate:graphql-types` (needs a live backend)                                       |
| Locale gaps       | `yarn check-locales` / `yarn fix-locales`                                                  |
| Style conventions | `yarn check:style-conventions`                                                             |

## Code review

`.claude/skills/fe-code-review/SKILL.md` is a checked-in review skill: the defect classes this team
actually catches, plus which of them the bots already cover. Claude Code picks it up automatically
for anyone who clones the repo — invoke it with `/fe-code-review`, or just ask for a review.

It is a normal repo file. If review turns up a rule that keeps recurring, add it there (or here) in
the same PR, so the checklist grows with the codebase instead of living in one person's head.

Two more rule sets live in `.claude/rules/` and load only when Claude opens a matching file, to keep
this file small: `styling.md` (`*.vue`, `*.scss`) and `graphql.md` (`**/api/graphql/**`, `*.graphql`).
Editing a `.vue` or `.scss` file also runs `scripts/check-style-conventions/index.mjs` as a `PostToolUse`
hook, so RTL and radius-token slips surface immediately rather than at commit time.

## Vue components

- Props via a named interface, never an inline generic — `interface IProps { ... }` +
  `defineProps<IProps>()`. This is ~315 files to 10 across the repo. Same for `IEmits`.
- Interfaces at the top of `<script setup>`, `define*` macros below them.
- Keep logic out of the template. Once a condition is non-trivial or used twice, name it as a
  `computed` — this is the single longest-running review note in the repo's history.
- Boolean props default to `false`, so they can be used as bare attributes.
- Prefer `emits` over passing functions as props — function props make the prop type describe
  behavior rather than what to render.
- Avoid non-null assertions (`item.product!.name`). Narrow with a type guard instead:
  `.filter((item): item is Product => !!item)`.
- Use `useComponentId()` for DOM ids and `useTemplateRef()` for template refs.
- Function declarations for named functions; arrow functions only for callbacks.
- Named constants instead of magic numbers, with a self-describing name
  (`PICKUP_LOCATIONS_QTY_TO_SHOW`, not `5`).
- Name things for what they are — `queryEnabled` rather than `enabled`. The short names that earn
  their place are `e` (event or error; `catch (e)` is the house form), `i`, `a`/`b` for comparator
  arguments and `_` for deliberately unused; one letter outside that set usually wants spelling out.
- `data-test-id` must be unique and specific enough to be an E2E selector, and belongs on the
  interactive element inside the child component rather than on a wrapper.
- Reach for VueUse before hand-rolling (`useDebounceFn`, `useResizeObserver`, `useScriptTag`).
- Routes go through the `ROUTES` constants in `client-app/router/routes/constants.ts`.

## Comments

Comment what the code cannot say: why a workaround exists, which upstream bug it dodges, an
invariant that isn't visible locally, or a conventional approach that was tried and genuinely did
not work — that last one saves the next person repeating it. Explaining what a block does is fine
too; keep it short and skip whatever the line already makes obvious.

Avoid the comment that only makes sense inside the session that produced it — "as requested",
"per review", "for now", "temporary fix", "WAS: …". Those address whoever was in the room at the
time. `yarn check:comment-noise` flags the common phrasings, on edit and on commit.

## i18n

Localization is mandatory — never hardcode user-visible text. In components use
`const { t } = useI18n()`.

**A locale key is added to all 13 locales or the change is incomplete.** Shipping English strings
verbatim into the other 12 files is the same defect as omitting them; both have been caught in
review. Use `yarn check-locales` to find gaps and `yarn fix-locales` to fill them — note it only
acts on _missing_ keys, so to replace English placeholders you must delete them first.

Write messages so they stay grammatical when a count is interpolated. Either use
[vue-i18n pluralization](https://vue-i18n.intlify.dev/guide/essentials/pluralization) or restructure
the sentence so the number lands at the end (`"Current points balance: {n}"`). This has been raised
for ru, fi and en separately.

## Pull requests

Follow `.github/pull_request_template.md`: Description, Jira-link, Artifact URL. A correct Jira link
auto-links the PR to the work item.
