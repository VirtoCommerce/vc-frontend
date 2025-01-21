# Modules Guide

Welcome to the **Modules Guide**! This documentation will help you understand how to create and manage modules within the project. Modules are the building blocks of our application, promoting scalability and maintainability.

## Table of Contents

- [Modules Guide](#modules-guide)
  - [Table of Contents](#table-of-contents)
  - [What is a Module?](#what-is-a-module)
  - [Folder Structure](#folder-structure)
  - [API](#api)
    - [Schemas](#schemas)
    - [Generation types](#generation-types)
  - [Localization](#localization)
    - [Structure](#structure)
    - [Localization Files](#localization-files)
  - [Pages and Routing](#pages-and-routing)
    - [Adding Pages](#adding-pages)
    - [Registering Routes](#registering-routes)
      - [Module Initialization Interface](#module-initialization-interface)
  - [Extension Points](#extension-points)
    - [Available Extension Points](#available-extension-points)
  - [Module Initialization Interface](#module-initialization-interface-1)
    - [Structure of the `init` Function](#structure-of-the-init-function)
    - [Example of Initialization Function Usage](#example-of-initialization-function-usage)
  - [Architecture \& Modularity](#architecture--modularity)
    - [**Core Ideas:**](#core-ideas)
    - [**Aims:**](#aims)
  - [Best Practices](#best-practices)

---

## What is a Module?

A **module** is a self-contained feature area within the application. Each module encapsulates its own components, services, APIs, and other related code. Examples include modules for quotes management, user reviews, notifications and back-in-stock subscriptions.

**Benefits of Using Modules:**

- **Scalability:** Easily add new features without affecting existing ones.
- **Maintainability:** Isolated codebases make it easier to manage and debug.

---

## Folder Structure

Organizing your module with a consistent structure ensures clarity and ease of navigation. Here's the recommended structure for a module:

```
your-module/
├── api/
│   ├── graphql/
│   │   └── types.ts
├── components/
│   └── YourComponent.vue
├── composables/
│   └── useYourFeature.ts
├── pages/
│   ├── YourModulePage.vue
│   └── index.ts
├── localization/
│   ├── en.json
│   └── de.json
├── types/
│   └── index.ts
└── index.ts
```

**Directory Breakdown:**

- **api/**: Contains all API-related code, including GraphQL schemas and generated types.
- **components/**: Vue components specific to the module.
- **composables/**: Vue composables (hooks) for shared logic within the module.
- **pages/**: Module-specific pages that integrate with the application's routing.
- **localization/**: Localization files for supporting multiple languages.
- **types/**: TypeScript interfaces and types for the module.
- **index.ts**: Entry point exporting public APIs (mainly init function).

---

## API

Modules interact with the backend using GraphQL. Generating consistent and type-safe GraphQL types is crucial.

### Schemas

Each module should define its own GraphQL schemas within the `api/graphql` directory.

```graphql
# modules/your-module/api/graphql/queries/getData/getDataQuery.graphql
query GetData($after: String, $first: Int, $storeId: String) {
  getData(after: $after, first: $first, storeId: $storeId) {
    items {
      id
      isActive
    }
    totalCount
  }
}
```

### Generation types

Each module typically includes its own GraphQL types, often defined in a `types.ts` file within an `api/graphql` folder. These types **are generated** using the following npm command:

```bash
yarn generate:graphql-types
```

This command triggers the execution of the generator.ts script, which is responsible for generating the types.ts files for both the core application and the independent modules.

The `scripts/graphql-codegen/generator.ts` file also plays a crucial role in handling standalone GraphQL schemas. It includes an array called `independentModules`, where each object represents a separate GraphQL schema that needs to be generated independently.

```typescript
 {
    name: "YourModule",
    apiPath: "client-app/modules/your-module/api/graphql",
    schemaPath: `${process.env.APP_BACKEND_URL}/graphql/your-module`,
  },
```

---

## Localization

Supporting multiple languages enhances user experience. Each module can manage its own localization files.

### Structure

Place localization files within the `localization/` directory of the module.

```
your-module/
└── localization/
    ├── en.json
    └── es.json
```

### Localization Files

Example `en.json`:

```json
{
  "your_module": {
    "title": "Your Module",
    "description": "Description of your module."
  }
}
```

You can refer to [Readme](../../README.md#localization) to learn more about checking locales for missing keys and automate fixing them.

---

## Pages and Routing

Modules can introduce their own pages and extend the main application's routing configuration.

### Adding Pages

Place module-specific pages in the `pages/` directory.

```
your-module/
└── pages/
    ├── YourModulePage.vue
    └── AnotherModulePage.vue
```

### Registering Routes

Modules register their routes through an `init` function within the module. This function is called during the application's initialization phase, typically in the `app-runner.ts`.

#### Module Initialization Interface

Each module should export an `init` function that accepts the router and other necessary dependencies (e.g., i18n).

```typescript
// modules/your-module/index.ts
import { Router } from "vue-router";
import { I18n } from "@/i18n";
import { defineAsyncComponent } from "vue";

// Define your components
const YourModulePage = defineAsyncComponent(() => import("./pages/YourModulePage.vue"));

export async function init(router: Router, i18n: I18n): Promise<void> {
  const route = {
    path: "/your-module",
    name: "YourModule",
    component: YourModulePage,
    beforeEnter(to: any, from: any, next: Function) {
      // Add any route guards or logic here
      next();
    },
  };

  router.addRoute(route);
}
```

---

## Extension Points

Modules can enrich the main application by injecting custom components and logic through predefined extension points.

### Available Extension Points

- **useCustomHeaderLinkComponents**
- **useCustomAccountLinkComponents**
- **useCustomProductComponents**
- _Add more_

Each of these functions allows modules to register custom elements that are then displayed in the main application. For instance, the useCustomHeaderLinkComponents function allows a module to register a custom link component that will be displayed in the header of the application.

By using these extension points, modules can seamlessly integrate their functionality into the main application, providing a consistent and unified user experience.

---

## Module Initialization Interface

Each module is initialized and integrated into the main application through an `init` function. This function is responsible for:

- Adding new routes to the router.
- Adding new menu items to the navigation.
- Registering custom components or links to extension points.
- Loading the locale messages for the module.
- Configure GraphQL caching policies.
- and other

### Structure of the `init` Function

Each module should export an `init` function with the following signature (additional parameters can be added as needed):

```typescript
export async function init(router: Router, i18n: I18n): Promise<void> {
  // Initialization logic here
}
```

### Example of Initialization Function Usage

To integrate a module into the main application, you need to import the module's `init` function and call it within the app's runner. Below is an example of how to do this:

```typescript
// client-app/app-runner.ts

// Import the module's init function
import { init as initYourModule } from "@/modules/your-module";

...

initYourModule(router, i18n);

```

---

## Architecture & Modularity

Our application architecture embraces **modularity** to foster a clean, organized, and scalable codebase.

### **Core Ideas:**

- **Separation of Concerns:** Each module handles a specific feature or domain.
- **Encapsulation:** Modules encapsulate their own logic, reducing dependencies.
- **Scalability:** Easily add or remove modules without impacting the entire system.

### **Aims:**

- **Maintainability:** Simplify updates and bug fixes by isolating changes.
- **Collaboration:** Enable multiple developers to work on different modules simultaneously.
- **Consistency:** Adhere to standardized patterns and structures across modules.

---

## Best Practices

To ensure consistency and high quality across all modules, follow these best practices:

1. **Consistent Structure:**

   - Adhere to the recommended folder structure.
   - Keep related files grouped together.

2. **Isolate Module Logic:**

   - Avoid cross-module dependencies unless necessary.
   - Use the module's `composables` for shared logic.

3. **Type Safety:**

   - Define clear TypeScript types in the `types/` directory.
   - Ensure all API interactions use generated GraphQL types.

4. **Documentation:**

   - Document public APIs, components, and composables.
   - Keep the `README.md` updated with relevant information.

5. **Naming Conventions:**

   - Use clear and descriptive names for files and functions.
   - Follow the project's naming guidelines.

6. **Testing:**
   - Write unit and integration tests for module functionalities.
   - Ensure tests are located alongside the code they test.

---

Happy coding! 🚀 If you have any questions or need further assistance, feel free to reach out to the development team.
