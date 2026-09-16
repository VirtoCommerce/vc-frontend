import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
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

  // Chrome matches :focus-visible on a text input even for a mouse click, so the shared focus ring
  // would show on click for a read-only field (a select trigger). The modality flag is what keeps
  // the ring keyboard-only there; these pin the flag, the CSS reads it. The modality is
  // document-wide, so each case sets it explicitly instead of relying on the previous one.
  describe("focus modality", () => {
    it("marks pointer-driven focus", async () => {
      const wrapper = createWrapper({ props: { readonly: true } });

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
      await nextTick();

      expect(wrapper.classes()).not.toContain("vc-input--pointer-focus");

      document.dispatchEvent(new PointerEvent("pointerdown"));
      await nextTick();

      expect(wrapper.classes()).toContain("vc-input--pointer-focus");
    });

    it("drops the mark as soon as a key is pressed", async () => {
      const wrapper = createWrapper({ props: { readonly: true } });

      document.dispatchEvent(new PointerEvent("pointerdown"));
      await nextTick();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
      await nextTick();

      expect(wrapper.classes()).not.toContain("vc-input--pointer-focus");
    });

    // The hole a per-component flag left: clicking an option blurs the field, and the focus a
    // closing dropdown hands back is programmatic, so a local reset would ring for a mouse user.
    it("keeps the mark across a blur, since the pointer is still what is driving", async () => {
      const wrapper = createWrapper({ props: { readonly: true } });

      document.dispatchEvent(new PointerEvent("pointerdown"));
      await nextTick();
      await wrapper.get("input").trigger("blur");

      expect(wrapper.classes()).toContain("vc-input--pointer-focus");
      expect(wrapper.emitted("blur")).toHaveLength(1);
    });
  });
});
