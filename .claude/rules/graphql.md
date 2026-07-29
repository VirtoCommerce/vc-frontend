---
paths:
  - "**/api/graphql/**"
  - "**/*.graphql"
---

# GraphQL

- **Never hand-edit `types.ts`** — it is generated. Run `yarn generate:graphql-types`.
- Use the generated fragment types rather than hand-rolling `Pick<...>`; a hand-rolled type silently
  stays narrow when the fragment is widened later.
- Reuse existing fragments (`...organizationFields`) instead of respelling field sets.
- Do not select fields nothing renders — every field costs backend work.
- Query/mutation generics are inferred from the Document; passing them explicitly is redundant.
