import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcInputDetails } from "@/ui-kit/components/atoms";
import { VcInput } from "@/ui-kit/components/molecules";
import type { DirectiveBinding } from "vue";

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
    // The factory's no-op stub would leave the message element empty.
    directives: {
      "html-safe": {
        mounted: (el: HTMLElement, binding: DirectiveBinding<string>) => {
          el.textContent = binding.value;
        },
      },
    },
  },
});

describe("VcInput", () => {
  // VCST-5533: VcSelect depends on this too.
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

  // VCST-5912: the error state was visual only, so assistive tech never heard about it.
  describe("aria-invalid", () => {
    it("is absent on an untouched input", () => {
      const wrapper = createWrapper();

      expect(wrapper.get("input").attributes("aria-invalid")).toBeUndefined();
    });

    it("is absent while the error state is off", () => {
      const wrapper = createWrapper({ props: { error: false, message: "Hint" } });

      expect(wrapper.get("input").attributes("aria-invalid")).toBeUndefined();
    });

    it("follows the error state", () => {
      const wrapper = createWrapper({ props: { error: true } });

      expect(wrapper.get("input").attributes("aria-invalid")).toBe("true");
    });

    it("pairs the flag with the message it describes", () => {
      const wrapper = createWrapper({ props: { error: true, message: "Enter a whole number" } });

      const input = wrapper.get("input");
      const details = wrapper.get(".vc-input-details");

      expect(input.attributes("aria-invalid")).toBe("true");
      expect(input.attributes("aria-describedby")).toBe(details.attributes("id"));
      expect(details.text()).toContain("Enter a whole number");
    });

    it.each(["false", "grammar", "spelling"])("lets the consumer-supplied %s win over the error state", (token) => {
      const wrapper = createWrapper({ props: { error: true, aria: { "aria-invalid": token } } });

      expect(wrapper.get("input").attributes("aria-invalid")).toBe(token);
    });

    // An unrecognised token means "true" per ARIA, and axe rejects it as aria-valid-attr-value.
    it.each([0, 1, "", "yes"])("collapses the unusable consumer value %j to true", (value) => {
      const wrapper = createWrapper({ props: { aria: { "aria-invalid": value } } });

      expect(wrapper.get("input").attributes("aria-invalid")).toBe("true");
    });

    it("treats a null consumer value as unset rather than as an override", () => {
      const wrapper = createWrapper({
        props: { error: true, aria: { "aria-invalid": null } },
      });

      expect(wrapper.get("input").attributes("aria-invalid")).toBe("true");
    });

    it("stays absent when neither the error state nor the consumer asks for it", () => {
      const wrapper = createWrapper({ props: { aria: { "aria-invalid": null } } });

      expect(wrapper.get("input").attributes("aria-invalid")).toBeUndefined();
    });
  });
});
