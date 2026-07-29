---
name: fe-code-review
description: Review frontend changes in vc-frontend (Vue 3 + TS + Tailwind + Apollo). Use when reviewing a PR, a diff, or staged changes in this repo, or when asked to check work before pushing. Encodes the defect classes and conventions this team actually flags in review.
---

# Frontend code review (vc-frontend)

## What already runs without you

SonarCloud comments on every PR. ESLint (`sonarjs`, `vuejs-accessibility`, `tailwindcss`,
`no-unsanitized`) and `vue-tsc` run locally and on commit. Automated reviewers appear on some PRs.

Bot findings cluster on a11y attributes, null-safety, typing and casts, and reactivity. They also
raise races, i18n gaps and cache issues, usually without establishing whether the path is reachable.

Don't divide the work by topic — take those same categories further: trace the path, cite
`file:line`, name the repro. Verify a bot finding before repeating it: #2363 named functions that
don't exist, and #2138, #2123, #2188, #2261 and #1998 were answered as false positives.

## Process

**1. Establish what changed and why.** Read the PR description and the linked Jira issue. A finding
that ignores stated scope ("orders and quotes are a separate task") wastes everyone's time.

**2. Read the full file, not the diff hunk.** Defects here are usually interactions between the
change and code outside it — the empty-state block further down, the other call site, the sibling
component that wasn't updated.

**3. If the change touches a backend contract, read the paired backend PR** before claiming a
mismatch. Quote the resolver, not the data-layer criteria.

**4. Verify before reporting.** For any behavioral claim, either trace the exact code path and cite
`file:line`, or run it. "Verified in the browser" and a repro are what make a finding land. If you
cannot verify, say so and label it a question rather than a defect.

**5. Rank and report.** Severity first, then the cheap nits grouped at the end. Use `ReportFindings`
when available.

## Checklist

### Completeness of the change

- New locale keys present in **all 13** locale files, actually translated (not English copied in),
  and in the right language. Run `yarn check-locales`.
- Empty-state / reset-button conditions updated when a filter source moved.
- Any separate mobile and desktop paths both updated.
- Every call site of a changed composable or component updated.
- Dead code not shipped: `v-if="false"` UI, emits nobody consumes, query fields nothing renders.

### Async, state and cache

- Concurrent mutations that each write the same Apollo cache entry — out-of-order responses clobber.
  Check whether the mutation is already deduped at the link layer (`UpdateShortCartItemQuantity`) or
  goes through `useMutationBatcher` (`ChangeShortCartItemQuantity`) before calling it a race.
- Module-level state a second scope or route can still read. Deliberate in places and defended as
  safe in review (#2295), so establish that stale data is reachable before calling it a bug.
- `localStorage` used where per-tab `sessionStorage` is the correct semantics.
- Loading flags held for the whole operation, including any follow-up refetch.
- A `catch` that also covers a post-mutation refresh, so success is reported as failure.
- Async results applied without checking they are still current (request-token guard).

### Correctness

- Validation matches what is submitted — `string().required()` passes whitespace; add `.trim()`.
- Prop names spelled as the component declares them; a typo lands silently in `$attrs`.
- Predicates duplicated across files that could drift (`>` vs `>=`).
- Enum/status values that are declared but never handled.

### Conventions

See `CLAUDE.md` for the full list. The ones most often flagged:

- `interface IProps` + `defineProps<IProps>()`, never an inline generic.
- BEM block name equals file name, block class on the component's root tag.
- No overriding UI-kit internal classes from a consumer.
- RTL-safe logical utilities and `rounded-[--vc-radius]` (ESLint + `yarn check:style-conventions`).
- Never hand-edit generated `types.ts`.

### Tests

- Stubs mirror the real component's semantics. A stub that emits more freely than the real component
  produces a green test for behavior that does not exist (#2362).
- Tests assert the logic, not the framework.

## Writing the comment

Match the house style:

> **MEDIUM — Dark disabled chips keep bright variant text.**
>
> These per-variant `--text-color` rules outrank the disabled rule (`.vc-chip--disabled`) by
> specificity, while bg/border do get greyed — so a disabled outline chip shows a greyed background
> with full-brightness text. `vc-button`'s dark file re-asserts disabled text; the chip's doesn't.
>
> **Fix:** guard these with `:not(.vc-chip--disabled)`, or re-assert disabled colors here.

That is: severity label, one-line claim, the mechanism with `file:line` evidence, then a concrete
fix. Add a repro for anything user-visible.

State the limits of a finding honestly — "not visible in the default theme, but any custom status
outside that set will show the stray glyph" is more useful than overstating it. Flag genuinely
arguable calls as design questions rather than defects, and say when something is fine as-is.
