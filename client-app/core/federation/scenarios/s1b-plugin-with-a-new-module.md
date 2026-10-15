# S1b · Plugin with a new backend module

**Your case:** there is no backend module yet. You create one, and it ships a storefront plugin.

**Before you start:** the .NET SDK the platform targets, and `vc-build` (`dotnet tool install -g VirtoCommerce.GlobalTool`).
Creating the module itself is the platform's job; the full guide is
[Create a new module](https://virtocommerce.com/docs/platform/developer-guide/Tutorials-and-How-tos/Tutorials/creating-custom-module/).

## Steps

1. **Create the module from the template.** 📁 the folder that holds your repos:

   ```bash
   dotnet new install VirtoCommerce.Module.Template
   dotnet new vc-module-dba --ModuleName Foo --CompanyName "Virto Commerce" --Author "Your Name" --PlatformVersion <version>
   ```

   It creates `vc-module-foo/` with `src/VirtoCommerce.Foo.Web`. Use the platform floor from `BACKEND_REQUIREMENTS`
   for `--PlatformVersion`; the template's default is older. Write the company name with its space: `VirtoCommerce`
   becomes `Virtocommerce.Foo`. `vc-module-xapi` and `vc-module-dba-xapi` add an xAPI project (step 4).

2. **Build it once.** 📁 the new module: `vc-build Compress`.

   ✅ A package appears in `artifacts/`.

3. **Add the plugin:** [S1a](./s1a-plugin-in-an-existing-module.md) from step 1, with the module's
   `src/VirtoCommerce.Foo.Web` folder.
4. **Need your own GraphQL?** The module registers its own xAPI schema: `ScopedSchemaFactory` in its services and
   `appBuilder.UseScopedSchema<…>("<scope>")` in `Module.cs` (the worked example is `vc-module-sales-rep`'s
   `Module.cs`). Plugins scaffolded with `--with-apollo` read it from `/graphql/<plugin-name>`, so give the scope the
   plugin's name.

## ✅ Done when

S1a is done: `check:plugin-module` passes with `--artifact` and `--env`.

## ⚠️ Watch out

1. **The template's default platform version is old.** `check:plugin-module` fails it; set `--PlatformVersion` to
   the floor from the start.
2. **Module id and plugin name are different things.** The module is `VirtoCommerce.Foo`; the plugin is a
   kebab-case name such as `foo`. `check:plugin-module` reads each from its own file.
3. **The module's CI must have Node** to build the plugin. The standard `module-ci.yml` sets it up, and VirtoCommerce
   updates it centrally: check that it is there, and do not edit it by hand. A module outside VirtoCommerce owns its
   CI: add Node 22 or 24 with corepack.
4. **Template 3.1002.0 fails its first restore** with `NU1903`: its MySQL project pulls a vulnerable
   `System.Security.Cryptography.Xml`, and `Directory.Build.props` treats warnings as errors. Reference a fixed
   version of that package. (The walk switched `NuGetAudit` off in a throwaway copy instead.)

---

_Walked on 2026-10-13 with `VirtoCommerce.Module.Template` 3.1002.0: step 1, then S1a steps 1–5 on the new module.
Step 2 ran in the .NET 10 SDK image, and the package installed on a local platform rendered the plugin. **Not
verified:** step 4._
