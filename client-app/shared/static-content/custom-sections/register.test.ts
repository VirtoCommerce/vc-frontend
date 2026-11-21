import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, effectScope, nextTick } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { registerCustomSections } from "./register";
import type { ICustomSectionType } from "@/core/theme-snapshot";
import type { EffectScope } from "vue";

const flag = vi.hoisted(() => ({ isEnabled: true }));

vi.mock("@/core/theme-snapshot/enabled", () => ({ isSiteBuilderEnabled: () => flag.isEnabled }));

const TYPE: ICustomSectionType = {
  format: 1,
  name: "Stats",
  schema: { settings: [] },
  template: "<section></section>",
  css: "",
};

function getSectionTypes(): string[] {
  return Object.keys(useExtensionRegistry().getEntries("pageBuilderSection"));
}

describe("registerCustomSections", () => {
  let scope: EffectScope;

  function register(): void {
    scope.run(() => registerCustomSections());
  }

  beforeEach(() => {
    scope = effectScope();
    flag.isEnabled = true;
    useThemeSnapshot().setDraft(undefined);
    getSectionTypes().forEach((type) => useExtensionRegistry().unregister("pageBuilderSection", type));
  });

  afterEach(() => {
    scope.stop();
  });

  it("registers the theme's custom types as they come and unregisters them as they go", async () => {
    register();
    const { setDraft } = useThemeSnapshot();

    setDraft({ customSections: { "custom-stats": TYPE, "custom-hero": TYPE } });
    await nextTick();
    expect(getSectionTypes()).toEqual(expect.arrayContaining(["custom-hero", "custom-stats"]));
    expect(getSectionTypes()).toHaveLength(2);

    setDraft({ customSections: { "custom-hero": TYPE } });
    await nextTick();
    expect(getSectionTypes()).toEqual(["custom-hero"]);
  });

  it("registers no type whose name breaks the naming rule", async () => {
    register();

    useThemeSnapshot().setDraft({ customSections: { hero: TYPE, "custom-Hero": TYPE, "custom-x": TYPE } });
    await nextTick();

    expect(getSectionTypes()).toEqual(["custom-x"]);
  });

  it("keeps a component someone else registered for the type", async () => {
    const OwnSection = defineComponent({ template: "<div />" });
    useExtensionRegistry().register("pageBuilderSection", "custom-own", { component: OwnSection });
    register();

    useThemeSnapshot().setDraft({ customSections: { "custom-own": TYPE } });
    await nextTick();
    useThemeSnapshot().setDraft({ customSections: {} });
    await nextTick();

    expect(useExtensionRegistry().getEntries("pageBuilderSection")["custom-own"]?.component).toBe(OwnSection);
  });

  it("does nothing without Site Builder", async () => {
    flag.isEnabled = false;
    register();

    useThemeSnapshot().setDraft({ customSections: { "custom-stats": TYPE } });
    await nextTick();

    expect(getSectionTypes()).toEqual([]);
  });
});
