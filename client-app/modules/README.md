# Modules Architecture

## Core
The **Core** is the main application that includes the API, router, collector, and other essential components.

## Module
A **Module** is an additional functionality developed with minimal impact on the **Core**.

## Extensions
**Extensions** are expansion points that belong to the **Core**.
### Existing Extensions:
- `client-app/shared/common/composables/useCustomProductComponents.ts`
- `client-app/shared/layout/composables/useCustomAccountLinkComponents.ts`
- `client-app/shared/layout/composables/useCustomHeaderLinkComponents.ts`
- `client-app/shared/layout/composables/useCustomMobileHeaderComponents.ts`
- `client-app/shared/layout/composables/useCustomMobileMenuLinkComponents.ts`

## Module Management System
The **Module Management System** is the decision-making point and business logic handler. It is represented as an array of `modules` in the `getStore` request.

## Type Generation System
The **Type Generation System** handles the generation of types and constants for GraphQL API.

---

# Entity Relationships

## Core
- Can function without modules – the `modules` folder can be removed.
- Provides an API **Extensions** for **Module**
- Provides wrapper for the **Module Management System**.
- Has no knowledge of the **Type Generation System**.

## Module
- Can utilize any **Core** functionality, including **Extensions**.
- Only interacts with its own settings from the **Module Management System**.
- Provides `.graphql` documents to the **Type Generation System**.

## Extensions
- Are part of the **Core**, acting as its "branches" or APIs.
- Imported into modules but can also be used within the **Core**.
- Serve as an intermediary between computer memory and **Module**.
- Have no relationship with the **Module Management System**.
- Have no relationship with the **Type Generation System**.

## Module Management System
- Stored within the **Core**.
- Imported into both **Module** and the **Core** to manage components.
- Has no relationship with **Extensions**.
- Has no relationship with the **Type Generation System**.

## Type Generation System
- Generates types and constants for APIs, ensuring separation between **Core** and **Module**.
- Has no relationship with the **Module Management System**.
- Has no relationship with **Extensions**.

