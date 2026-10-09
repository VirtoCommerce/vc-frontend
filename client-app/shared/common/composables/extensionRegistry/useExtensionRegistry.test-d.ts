import { describe, expectTypeOf, it } from "vitest";
import { defineComponent } from "vue";
import { useExtensionRegistry } from "./useExtensionRegistry";
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";

const { register, registerContribution } = useExtensionRegistry();

const Widget = defineComponent({ template: "<span />" });

describe("register", () => {
  it("takes a component for any category, and refuses a contribution", () => {
    expectTypeOf(register).parameter(0).toEqualTypeOf<ExtensionCategoryType>();

    register("accountMenu", "name", { component: Widget });
    register("mobileMenu", "name", { component: Widget });

    // @ts-expect-error -- a contribution goes through registerContribution
    register("mobileMenu", "name", { use: () => ({ count: 1 }) });
  });
});

describe("registerContribution", () => {
  it("takes only a category that declared a contributed shape — today, mobileMenu", () => {
    expectTypeOf(registerContribution).parameter(0).toEqualTypeOf<"mobileMenu">();

    registerContribution("mobileMenu", "name", { use: () => ({ count: 1 }) });

    // @ts-expect-error -- accountMenu declares no contributed shape, so nothing would read this
    registerContribution("accountMenu", "name", { use: () => ({ count: 1 }) });
  });

  it("cannot be reached through a widened category", () => {
    const category = "accountMenu" as ExtensionCategoryType;

    expectTypeOf(category).not.toEqualTypeOf<"mobileMenu">();

    // @ts-expect-error -- the whole union is not a decorate-capable category
    registerContribution(category, "name", { use: () => ({ count: 1 }) });
  });

  it("takes only the shape the category declared", () => {
    expectTypeOf<Parameters<typeof registerContribution<"mobileMenu">>[2]>().toExtend<{ use: unknown }>();

    registerContribution("mobileMenu", "name", { use: () => ({}) });

    // @ts-expect-error -- mobileMenu contributes a count, not a label
    registerContribution("mobileMenu", "name", { use: () => ({ label: "x" }) });
  });
});
