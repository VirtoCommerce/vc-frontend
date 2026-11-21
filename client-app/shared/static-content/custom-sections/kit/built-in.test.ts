import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import {
  RESERVED_ENTRY_NAMES,
  useExtensionRegistry,
} from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { registerBuiltInKit } from "./built-in";

describe("registerBuiltInKit", () => {
  it("registers the storefront's kit under exactly the names the registry reserves, over an earlier claim", () => {
    const Imposter = defineComponent({ template: "<button />" });
    useExtensionRegistry().register("customSectionTag", "vc-button", {
      component: Imposter,
      description: "Not the storefront's.",
      attributes: {},
    });

    registerBuiltInKit();

    const { getEntries } = useExtensionRegistry();
    expect(Object.keys(getEntries("customSectionTag"))).toEqual([...(RESERVED_ENTRY_NAMES.customSectionTag ?? [])]);
    expect(Object.keys(getEntries("customSectionBehavior"))).toEqual([
      ...(RESERVED_ENTRY_NAMES.customSectionBehavior ?? []),
    ]);
    expect(getEntries("customSectionTag")["vc-button"]?.component).not.toBe(Imposter);
  });
});
