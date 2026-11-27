# Writing a pull request description for vc-frontend

A vc-frontend pull request ships a theme zip and, with it, a public surface: the `ui-kit` components, the
`--vc-*` tokens and BEM classes, the extension registry and the `@vc-frontend/core` facade. Its readers are
people who will never read the branch:

- **whoever deploys the zip** (QA, DevOps, a partner) — needs to know which backend it runs on and which settings
  to switch;
- **fork maintainers** (vc-frontend-next, customer themes) — merge upstream and need to know what their overrides
  stop matching;
- **plugin authors** — build against the facade contract;
- **the reviewer and QA** — go from the PR to the Jira work item and to the built artifact.

Written as a narrative of the work — problem, what I did, what I tried and dropped, tests — the description
answers questions nobody asked and buries the one fact a reader needs. Write the sections instead as **the
readers' questions, in the order they ask them**.

## The shape

```markdown
## Description
<what changed for the shopper or the store operator, in domain terms; the defect it fixes;
 a screenshot or recording for a visible change; a companion backend PR, if one exists;
 the "no new surface" line where it is true — no backend bump / no new settings / no new public API /
 no new dependencies>

## Backend requirements
## Settings
## New public surface
## Breaking changes
## New dependencies

## Checklist

> **Note (…)** — deep rationale, rejected alternatives, measurement detail

## References
### Jira-link:
### Artifact URL:
```

The repository template ([.github/pull_request_template.md](../../.github/pull_request_template.md)) already holds
these headings. Keep them exactly as written: `## References` and its two lines are read by people and by CI.

## What each section answers

**Backend requirements** — «can I deploy this zip on the environment I have?» The modules and versions the build
needs: a `backend-packages.json` bump, a query that now selects a field only a newer module serves, a mutation
added in a paired backend PR (link it). A frontend that asks for a field the backend does not know gets a 400 on
the boot query and renders a blank page, so this is the first thing a deployer checks. `None` when the change runs
on the backend in `backend-packages.json` on `dev`.

**Settings** — «what do I switch on, and what is the default?» New or changed store settings, module settings
that gate a feature, `settings_data.json` keys, `APP_*` environment variables. Give the default and what the
store looks like with it.

**New public surface** — «what may a fork or a plugin now use?» New `ui-kit` props, slots, emits and CSS custom
properties; new `--vc-*` tokens and public BEM classes; new extension points; new `@vc-frontend/core` exports
(with the contract bump); new routes; new locale keys. Phrase it from the reader: not «extracted a slot», but «a
fork can replace the price block through the `price` slot without copying the card».

**Breaking changes** — see the split below. Lists the removed or renamed public classes, `--vc-*` tokens,
props, slots and emits that [styles.md](../../.claude/rules/styles.md) and
[ui-kit-internals.md](../../.claude/rules/ui-kit-internals.md) send here, and any global `ui-kit` default change.

**New dependencies** — npm packages added to `dependencies` (they ship in the bundle; say why an existing one does
not do the job) and notable `devDependencies`. Version bumps of existing packages are not new dependencies.

**Checklist** — the team's own; tick it honestly.

## Three mechanics, without which the skeleton is decoration

**Write `None` explicitly; never drop a section.** A bare `None` is a claim that the author checked. A missing
section is indistinguishable from an author who never considered it, and being forced to answer it is what
surfaces the one fact a reader needed.

**Phrase from the reader, not the author.** The test: does the sentence tell a stranger what they may now do, or
tell a reviewer what you did?

**Demote deep rationale to `>` notes at the bottom.** Rejected alternatives, measurement detail and the mechanism
behind a trade-off belong in the PR — but below everything a reader needs in order to act, and above
`## References`.

## Breaking changes splits three ways, because it breaks at three different times

| Kind | Breaks at | Example |
|---|---|---|
| Type or contract change | a fork's or plugin's `vue-tsc` / build | a removed export, a prop type narrowed, a facade member removed or resignatured |
| Moved or restructured code | the fork's next upstream merge | a component moved, renamed or split; a composable merged into another; a file a fork overrides deleted |
| Behaviour or styling change | runtime, with no warning | a renamed BEM class or `--vc-*` token (the fork's styles silently stop applying), a removed emit (Vue drops the listener without a word), a renamed locale key, a changed default, a query that now needs a newer backend |

The third is the one an undifferentiated list hides and the one nothing in the toolchain catches.

State the deprecation decision too: «the old token is aliased per `ui-kit/DEPRECATION.md`», or «no alias — the
class had no consumer outside the component and is not documented». Either records that compatibility was
considered rather than forgotten. A facade change also names its version bump (`yarn bump:core`).

## References

- **Jira-link** — the full URL, `https://virtocommerce.atlassian.net/browse/VCST-1234`. A correct link shows the PR
  on the work item's Development panel; nobody needs to add it in Jira by hand. Write `None` when there is no ticket. The PR title carries the key
  too, in Conventional Commits form: `fix(VCST-1234): …`.
- **Artifact URL** — written by CI after every build: it replaces the line right after `Artifact URL:` with the
  prerelease zip of the current head. Leave that line empty, never paste or predict a URL, and do not write
  `Artifact URL:` anywhere else in the body — CI rewrites the line after its first occurrence.

## The description has other writers

CI rewrites the Artifact URL after every build, and review bots append their own blocks. A whole-body update
prepared from an earlier draft silently reverts them. Read the live body immediately before writing, change only
your own lines, then read it back.

## Keep it true after every push

Nothing verifies a description, and every commit decays it. Re-read it against the diff after each push and watch
for:

- an identifier renamed in the code but not in the text;
- a claim superseded by a later commit on the same branch;
- an absolute quantifier — «none», «all», «every» — that nobody actually enumerated;
- a claim about a group of items that was verified only on the first one.

The repository is public. Never publish a customer name, a private environment URL or credentials; grep the text
before posting.

## Do not reference planning artifacts

No «Phase 2», «per the plan» or spec-section numbers. State the reason directly instead; a link to a spec that
lives in the repository is fine.

## Recognition signals of the wrong shape

- The sections are chronological — «Problem», «Change», «What I tried», «Tests».
- A `Tests` section. Test coverage is a review dimension; the reviewer reads the test files regardless.
- A renamed class, token or emit mentioned in passing in the description rather than under `Breaking changes`.
- A `backend-packages.json` or GraphQL change with `Backend requirements` left empty.
- No `None` anywhere in a description for a change that plainly adds no public surface — the sections were dropped
  rather than answered.
- Prose explaining what an earlier revision of the branch did, above the sections describing what ships.
