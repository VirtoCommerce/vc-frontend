---
paths:
  - "**/*.vue"
  - "**/*.ts"
---

# Vue SFC and TypeScript

CI does not run ESLint (only pre-commit lint-staged, where `warn` never blocks), so rules marked *(eslint warn)* / *(eslint error)* do reach `dev` — report them in added lines. When two forms are both accepted below, the one already used in the touched file wins.

**Moved code is new code.** Lines moved or copied into a new file or a newly extracted component are judged as added lines, even if the same text existed elsewhere before — the change chose to ship them again. Only lines left untouched in their original place count as legacy.

## SFC structure
1. Always `<script setup lang="ts">`, Composition API only.
2. Macro order: `defineOptions` → `defineEmits` → `defineProps` → `defineSlots` (emits before props) *(eslint warn)*.
3. Script order (soft): imports → `IProps`/`IEmits`/local types → macros → module-level `UPPER_SNAKE` constants → composables (`useI18n` first) → state → computed → watchers → functions → lifecycle hooks.
4. Props: named `interface IProps` + `defineProps<IProps>()`; defaults via `withDefaults(defineProps<IProps>(), {...})`. Never destructure props — use `props.x`.
5. Emits: named `interface IEmits` with call signatures — `(event: "apply", code: string): void;` — then `const emit = defineEmits<IEmits>();`. The tuple form exists but is the minority; follow the file.
6. Boolean props are optional adjectives without `is/has`: `disabled?`, `loading?`, `removable?`; feature toggles `with*`/`show*`. Don't add `required` + default (`vue/no-required-prop-with-default`).
7. Custom events are camelCase; `update:modelValue` for v-model. `defineModel` and `modelValue` + emit are both accepted — don't ask to migrate.
8. Template refs in new code: `useTemplateRef<InstanceType<typeof VcModal>>("modal")`.
9. Avoid new `defineExpose` that leaks internals — prefer props/events.
10. **Keep reactivity when passing props to composables**: pass a getter `useX(() => props.item)` or `toRef(props, "item")`, not `useX(props.item)`. A new `eslint-disable vue/no-setup-props-reactivity-loss` needs a reason (one-shot snapshot like initial form values).
11. Functions in SFCs are `function name(): ReturnType {}` declarations, not `const name = () =>`.
12. File names: `.vue` in kebab-case; composables `useX.ts`; other TS files follow the folder's existing style.
12a. Child → parent communication via emits, not function props (`:on-save="fn"` / `callback?: () => void`
     in `IProps`). Exception: `useModal` props such as `onResult`, which is the modal API.
12b. Reach for VueUse before hand-rolling (`useDebounceFn`, `useThrottleFn`, `useEventListener`,
     `useResizeObserver`, `useIntersectionObserver`, `onClickOutside`, `useScriptTag`, `useBreakpoints`).
12c. Composables don't hand out writable refs for state they own: return `readonly(x)` + named setters/actions.
12d. Names say what a thing is: `isQueryEnabled`, not `enabled`; booleans `is/has/can/should*` for state
     (props excepted, see 6); a function with side effects isn't named like a predicate. Short names only for
     `e` (event/error), `i`, `a`/`b` in comparators, `_` for unused.

## TypeScript
13. Interfaces are `I`-prefixed (`IProps`, `IViewConfig`); type aliases are PascalCase with a `Type` suffix (`MissionDataType`) *(eslint warn `naming-convention` — review it)*. Generated GraphQL types are exempt.
14. `interface I*` for props/emits/local view models; `type XType` for unions, derived GraphQL slices and shared domain shapes in `types/`.
15. No `any`; use `unknown` + type guard. A new `eslint-disable ... no-explicit-any` needs a justification. Non-null `!` is allowed by lint but avoid it in new code: narrow with a guard or a type predicate (`.filter((x): x is Product => !!x)`); flag a `!` on a value that can really be empty at that point.
16. String enums or `as const` objects + derived union — both live; stay consistent within the module. No numeric or `const enum`. Lookup maps are typed `Record<UnionType, X>` so a new member fails type-check.
17. `??` vs `||`: flag `||` where `0`/`""`/`false` are valid values. `value || undefined` to normalise empty strings is fine.
18. `async/await`, not `.then` chains. Fire-and-forget promises are prefixed with `void`.
19. Braces always (`curly` is an error): no single-line `if (x) return;`.
20. Module-level magic values are `UPPER_SNAKE` constants; no magic numbers/strings inline repeated across a file.

## Imports and exports
21. `@/` alias across top-level folders; inside one module/feature relative paths are fine — don't mix both styles in one file.
22. `import type` is mandatory and goes last, no blank lines between groups; `.vue` imports after module imports (auto-fixed by lint).
23. No default exports in `.ts` app code (only `.vue`, stories, configs). Re-export components as named: `export { default as AddToCart } from "./add-to-cart.vue"`.
24. Barrels: `shared/<domain>/index.ts` re-exports `components | composables | constants | types | utils`. Deep imports are OK when a barrel would create a cycle or pull a heavy chunk. `import/no-cycle` is an error.
25. `lodash-es` with named imports only (never `lodash`). Use native methods where they exist (`map`, `filter`, `find`, `Set` for uniq, `== null` for isNil).
26. **Reuse before writing helpers**: check `@/core/utilities` (address, date, line-items, logger, product, search, `truncate`, `uniqByLast`, `toCSV`, `safeDecode`, `getLinkAttr`, …) and `@/ui-kit/utilities`. Re-implementing an existing helper is a finding.

## Errors and logging
27. `Logger.debug/warn/error` from `@/core/utilities`, never `console.*`. Leftover debug logging is a finding.
28. Prefix log messages with their origin: `` `${useX.name}.${fn.name}` `` or `"[sales-rep] createTask failed:"`.
29. No empty/ignored `catch`: log and rethrow, or log and return a sentinel (`false`, `null`).

## Comments
30. Code comments in English only.
31. Default to no comments. Flag comments that restate *what* the code does; accept short comments that explain a non-obvious *why*, a workaround or a `TODO(VCST-NNNN)`. No commented-out code.
32. Flag comments that only make sense inside the session that wrote them: narrating the edit ("Switched to the
    batcher", "WAS: …", "now uses …", "as requested"), hedging ("not sure if", "hopefully"), spec/decision ids
    (`D4:`), QA ticket histories and multi-paragraph essays. Keep a comment block to ~5 lines; JSDoc exempt.
    A `TODO` without a ticket key is a deferral nobody tracks → `TODO(VCST-NNNN)`.

## Legacy — don't flag, don't copy
- Inline `defineProps<{...}>()` (10 files), `ref<HTMLElement>()` template refs, `it("should ...")`.
- Mixed camelCase/kebab-case TS file names.
