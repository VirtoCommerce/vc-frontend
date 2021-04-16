# VUE MPA starter/boilerplate theme for VirtoCommerce Storefront.
![image](https://user-images.githubusercontent.com/7566324/107653878-c7e6a400-6c8a-11eb-802b-13a38f7f3143.png)

**VUE MPA starter theme** - is starter theme is demonstrated a typical out-of-the-box B2B Portal that built using Liquid templates, Vue.JS web progressive framework and Bootstrap CSS.
 This theme represents the VC Team's opinionated starting point for new projects. It strives to include up-to-date best practices and solutions that we have deemed needed for the majority of projects we build. It is a reflection of what’s possible when building a theme! 

**VUE MPA starter theme** is not only a real-world solution that implements practical business use-cases and  this is also the good starting point for your theme that you can customize by direct code modifications!

# The project non-functional key features:

- Plays opinionated starting point for all new themes and frontend solution constructed on VC storefront. 
- Focus on development performance thanks to maximum reusing of exciting developer experience such as server side functionality, web components and views.
- SEO friendly thanks to SSR (Server Side Rendering) performing on the VC Storefront ASP.NET Core application.
- Presentation logic decoupling from backend. You might fully concentrate on  presentation tasks and do not think for backend. 
- Intentionally lack of using custom CSS an initial styles constructed, using popular Bootstrap CSS library  and have an adaptive markup allows working on all popular devices and resolutions to make the customization process for theme styles  more straightforward. 
- Liquid templates and SSR (server side rendering)  + MPA (multi-page application) architecture with using Vue.JS progressive framework allow to get the all benefits from both server side and WEB development techniques.
  
  

# How does it work?
TBD
# Why MPA (Multi Page Application) instead of SPA (Single Page Application)?
There are the following  reasones why MPA architecture has been chosen. 
- SEO requirements. One of the weaknesses of the SPA is SEO. Unfortunately, they aren’t as SEO friendly as MPA’s. It’s primarily because the majority of single-page applications are run on JavaScript, which most search engines do not support. MPA enables better website positioning as each page can be optimized for a different keyword. Also, meta tags can be included on every page – this positively impacts Google rankings.
- Reusing of exists Storefront's functionality such as security, slug routing, multiple stores, currencies, and languages. All these functionalities are hard to be reused in the classical SPA applications. 

# Theme structure
```bash
.
├── assets                        // Images and other asset files to be copied as-is when you build your application, used in SSR and MPA.
│   ├── graphql                   // Special GraphQL queries used only in liquid templates for SSR.
|   |   └──....
│   └── static
|       ├── bundle                // The scripts and styles build output folder. Contains all resulting js and css bundles. The files are auto-generated.
|       |   └──....
|       └── images                // The static images of the application, are used in SSR and MPA.
|           └──....
|
├── config                        // The Virto theme's settings.
|   └── settings_data.json        // The json file contains all the main settings for the theme.
|
├── layout                        // Layout templates, which by default is the theme.liquid file, used in SSR.
|   └──....
|
├── locales                       // Locale files, which are used to provide translated content for the theme, used in SSR and MPA.
|   └──....
|
├── snippets                      // Theme's Liquid snippet files, which are bits of code that can be referenced in other templates of a theme, used in SSR.
|   └──....
|
├── templates                     // Liquid templates, used in SSR and MPA. Each MPA page needs to have a liquid template here if you want SSR.
|   └──....
|
└── client-app                    // The main folder for components and pages of the Vue.js MPA application.
    ├── src
    |   ├── core                  // Common utilities and services that can be shared and used by any pages and libraries.
    |   |   ├── api/graphql       // The GraphQL Models to connect with the Virto Backoffice.
    |   |   |   └──....
    |   |   ├── models            // Core models. (ex. Pagination).
    |   |   |   └──....
    |   |   ├── services          // Overall shared services. Such as AxiosInstance or InitializationService (implement common init logic for all pages).
    |   |   |   └──....
    |   |   └── utilities         // Some helper services and miscellaneous utils.
    |   |       └──....
    |   |
    |   ├── libs                  // A set of files grouped together in folders by their domain context. The main purpose is code reusing and simple project maintenance.
    |   |   ├── catalog           // Represent a grouping folder for aggregate all building blocks for the particular domain context (e.g catalog browsing).
    |   |   |   ├── components    // The collections of the dumb or presentation components specific only for this domain context.
    |   |   |   |   └──....
    |   |   |   ├── composables   // The files to apply Composition API for this module.
    |   |   |   |   └──....
    |   |   |   ├── types         // The necessary models or types for this module.
    |   |   |   |   └──....
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
    |   └── styles                // The styles of the application, are used in SSR and MPA.
    |       ├── scss
    |       |   └──....
    |       └── main.scss         // The styles entry-point, will include other /scss files and also will be used in SSR and MPA.  
    |
    ├── tests                     // The e2e/ui and unit tests.
    |   └──....
    |
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

# Getting started
## Prerequisites

You need to have local installation of storefront. Follow [this article](https://virtocommerce.com/docs/vc2devguide/deployment/storefront-deployment) step-by-step to install storefront from binaries or source code.

## Deploy theme
1. Clone repo into the folder where storefront is installed  `{vc-storefront}/wwwroot/cms-content/themes/{store-name}/default`.
```bash
  git clone https://github.com/VirtoCommerce/vc-odt-mpa-theme.git "C:\vc-storefront\wwwroot\cms-content\themes\Electronics\default"
```
2. Change the current  directory
```bash
   cd C:\vc-storefront\wwwroot\cms-content\themes\Electronics\default\clientApp
```
3. Install Node.js dependencies.
```bash
   npm install    
```
4. Build theme scripts and styles for production with minification
```bash
   npm run build:dev 
```
5. Run storefront 


# License
Copyright (c) Virtosoftware Ltd.  All rights reserved.

Licensed under the Virto Commerce Open Software License (the "License"); you
may not use this file except in compliance with the License. You may
obtain a copy of the License at

http://virtocommerce.com/opensourcelicense

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied.
