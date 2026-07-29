---
paths:
  - "**/api/graphql/**"
  - "**/*.graphql"
---

# GraphQL

- **Never hand-edit `types.ts`** — it is generated. Run `yarn generate:graphql-types`, which needs a live backend.
- Reaching for the generated fragment type is the usual default when a consumer really does use the
  whole fragment, since a hand-rolled `Pick<...>` silently stays narrow once the fragment is widened.
  But hand-rolling is the better call when a narrow contract is the point — a shared component that
  should not gain a dependency on fields it never reads, or a case where the generated type is wider
  or more nullable than what the consumer actually accepts. Decide per case; neither is a rule.
- Reuse existing fragments (`...organizationFields`) instead of respelling field sets.
- Do not select fields nothing renders — every field costs backend work.
- Query/mutation generics are inferred from the Document; passing them explicitly is redundant.
