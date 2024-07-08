# Shared Types Module For VirtoCommerce Frontend

This module aims to share types from the main frontend app among frontend modules. It provides a centralized location for type definitions that can be used across various modules to ensure consistency and reduce duplication.

## Installation

Install the latest version of the shared types module:

```bash
yarn add @virto-commerce/front-modules-shared-types
```

or install a specific version:

```bash
yarn add @virto-commerce/front-modules-shared-types@1.0.0
```

## Usage

### Export Shared Types

The main file for the shared types module is located in `shared-types/index.ts`.

### Example `shared-types/index.ts`

```ts
export type { Breadcrumb, CartType, CustomerOrderType } from "../client-app/core/api/graphql/types.js";
export type { LoggerType } from "../client-app/core/utilities/logger/logger.type.js";
export type { ICurrency } from "../client-app/core/types/currency.js";
```

## Publishing the Package

To publish the package, run `Theme Shared Types CI` action in [GitHub Actions](https://github.com/VirtoCommerce/vc-theme-b2b-vue/actions) manually. Ensure that that the version in `shared-types/package.json` was changed accordingly in advance.

## Example of Using in Other Modules

1. Install the shared types module:

```bash
yarn add @virto-commerce/front-modules-shared-types
```

2. Import the shared types into your module:

```ts
import type { Breadcrumb, CartType } from "@virto-commerce/front-modules-shared-types";
```

## Links

- [Npm module](https://www.npmjs.com/package/@virto-commerce/front-modules-shared-types)

## License

Copyright (c) Virto Solutions LTD. All rights reserved.

This software is licensed under the Virto Commerce Open Software License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at [http://virtocommerce.com/opensourcelicense](http://virtocommerce.com/opensourcelicense).
