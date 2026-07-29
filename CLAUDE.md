# vc-frontend

Vue 3 + TypeScript + Tailwind + Apollo GraphQL B2B storefront theme for VirtoCommerce.

Typecheck with `yarn validate:types`. The root `tsconfig.json` is `"files": []` plus project
references, so a bare `vue-tsc --noEmit` there exits 0 having checked nothing.

## Code review

`.claude/skills/fe-code-review/SKILL.md` is a checked-in review skill: the defect classes this team
actually catches, plus which of them the bots already cover. Claude Code picks it up automatically
for anyone who clones the repo — invoke it with `/fe-code-review`, or just ask for a review.

`.claude/rules/styling.md` (`*.vue`, `*.scss`) and `graphql.md` (`**/api/graphql/**`, `*.graphql`)
load when a matching file is opened.

## Vue components

- Props via a named interface, never an inline generic — `interface IProps { ... }` +
  `defineProps<IProps>()`. Same for `IEmits`.
- Interfaces at the top of `<script setup>`, `define*` macros below them.
- Keep logic out of the template. Once a condition is non-trivial or used twice, name it as a
  `computed`.
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

Avoid the comment that only makes sense inside the session that produced it. Narrating the edit
("Switched to the batcher", "as requested", "WAS: …") addresses whoever was in the room at the time,
and git already records the change. Hedging ("not sure if", "hopefully this covers it") and
restating the line below ("Set loading to true") are the same problem in other forms.

Keep a block under eight lines unless it is JSDoc carrying `@param`/`@example`.
`yarn check:comment-noise` flags the phrasings and the length, on edit and on commit; whether a
comment merely restates its code is left to review.

## i18n

Localization is mandatory — never hardcode user-visible text. In components use
`const { t } = useI18n()`.

**A locale key is added to all 13 locales or the change is incomplete.** Shipping English strings
verbatim into the other 12 files is the same defect as omitting them. `yarn check-locales` finds
gaps and `yarn fix-locales` fills them, but only for _missing_ keys — delete English placeholders
first or they stay.

Write messages so they stay grammatical when a count is interpolated. Either use
[vue-i18n pluralization](https://vue-i18n.intlify.dev/guide/essentials/pluralization) or restructure
the sentence so the number lands at the end (`"Current points balance: {n}"`).

## Pull requests

Follow `.github/pull_request_template.md`: Description, Jira-link, Artifact URL. A correct Jira link
auto-links the PR to the work item.
