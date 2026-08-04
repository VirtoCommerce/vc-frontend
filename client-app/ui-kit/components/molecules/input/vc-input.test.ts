import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcInputDetails } from "@/ui-kit/components/atoms";
import { VcInput } from "@/ui-kit/components/molecules";

const createWrapper = createWrapperFactory(mount, VcInput, {
  global: {
    components: {
      VcInputDetails,
    },
    stubs: {
      VcLabel: true,
      VcIcon: true,
      VcButton: true,
      VcTooltip: true,
    },
  },
});

describe("VcInput", () => {
  // VCST-5533: `aria-describedby` is bound explicitly after `v-bind="{ ...aria }"`, so it used to
  // override — and silently drop — any value passed through the `aria` prop. VcSelect relies on
  // exactly that to describe its own error message, so the drop was a real, shipped defect.
  describe("aria-describedby", () => {
    it("keeps a consumer-supplied description id", () => {
      const wrapper = createWrapper({
        props: { aria: { "aria-describedby": "external-error" } },
      });

      expect(wrapper.get("input").attributes("aria-describedby")).toBe("external-error");
    });

    it("merges the consumer-supplied id with the internal details id", () => {
      const wrapper = createWrapper({
        props: { message: "Too short", aria: { "aria-describedby": "external-error" } },
      });

      const describedBy = wrapper.get("input").attributes("aria-describedby")!.split(" ");
      const detailsId = wrapper.get(".vc-input-details").attributes("id");

      expect(detailsId).toBeTruthy();
      expect(describedBy).toContain(detailsId);
      expect(describedBy).toContain("external-error");
    });

    it("references the details element when only a message is set", () => {
      const wrapper = createWrapper({ props: { message: "Too short" } });

      const detailsId = wrapper.get(".vc-input-details").attributes("id");
      expect(wrapper.get("input").attributes("aria-describedby")).toBe(detailsId);
    });

    it("is absent when there is nothing to describe", () => {
      const wrapper = createWrapper();

      expect(wrapper.get("input").attributes("aria-describedby")).toBeUndefined();
    });

    it("every referenced id resolves to a rendered element", () => {
      const wrapper = createWrapper({
        props: { message: "Too short", counter: true, maxlength: 10 },
      });

      const describedBy = wrapper.get("input").attributes("aria-describedby")!.split(" ");
      describedBy.forEach((id) => {
        expect(wrapper.find(`#${id}`).exists()).toBe(true);
      });
    });
  });
});
