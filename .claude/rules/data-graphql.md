---
paths:
  - "**/*.vue"
  - "**/*.ts"
  - "**/*.graphql"
---

# Data, GraphQL, composables, state

CI does not run ESLint (only pre-commit lint-staged, where `warn` never blocks), so rules marked *(eslint warn)* / *(eslint error)* do reach `dev` — report them in added lines.

**Moved code is new code.** Lines moved or copied into a new file or a newly extracted component are judged as added lines, even if the same text existed elsewhere before — the change chose to ship them again. Only lines left untouched in their original place count as legacy.

## GraphQL
1. **Never hand-edit generated `types.ts`**; run `yarn generate:graphql-types` after `.graphql` changes. A module with its own schema needs an entry in `independentModules` in `scripts/graphql-codegen/generator.ts`. If a PR edits `types.ts` by hand, the reason must be stated and the output must match codegen.
2. One operation per folder: `queries/getX/getXQuery.graphql` + `index.ts` exporting a `useGetXQuery` / `useXMutation` wrapper. Components and composables use the wrapper, not `XDocument` + `useQuery` inline. Shared selections go into `fragments/`.
3. Import `XDocument` / `OperationNames` from the owning `types.ts` (the module's own for module operations).
4. Reactive reads: `useQuery` / `useLazyQuery` from `@vue/apollo-composable`, variables as `computed(() => ({ ...toValue(vars), cultureName: globals.cultureName }))`. Imperative `graphqlClient.query/mutate` is fine in `api/` functions for one-shot reads; question it inside components.
5. Pass `storeId` / `cultureName` / `currencyCode` from `globals` into every store- or culture-scoped operation (missing `cultureName` = untranslated display values).
6. Deprecated `@/core/api/graphql/composables/useMutation` is banned in new code — use `useMutation` from `@vue/apollo-composable`.
7. Banned imports *(eslint error)*: `@apollo/client` root (use `@apollo/client/core`), raw `axios`, `useFetch` from `@vueuse/core`, `useAxios` from `@vueuse/integrations`. REST goes through `@/core/api/common`.
8. After mutations, update the cache with `refetchQueries: [OperationNames.Query.X]` (generated constants, not string literals). `cache.modify/evict/writeQuery` only when a refetch is too expensive, with a comment why.
9. Don't add a parallel `ref(false)` loading flag around `mutate`/queries — expose Apollo's `loading`.
9a. **Select only what is rendered or used.** Every field costs backend work (aggregations, joins). Reusing a
    heavy list/table query to fill a dropdown is a finding — write a narrow document. Reuse existing fragments
    (`...organizationFields`) instead of respelling field sets.
9b. Query/mutation generics are inferred from the `Document`; don't pass them explicitly.
9c. Prefer the generated fragment type when the consumer really uses the whole fragment; a hand-written `Pick<>`
    is fine when a narrow contract is the point. Neither is a finding by itself.
10. Rapid repeated mutations (quantity steppers, toggles) are debounced/batched (`useMutationBatcher`, `queuedMutationsController`), not fired once per click.

## Errors and user feedback
11. The global `errorHandlerLink` already toasts every GraphQL error. If the component shows its own failure state (inline error, empty/not-found view), pass `context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT`. Never suppress AND show nothing — a failure must stay visible. Don't stack a second toast on top of the global one.
12. In `modules/sales-rep`, reads use `useSalesRepHubQuery` (raw `useQuery` is an eslint error there); mutations keep the global toast.
13. Mutation composables catch and return a boolean/result. Map `error.graphQLErrors[0].extensions.code` to an i18n key with a `te()` check and an `UNHANDLED` fallback (`useErrorsTranslator`). Never show a raw server message or an unchecked key.
14. Toasts: `useNotifications()` with translated `text`; `group` + `singleInGroup` for repeatable messages; `single: true` only when clearing every toast is intended; `html:` only for trusted host-built strings.
15. Modals: `useModal().openModal({ component, props: { onResult, ... } })`; pass `triggerElement` when the trigger isn't `document.activeElement` so focus returns.

## Composables and state
16. Composables are `export function useX()` in `composables/useX.ts`, returning a plain object.
17. App-wide singletons: `createGlobalState`. Shared while mounted: `createSharedComposable`. Keyed: `useMemoize` / `createSharedComposableByArgs`. New module-level `const x = ref()` outside such a wrapper is a finding (leaks across tests and builder preview).
18. Composable arguments are `MaybeRefOrGetter<T>` read with `toValue()` inside `computed`/`watch`.
19. URL-backed filters/tabs/search: `useRouteQueryParam(key, { defaultValue, updateMethod: "replace" })`. No manual `router.push({ query })` syncing.
20. `globals` is a non-reactive boot snapshot: fine for GraphQL variables, wrong where UI must react (use `useUser`, `useCurrency`, `useLanguages`, `useThemeContext`). Never call `setGlobals` outside `app-runner.ts`.
21. Settings: store/theme via `useThemeContext()`, modules via `useModuleSettings(MODULE_ID).getSettingValue(...)` — don't dig into `themeContext.storeSettings.modules`.
22. Page titles: `usePageHead({ title: computed(() => t("...")) })`, never `document.title`.
23. Watchers and listeners added manually are cleaned up (`onScopeDispose` / `useEventListener` from VueUse).
24. Analytics: `useAnalytics().analytics("<typedEvent>", ...)`; new events extend `ICustomAnalyticsEventMap` in `core/types/analytics-custom.ts`; no direct `gtag` / `dataLayer` calls from components.

## Dates and money
25. Dates are displayed with `$d(value, "short" | "long")` / `useI18n().d` (formats in `i18n.ts`). No dayjs, no ad-hoc `toLocaleDateString` / `Intl.DateTimeFormat` outside `ui-kit/utilities/date.ts`.
26. Date-only filter values use `toStartDateFilterValue` / `toEndDateFilterValue` / `toLocalDateOnly`. `toISOString().slice(0, 10)` is a bug (shifts the day east of UTC).
27. Money is rendered with `VcPriceDisplay`, `VcProductPrice`, `VcTotalDisplay` (backend `formattedAmount`). No `toFixed`, symbol concatenation or client-side currency math for display.

## Legacy — don't flag, don't copy
- `graphqlClient.query` with default-imported `.graphql` in `core/api/graphql/**` (acceptable inside core for consistency).
- Module-level `stack` ref in `useModal`.
