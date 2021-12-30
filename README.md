# B2B Mercury theme for VirtoCommerce Storefront

![image](https://user-images.githubusercontent.com/619699/147751949-c2a7e180-bf6c-4a68-a7b1-cbb6134f170f.png)

**B2B Mercury theme** is a fresh look on the field of eCommerce solutions. This is a place where common B2B and B2C scenarios are combined with the most bleeding edge technologies to deliver blazing fast and fully functional solution. It implements common business use-cases needed for a vast majority of projects we build.

This theme is designed to be used as-is within actual **VC Storefront**. You can modify it by implementing desired components, pages, shared logic to correspond with your project goals.

**VC Storefront Team** is proud to present **B2B Mercury theme** as a good starting point for new projects.

## The project non-functional key features

- **Development performance.** Really fast development using the most effective solution. Enroll starter theme in seconds and start to modify code with HMR features.
- **Client performance.** We are supposed to reach and hold green metrics provided by Google PageSpeed Insights.
- **Decoupled structure.** Presentation layer is decoupled from backend. Shared logic is decoupled from visual components. Developer can concentrate on single task without the need of massive code manipulations.
- **Atomic Design Pattern.** Theme UI is based on Atoms, Molecules and Organisms, combined within Pages and shared Components. This provides a high level of code reusability.
- **Simple styling and theme customization.** We use TailwindCSS to provide the easiest and convinient way of CSS usage. Write as less of code as possible, reuse existing highly-customizable framework features.
- **Fully aligned with VirtoCommerce Storefront.** Thus theme is just a visual representation, we are fully aligned with VC Storefront to provide all common B2B and B2C scenarios processed by VC Platform.

## How does it work?

TBD

## Theme structure

```text
├── assets                        // Images and other asset files used inside your application.
│   └── static
|       ├── bundle                // Scripts, styles and other assets compiled and minified for production.
|       ├── icons                 // Icons used for favicons, PWA, etc.
|       ├── images                // Static images used inside the application.
|       └── styles                // Common styles used inside the application.
|
├── config                        // The Virto theme settings.
|   └── settings_data.json        // The json file contains all the main settings for the theme.
|
├── layout                        // Layout templates used to render theme within Storefront.
|   └──theme.liquid               // Wrapper for SPA, providing HTML document structure.
|
├── locales                       // Locale files used to provide translated content for the theme.
|   └──....
|
├── templates                     // Liquid templates, used in SSR and MPA. Each MPA page needs to have a liquid template here if you want SSR.
|   └──index.liquid               // Entry point for SPA, providing container with necessary scripts and styles.
|
└── client-app                    // The main folder for the application.
    └── src
    |   └── core                  // Common utilities and services that can be shared and used by any pages and libraries.
    |   |   ├── api/graphql       // The GraphQL Models to connect with the Virto Backoffice.
    |   |   |   └──....
    |   |   ├── models            // Core models. (ex. Pagination).
    |   |   |   └──....
    |   |   ├── services          // Overall shared services. Such as AxiosInstance or InitializationService (implement common init logic for all pages).
    |   |   |   └──....
    |   |   ├── utilities         // Some helper services and miscellaneous utils.
    |   |   |   └──....
    |   ├── libs                  // A set of files grouped together in folders by their domain context. The main purpose is code reusing and simple project maintenance.
    |   |   ├── catalog           // Represent a grouping folder for aggregate all building blocks for the particular domain context (e.g catalog browsing).
    |   |   |   ├── components    // The collections of the dumb or presentation components specific only for this domain context.
    |   |   |   |   └──....
    |   |   |   ├── composables   // The files to apply Composition API for this module.
    |   |   |   |   └──....
    |   |   |   ├── types         // The necessary models or types for this module.
    |   |   |   |   └──....
    |   |   └── storefrontUI      // The set of "dummy" ready-to-use components are designed for e-commerce and based on Atomic design principles.
    |   |   |
    |   |   └──....
    |   |
    |   ├── pages                 // Set of pages. The page is the Vue app that usually added to one of the pages that rendered on the server-side (SSR).
    |   |   ├── catalog
    |   |   |   ├── views         // Smart components that implements the particular business context use case related to this page.
    |   |   |   |   └──....
    |   |   |   ├── routes        // Vue application routes.
    |   |   |   |   └──....
    |   |   |   └── main.ts       // The script logic of Vue app entry point for page (Multiple files component)
    |   |   └──....
    |   |
    ├── tests                     // The e2e/ui and unit tests.
    |   └──....
    ├──  .browserslistrc          // Browserslist config file to support previous versions of browsers.
    ├──  .env                     // Envfile to define different Environment Variables.
    ├──  .eslintignore            // Ignore some files in Eslint.
    ├──  .eslintrc                // Eslint configuration file.
    ├──  babel.config             // Babel configuration file.
    ├──  cypress.json             // Cypress configuration file to use in e2e/ui tests.
    ├──  graphql.codegen.yml      // GraphQL configuration file to generate types, where schema is your Virto Backoffice url.
    ├──  tsconfig.json            // TypeScript configuration file.
    └──  vue.config.js            // Vue.js Global CLI Config
```

## Getting started

### Prerequisites

- Install `vc-platform` 3.x the latest version. [Deploy on Windows](https://github.com/VirtoCommerce/vc-platform/blob/master/docs/getting-started/deploy-from-precompiled-binaries-windows.md) or [Deploy on Linux](https://github.com/VirtoCommerce/vc-platform/blob/master/docs/getting-started/deploy-from-precompiled-binaries-linux.md)
- Install `vc-module-experience-api` module. [Getting started](https://github.com/VirtoCommerce/vc-module-experience-api/blob/dev/docs/getting-started.md)

### Install the `vc-storefront`

- Clone https://github.com/VirtoCommerce/vc-storefront in to a local folder

- Open the **appsettings.json** file in a text editor.
- In the **Endpoint** section change **Url**, **UserName**, **Password** with correct path and credentials for Virto Commerce Platform:

```json
...
 "Endpoint": {
     "Url": "https://localhost:5001",
     "UserName": "admin",
     "Password": "store",
```

### Setup `B2B Mercury theme`

```bash
# Clone repo into the folder where storefront is installed
git clone https://github.com/VirtoCommerce/vue-starter-theme.git "C:\vc-storefront\wwwroot\cms-content\themes\{store-name}\default"
# Change the current directory
cd C:\vc-storefront\wwwroot\cms-content\themes\{store-name}\default
# install dependencies
yarn
# Start theme in development mode with HMR support
yarn dev
# or build theme to get installable artifact
yarn compress
```

### Run `vc-storefront` application

```bash
# change the current directory
cd C:\vc-storefront
# build and run storefront application
dotnet run
```

## License

Copyright (c) Virtosoftware Ltd. All rights reserved.

Licensed under the Virto Commerce Open Software License (the "License"); you
may not use this file except in compliance with the License. You may
obtain a copy of the License at

http://virtocommerce.com/opensourcelicense

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied.
