# Mercury theme supplementary files and folders

Given below files and folders are located within the repository root and are needed to make developers' life easier and speed up build process.

## `.browserslistrc`
This file is used to limit browser features available for builder during optimizations.
To read about this file structure please refer to [this article (ru)](https://web-standards.ru/articles/speed-up-with-browserslist/) or [official repository (en)](https://github.com/browserslist/browserslist).
We are using some defaults here. Feel free to update this file during custom theme implementation to use required browser features.

## `.commitlintrc.json`
This file is used to specify [commitlint](https://github.com/conventional-changelog/commitlint) rules checked during commit process. It forces messages to be aligned with provided rulesets. We use [husky](https://typicode.github.io/husky) hooks to prevent pushing of incorrect commit messages into repository.
Currently we are using [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) ruleset to force messages to be aligned with angular-styled format.
More about current rules you can read [here](/.github/COMMIT_CONVENTION.md).

## `.editorconfig`
This file is used by your IDE to force code style to be aligned with defined rules. More about available rules you can read [here](https://editorconfig.org/).
We use the most common rules here, others are forced by Prettier and other tools.
Feel free to tune this file to make it more relative to your requirements.

## `.env`
Local environment variables are defined here. This file is used by [Vite](https://vitejs.dev/) development mode to change some default behavior during development.
Please, consider that those variables are available **only during development**. Don't use this file to define production-sensitive data, or **double-check** that those variables are transferred to production environment correctly.

## `.eslintigonre`
This file is used to skip some files from being checked by [ESLint](https://eslint.org/). We recommend you to define auto-generated and temporary files here to avoid false detections and brain explosion during committing.

## `.eslintrc.js`
[ESLint](https://eslint.org/) should have a set of rules defined to work properly.
We use recommended rules for [Vue3](https://v3.vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) that allows you to use the most features provided by these tools.
Feel free to adjust those rules as you wish.

## `.gitignore`
All files defined here will be ignored from [Git](https://git-scm.com/). This allows you to make your repository as clean as possible by excluding temporary files, build artifacts, etc.

## `.prettierigonre`
All files defined here will be ignored during [Prettier](https://prettier.io/) formatting.
Please, use this file to define files that will not be automatically formatted.

## `.prettierrc`
This is the main configuration file for [Prettier](https://prettier.io/). Feel free to adjust its contents to correspond your requirements using [available options](https://prettier.io/docs/en/configuration.html).

## `graphql.codegen.yml`
As we use [GraphQL](https://graphql.org/) to intercommunicate with the backend, we need to produce [TypeScript](https://www.typescriptlang.org/) definitions to have proper type checking at design time.
This configuration file allows `yarn generate:graphql` or `npm run generate:graphql` command usage to fetch GraphQL schemas from VC Platform and generate corresponding type definitions.
Call this command whenever you want to regenerate typings after VC Platform changes.

## `gulpfile.js`
Since we use [VirtoCommerce Storefront](https://github.com/VirtoCommerce/vc-storefront) as a backend you should produce a correct artifact to deploy the resulting theme on production.
A correct artifact is a zip-file containing all necessary files to run the theme on Storefront. The resulting file should contain all assets, theme rendering logic and bundled SPA code.
A `yarn compress` or `npm run compress` command will build SPA and then produce the resulting zip-bundle.
You can then deploy it on the production or setup your CI/CD to do this automatically.

## `index.html`
This is an index page for [Vite](https://vitejs.dev/) development server. Its content should correspond to main liquid-file served by your Storefront solution.
Here you can define all necessary third-party scripts, styles and other dependencies needed to properly render the application.
The application entry point will be rendered inside its contents to make it available for browser during development providing hot-reload feature.

## `package-lock.json`
This file contains locked versions of all dependencies to make sure that all developers will have the same package versions installed. This allows your team to avoid version conflicts between different workstations.

## `package.json`
This file contains theme package information, predefined scripts, dependencies and some rules needed for `lint-staged` script working properly.

## `postcss.config.js`
Since we use [TailwindCSS](https://tailwindcss.com/) we need to setup [PostCSS](https://postcss.org/) to produce correct code for browser support. This file contains configuration of the [PostCSS](https://github.com/postcss/postcss) tool. Feel free to adjust it to correspond your requirements during development.

## `README.md`
This is an entry point for the whole Mercury theme documentation.

## `tailwind.config.js`
Since we use [TailwindCSS](https://tailwindcss.com/) we can adjust its behavior to make it working properly. This is a right place for theme configuration if you want some style customizations like colors, paddings and [other options](https://tailwindcss.com/docs/configuration).

## `tsconfig.json`
As we use [TypeScript](https://www.typescriptlang.org/) to write code we need to configure it properly. All options needed to make IDE IntelliSense and builder working as expected are defined here. You can adjust this file to make it more relative to your team habits.

## `vite.config.ts`
Since [Vite](https://vitejs.dev/) is our choice we need to setup it to build Mercury theme and make it available for development.
We need to define some rules to correspond other configuration files like `tsconfig.json`. Also this is a place to define proxies to communicate with the local or remote [VirtoCommerce Storefront](https://github.com/VirtoCommerce/vc-storefront). The default proxies leads to our existing environment. Adjust them to your own solution to work with relative data or leave unchanged to play with demo data.

## `yarn.lock`
Since we use [yarn](https://yarnpkg.com/) as package manager this file relates to its dependencies locked versions. The purpose is absolutely the same as `package-lock.json`, but is related to `yarn` tool.

## `_references` folder
This folder is temporary and will be deleted during the release process.

## `.deployment` folder
Since we use [Microsoft Azure Kubernetes Service](https://azure.microsoft.com/ru-ru/) as cloud platform four our deployment we need to have some config files to make CD process with [Argo Workflow](https://argoproj.github.io/) working as expected.
Feel free to modify nested files as you wish or remove this folder if it is unnecessary for your setup.

## `.github` folder
As [GitHub](https://github.com/) is our choice for code hosting we need some customizations to make our work a bit easier. Feel free to modify its contents as you wish if you are forking this repository.

## `.husky` folder
Since we use [husky](https://typicode.github.io/husky) hooks we need to configure its behavior to correspond our needs. Here we have two pre-commit hooks defined: `commit-msg` to verify commit messages and `pre-commit` to run [ESLint](https://eslint.org/) checks with auto-fix on staged files to avoid code styling mismatch.
We strongly recommend to setup this or similar tool to make your developers' life easier.

## `.vscode` folder
This folder contains settings for [Visual Studio Code IDE](https://code.visualstudio.com/). Please, follow given recommendations about extensions to make your IDE working properly.

## `assets/static` folder
This folder contains static files served by your Storefront to make SPA working properly.

### `bundle` subfolder
[Vite](https://vitejs.dev/) builder produces optimized scripts and assets used within the client application and stores them here. This is autogenerated folder which contents is cleaned every build, so **do not put any files here by hand**.

### `icons` subfolder
Here are some icons stored that are needed to be served by Storefront solution. Place your favicons, tiles, manifests and other similar files here.

### `images` subfolder
**TBD:** Move this folder inside `client-app` to be more logically-aligned with the whole application.

### `styles` subfolder
Here main style files are defined. [TailwindCSS](https://tailwindcss.com/) initialization is done here. Feel free to put root-level styles inside this folder. They will be applied to all theme pages.
