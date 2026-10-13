# S1b · Plugin with a new backend module

**Your case:** there is no backend module yet. You create one, and it ships a storefront plugin.

**Before you start:** the .NET SDK the platform targets, and `vc-build` (`dotnet tool install -g VirtoCommerce.GlobalTool`).
Creating the module itself is the platform's job; the full guide is
[Create a new module](https://virtocommerce.com/docs/platform/developer-guide/Tutorials-and-How-tos/Tutorials/creating-custom-module/).

## Steps

1. **Create the module from the template.** 📁 the folder that holds your repos:

   ```bash
   dotnet new install VirtoCommerce.Module.Template
   dotnet new vc-module --ModuleName Foo --CompanyName VirtoCommerce --Author "Your Name" --PlatformVersion <version>
   ```

   Use the platform floor from `BACKEND_REQUIREMENTS` for `--PlatformVersion`. The template's default is older.

2. **Build it once.** 📁 the new module: `vc-build Compress`.

   ✅ A package appears in `artifacts/`.

3. **Add the plugin:** [S1a](./s1a-plugin-in-an-existing-module.md) from step 1, with the module's
   `src/VirtoCommerce.Foo.Web` folder.
4. **Need your own GraphQL?** The module registers its own xAPI schema with `ScopedSchemaFactory`; the worked
   example is `vc-module-sales-rep`'s
   `src/VirtoCommerce.SalesRep.ExperienceApi/Extensions/ServiceCollectionExtensions.cs`. Plugins scaffolded with
   `--with-apollo` read it from `/graphql/<plugin-name>`, so give the scope the plugin's name.

## ✅ Done when

S1a is done: `check:plugin-module` passes with `--artifact` and `--env`.

## ⚠️ Watch out

1. **The template's default platform version is old.** `check:plugin-module` fails it; set `--PlatformVersion` to
   the floor from the start.
2. **Module id and plugin name are different things.** The module is `VirtoCommerce.Foo`; the plugin is a
   kebab-case name such as `foo`. `check:plugin-module` reads each from its own file.
3. **The module's CI must have Node** to build the plugin. Copy the CI setup from another module that ships one
   (`vc-module-sales-rep`).

---

_Source-checked on 2026-10-13 against the platform docs. **Not verified:** steps 1–2 were not run for this guide._
