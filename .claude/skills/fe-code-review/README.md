# fe-code-review — where it came from, how to change it

`SKILL.md` is the skill Claude Code loads. This file is for the humans maintaining it and is never
loaded into a session.

## Provenance

Mined from every review comment this repo has received: **2,975 inline** review comments and **133**
human PR-level comments, across PRs **#10–#2402** (2021 → July 2026). After dropping bots and
acknowledgements, **1,784** substantive human comments went into the analysis.

The rules that survived are the ones that recurred across multiple PRs and multiple reviewers.
Single instances were left out.

## Why "what already runs without you" says what it says

Measured across the 551 bot review comments, by share of comments mentioning each theme:

| Theme                        | Comments |
| ---------------------------- | -------: |
| a11y attributes, focus       |      106 |
| null-safety                  |       77 |
| typing and casts             |       65 |
| reactivity (watch, computed) |       60 |
| races, stale state           |       38 |
| unhandled promises           |       29 |
| i18n, locale keys            |       27 |
| listeners, cleanup           |       22 |
| formatting                   |       21 |
| Apollo cache                 |       18 |

Two things follow, and both are in the skill. The bots are not confined to a tidy set of "shallow"
topics — they raise races, i18n and cache issues too — so the split between bot and human work is
not by topic. And their coverage is uneven: SonarCloud comments on every PR, but cursor Bugbot
reached about half of recent PRs (20 of 39 since #2300) and Copilot 1 of those 39.

The false-positive examples cited in the skill (#2363, #2138, #2123, #2188, #2261, #1998) are
maintainer replies explicitly answering a bot with "false positive", "not a bug" or equivalent.
Nine such replies were found; that is a floor, not a rate, since an ignored bot comment leaves no
trace.

## Changing it

Add a rule when review catches the same thing twice, ideally in the same PR as the review that
prompted it. Two things to check first:

- **Is a linter already handling it?** `vue/padding-line-between-tags` and `vue/html-self-closing`
  cover the two most-repeated nits in the whole corpus (17 and 6 comments), so neither belongs in
  prose. But a lint rule that cannot name the fix still needs the mapping written down —
  `vue/no-restricted-class` only says `'xl:ml-4' class is not allowed`, which is why the RTL table
  lives in `.claude/rules/styling.md`.
- **Does it belong here at all?** Authoring rules go to `CLAUDE.md`, or to `.claude/rules/` if they
  only apply to certain paths. This file is for reviewing.

State rules as things to check, not as universals. "Any separate mobile and desktop paths both
updated" holds regardless of whether a given component has a split; "both the mobile and desktop
paths updated" does not.
