---
name: implement
description: How to work on a vc-frontend code task from start to done — reuse inventory before code, naming review for new public UI-kit API, and the checks that must pass before the task counts as done. Use when the user asks to implement, build, add, fix or change something in client-app (a feature, a component, a page, a style change, a ticket).
---

# Implementing a task in vc-frontend

The rules in `.claude/rules/` say what the code must look like. This skill says how to get there.

## 1. Before writing code

1. **Reuse inventory.** List what already exists and will be reused, and show the list to the developer:
   - UI-kit components: open each one's `vc-<name>.vue` and `vc-<name>.stories.ts` (props, slots, emits, tokens);
   - composables in `shared/<domain>/composables` and `core/composables`;
   - helpers in `core/utilities` and `ui-kit/utilities`.
   Anything you were about to hand-roll that is on this list gets reused instead.
2. **New public UI-kit names come first.** A new prop, slot, emit or `--vc-*` token on a kit component is public API
   for client forks. Propose the names (and what each controls) to the developer and wait for agreement before
   writing the code that uses them.
3. A kit component that looks different in the design than in the kit: stop and tell the developer
   (`ui-kit.md` §9) — don't work around it.

## 2. Done means checked

A task is done only after all of these ran. Report each result; paste failures verbatim, don't summarise them away.

1. `yarn lint` — ESLint isn't run in CI, so this is the only place its warnings surface.
2. `yarn validate:types`.
3. `yarn build` — required after any utility → `@apply` migration (`styles.md` §17: missing classes and
   leading-`!` utilities only fail here); otherwise when styles or imports changed substantially.
4. A look at the result: the page in the browser (`yarn dev`, https://localhost:3000) or the component in
   Storybook. For visual changes, also a second preset and dark mode (Storybook preset + dark toolbar).

If a check can't be run (no backend, no browser), say which one was skipped and why.
