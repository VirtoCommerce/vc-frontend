import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/ui-kit/test-mocks/wrapper-factory";
import VcChip from "./vc-chip.vue";

const createWrapper = createWrapperFactory(mount, VcChip);

enableAutoUnmount(afterEach);

describe("VcChip", () => {
  it("falls back to the default size for an unknown size instead of rendering unstyled", () => {
    // @ts-expect-error a size the kit no longer ships, e.g. from an old story or theme settings
    const wrapper = createWrapper({ props: { size: "xs" } });

    expect(wrapper.classes()).toContain("vc-chip--size--md");
    expect(wrapper.classes()).not.toContain("vc-chip--size--xs");
  });
});
