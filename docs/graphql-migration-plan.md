# Plan: Migrate .graphql imports to TypedDocumentNode

## Goal

Eliminate `@rollup/plugin-graphql` from the build pipeline by replacing all static `.graphql` file imports with pre-generated `TypedDocumentNode` constants from `types.ts`. This removes 39% of build time spent parsing `.graphql` files.

## Scope

- **71 files**: mechanical migration (swap import, remove type params)
- **3 files EXCLUDED**: use dynamic `gql` template literals at runtime (cannot pre-compile)
- **After migration**: `@rollup/plugin-graphql` stays for the 3 dynamic files but processes only those

## Migration Pattern

Every file follows the same transformation:

```ts
// BEFORE
import mutationDocument from "./updatePersonalDataMutation.graphql";
import type { Mutations, MutationsUpdatePersonalDataArgs } from "@/core/api/graphql/types";

const { data } = await graphqlClient.mutate<
  Required<Pick<Mutations, "updatePersonalData">>,
  MutationsUpdatePersonalDataArgs
>({
  mutation: mutationDocument,
  variables: { command: { personalData } },
});

// AFTER
import { UpdatePersonalDataDocument } from "@/core/api/graphql/types";

const { data } = await graphqlClient.mutate({
  mutation: UpdatePersonalDataDocument,
  variables: { command: { personalData } },
});
```

Changes per file:
1. Replace `import document from "./xxx.graphql"` with `import { XxxDocument } from "@/core/api/graphql/types"` (or from module-local `types` for module files)
2. Remove explicit generic type parameters from `graphqlClient.query<...>()` / `.mutate<...>()` — TypedDocumentNode infers them
3. Remove now-unused type imports (`Pick<Query, ...>`, `MutationsXxxArgs`, etc.)
4. Remove explicit return type annotations where they just duplicate what TypedDocumentNode infers

## Files to Migrate

### Batch 1: Account mutations (22 files)
```
client-app/core/api/graphql/account/mutations/addWishlistBulkItem/index.ts
client-app/core/api/graphql/account/mutations/addWishlist/index.ts
client-app/core/api/graphql/account/mutations/addWishlistItem/index.ts
client-app/core/api/graphql/account/mutations/changePassword/index.ts
client-app/core/api/graphql/account/mutations/changeWishlist/index.ts
client-app/core/api/graphql/account/mutations/confirmEmail/index.ts
client-app/core/api/graphql/account/mutations/createContact/index.ts
client-app/core/api/graphql/account/mutations/createUser/index.ts
client-app/core/api/graphql/account/mutations/deleteMemberAddresses/index.ts
client-app/core/api/graphql/account/mutations/deleteWishlist/index.ts
client-app/core/api/graphql/account/mutations/deleteWishlistItem/index.ts
client-app/core/api/graphql/account/mutations/inviteUser/index.ts
client-app/core/api/graphql/account/mutations/registerAccount/index.ts
client-app/core/api/graphql/account/mutations/registerByInvitation/index.ts
client-app/core/api/graphql/account/mutations/removeAddressFromFavorites/index.ts
client-app/core/api/graphql/account/mutations/resetPasswordByToken/index.ts
client-app/core/api/graphql/account/mutations/sendPasswordResetEmail/index.ts
client-app/core/api/graphql/account/mutations/sendVerifyEmail/index.ts
client-app/core/api/graphql/account/mutations/updateContact/index.ts
client-app/core/api/graphql/account/mutations/updateMemberAddresses/index.ts
client-app/core/api/graphql/account/mutations/updatePersonalData/index.ts
client-app/core/api/graphql/account/mutations/updateWishlistItems/index.ts
```

### Batch 2: Account queries (6 files)
```
client-app/core/api/graphql/account/queries/checkEmailUniqueness/index.ts
client-app/core/api/graphql/account/queries/checkUsernameUniqueness/index.ts
client-app/core/api/graphql/account/queries/getSharedWishList/index.ts
client-app/core/api/graphql/account/queries/getWishList/index.ts
client-app/core/api/graphql/account/queries/getWishlists/index.ts
client-app/core/api/graphql/account/queries/requestPasswordReset/index.ts
```

### Batch 3: Organization mutations + queries (7 files)
```
client-app/core/api/graphql/organization/mutations/changeOrganizationContactRoles/index.ts
client-app/core/api/graphql/organization/mutations/lockOrganizationContact/index.ts
client-app/core/api/graphql/organization/mutations/removeMemberFromOrganization/index.ts
client-app/core/api/graphql/organization/mutations/unlockOrganizationContact/index.ts
client-app/core/api/graphql/organization/mutations/updateOrganization/index.ts
client-app/core/api/graphql/organization/queries/getOrganizationAddresses/index.ts
client-app/core/api/graphql/organization/queries/getOrganizationContacts/index.ts
```

### Batch 4: Catalog queries (7 files)
```
client-app/core/api/graphql/catalog/queries/getConfigurationItems/index.ts
client-app/core/api/graphql/catalog/queries/getProductConfigurations/index.ts
client-app/core/api/graphql/catalog/queries/getProduct/index.ts
client-app/core/api/graphql/catalog/queries/getProductPickupLocations/index.ts
client-app/core/api/graphql/catalog/queries/recentlyBrowsed/index.ts
client-app/core/api/graphql/catalog/queries/searchProducts/index.ts
client-app/core/api/graphql/catalog/queries/searchRecommendedProducts/index.ts
```

### Batch 5: Common, files, fulfillment, payment, cart (12 files)
```
client-app/core/api/graphql/common/mutations/pushHistoricalEvent/index.ts
client-app/core/api/graphql/common/mutations/saveSearchQuery/index.ts
client-app/core/api/graphql/common/queries/getCountries/index.ts
client-app/core/api/graphql/common/queries/getMenus/index.ts
client-app/core/api/graphql/files/mutations/deleteFile/index.ts
client-app/core/api/graphql/files/queries/getFileUploadOptions/index.ts
client-app/core/api/graphql/fulfillmentCenters/queries/getFulfillmentCenter/index.ts
client-app/core/api/graphql/fulfillmentCenters/queries/getFulfillmentCenters/index.ts
client-app/core/api/graphql/payment/mutations/authorizePayment/index.ts
client-app/core/api/graphql/payment/mutations/initializeCartPayment/index.ts
client-app/core/api/graphql/payment/mutations/initializePayment/index.ts
client-app/core/api/graphql/cart/queries/getCartPickupLocations/index.ts
```

### Batch 6: Module operations (17 files)
```
client-app/modules/customer-reviews/api/graphql/mutations/createReview/index.ts
client-app/modules/customer-reviews/api/graphql/queries/canLeaveFeedback/index.ts
client-app/modules/customer-reviews/api/graphql/queries/getCustomerReviews/index.ts
client-app/modules/quotes/api/graphql/mutations/approveQuoteRequest/index.ts
client-app/modules/quotes/api/graphql/mutations/changeQuoteComment/index.ts
client-app/modules/quotes/api/graphql/mutations/changeQuoteItemQuantity/index.ts
client-app/modules/quotes/api/graphql/mutations/declineQuoteRequest/index.ts
client-app/modules/quotes/api/graphql/mutations/removeQuoteItem/index.ts
client-app/modules/quotes/api/graphql/mutations/submitQuoteRequest/index.ts
client-app/modules/quotes/api/graphql/mutations/updateQuoteAddresses/index.ts
client-app/modules/quotes/api/graphql/mutations/updateQuoteAttachments/index.ts
client-app/modules/quotes/api/graphql/queries/getQuote/index.ts
client-app/modules/quotes/api/graphql/queries/getQuotes/index.ts
```

## DO NOT Migrate (3 files)

These use dynamic `gql` template literals and must keep `.graphql` imports or runtime query construction:

```
client-app/core/api/graphql/whiteLabeling/queries/index.ts    — dynamic footer links tree depth
client-app/core/api/graphql/catalog/queries/getCategory/index.ts — conditional category fields
client-app/core/api/graphql/catalog/queries/childCategories/index.ts — variable recursion depth
```

## Execution Steps

1. **Migrate one file manually first** to verify the pattern works end-to-end (e.g., `account/mutations/changePassword/index.ts` — simple, one mutation, no custom types)
2. **Migrate each batch** using parallel agents — each file is independent
3. **After each batch**: run `yarn validate:types` to verify type compatibility
4. **After all batches**: run `yarn build-only` and `yarn dev` to verify
5. **DO NOT remove** `@rollup/plugin-graphql` yet — 3 files still need it
6. **Commit**

## Verification

After migration:
- `yarn validate:types` must pass
- `yarn build-only` must succeed
- `yarn dev` must work
- All GraphQL operations must function (same API calls, same responses)
