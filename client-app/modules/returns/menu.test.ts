import { flushPromises, mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { menuItems } from "./menu";
import VcIcon from "@/ui-kit/components/atoms/icon/vc-icon.vue";

// Same name as the "Request return" button's prepend-icon (components/request-return-button.vue).
const REQUEST_RETURN_BUTTON_ICON = "receipt-refund";

const menuIcons = [
  ...(menuItems.header?.desktop?.purchasing?.children ?? []),
  ...(menuItems.header?.mobile?.purchasing?.children ?? []),
].map((item) => item?.icon);

describe("Returns icons", () => {
  it.each([...new Set([...menuIcons, REQUEST_RETURN_BUTTON_ICON])])(
    "renders %s as an outline (Lucide) icon, like the other account menu items",
    async (name) => {
      const wrapper = mount(VcIcon, { props: { name } });
      await flushPromises();

      expect(wrapper.classes()).toContain("vc-icon--outline");
    },
  );
});
