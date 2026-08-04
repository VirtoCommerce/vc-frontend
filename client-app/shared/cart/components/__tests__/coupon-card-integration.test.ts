import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcInputDetails } from "@/ui-kit/components/atoms";
import { VcInput } from "@/ui-kit/components/molecules";
import CouponCard from "../coupon-card.vue";

/**
 * VCST-5533: coupon-card.test.ts stubs VcInput, so it proves what the card *passes down* but not
 * that the attributes survive VcInput itself — the `aria` prop is spread before `aria-describedby`
 * is bound explicitly, which is exactly where a value can get dropped. Mount the real VcInput here
 * and assert against the rendered <input>.
 */
const createWrapper = createWrapperFactory(mount, CouponCard, {
  global: {
    components: { VcInput, VcInputDetails },
    stubs: { VcLabel: true, VcIcon: true, VcButton: true, VcTooltip: true },
  },
});

describe("CouponCard + real VcInput", () => {
  it("lands aria-labelledby on the real input, pointing at the visible name", () => {
    const wrapper = createWrapper({ props: { custom: true, view: "default", modelValue: "" } });

    const nameId = wrapper.get(".coupon-card__name").attributes("id");
    expect(nameId).toBeTruthy();
    expect(wrapper.get("input").attributes("aria-labelledby")).toBe(nameId);
  });

  it("lands aria-invalid and aria-describedby on the real input when the code is rejected", () => {
    const wrapper = createWrapper({
      props: { custom: true, view: "error", error: "This code is not valid", modelValue: "BAD" },
    });

    const errorId = wrapper.get(".coupon-card__error").attributes("id");
    const input = wrapper.get("input");
    expect(errorId).toBeTruthy();
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("aria-describedby")).toBe(errorId);
  });

  it("leaves the real input unmarked when there is no error", () => {
    const wrapper = createWrapper({ props: { custom: true, view: "default", modelValue: "SAVE10" } });

    const input = wrapper.get("input");
    expect(input.attributes("aria-invalid")).toBeUndefined();
    expect(input.attributes("aria-describedby")).toBeUndefined();
  });

  it("keeps every referenced id resolvable to a rendered element", () => {
    const wrapper = createWrapper({
      props: { custom: true, view: "error", error: "This code is not valid", modelValue: "BAD" },
    });

    const input = wrapper.get("input");
    const ids = [
      ...(input.attributes("aria-labelledby") ?? "").split(" "),
      ...(input.attributes("aria-describedby") ?? "").split(" "),
    ].filter(Boolean);

    expect(ids.length).toBeGreaterThan(0);
    ids.forEach((id) => {
      expect(wrapper.find(`#${id}`).exists()).toBe(true);
    });
  });
});
