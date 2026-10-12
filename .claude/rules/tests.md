---
paths:
  - "**/*.test.ts"
  - "**/*.test-d.ts"
---

# Tests (vitest)

1. Unit tests are `*.test.ts` next to the source file (no `.spec.ts`, no new `__tests__/` folders). Type tests are `*.test-d.ts`.
2. Import vitest APIs explicitly: `import { describe, expect, it, vi } from "vitest"`.
3. Mock modules with `vi.mock("@/path", () => ({ useX: () => ({ ... }) }))`, shared mocks via `vi.hoisted`. i18n: `vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k }) }))`.
4. Mount with `@vue/test-utils` `mount` + `global.stubs` for `Vc*` components, via a local `mountX()` factory. Reset shared refs and mocks in `beforeEach` — tests must not depend on order.
5. New selectors use `data-test-id` or `findComponent(VcX)`, never Tailwind/BEM classes or translated text. Existing class selectors are legacy — don't copy them.
6. Test names describe behaviour in present tense (`it("renders ...")`, `it("does not ...")`); `it("should ...")` is also accepted.
7. A test must actually assert the behaviour it names: flag tests with no `expect`, assertions that can never fail, or `it.only` / `describe.only` / `it.skip` left in.
8. Stubs mirror the real component's contract: a stub that renders slots/props the real one doesn't, emits
   events it never emits, or drops the slot under test makes a green test for behaviour that doesn't exist.
   Prefer mounting the real kit component when the behaviour depends on it.
9. A test lives with its subject: a test of locale messages or of a utility doesn't belong in a component spec.
10. A test that keeps passing when the logic it names is deleted or mutated (`>=` → `>`, branch removed) is not
    a test of that logic — flag it when it is the only coverage of a changed branch.
11. Logic changes in composables/utilities (branches, date math, mapping) come with a test change; pure markup/styling changes don't need one.
