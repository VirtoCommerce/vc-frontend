import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { maxQuantity } from "../utils";
import CopyAndPaste from "./copy-and-paste.vue";

function mountCopyAndPaste() {
  return mount(CopyAndPaste, {
    props: { loading: false },
    global: {
      stubs: { VcWidget: { template: "<div><slot /></div>" }, VcTextarea: true, VcButton: true },
      directives: { htmlSafe: {} },
      mocks: { $t: (key: string) => key },
    },
  });
}

async function submit(text: string) {
  const wrapper = mountCopyAndPaste();
  wrapper.findComponent({ name: "VcTextarea" }).vm.$emit("update:modelValue", text);
  await wrapper.vm.$nextTick();
  const addToCartButton = wrapper.findAllComponents({ name: "VcButton" }).at(1);
  addToCartButton?.vm.$emit("click");
  return wrapper;
}

describe("CopyAndPaste", () => {
  it("emits addToCart with one item per SKU-quantity pair, ignoring whitespace around commas and between pairs", async () => {
    const wrapper = await submit("  SKU-1 , 2\n\n sku_2,\t3  \n");

    expect(wrapper.emitted("error")).toBeUndefined();
    expect(wrapper.emitted("addToCart")).toEqual([
      [
        [
          { productSku: "SKU-1", quantity: 2 },
          { productSku: "sku_2", quantity: 3 },
        ],
      ],
    ]);
  });

  it("caps the quantity at the bulk order maximum", async () => {
    const wrapper = await submit("a,999999999");

    expect(wrapper.emitted("addToCart")).toEqual([[[{ productSku: "a", quantity: maxQuantity }]]]);
  });

  it.each(["", "   ", "a", "a,", ",1", "a;1", "a,1.5", "a,1b,2", "a,12,3", "a,1234567890", "a b,1"])(
    "emits error and no items for %j",
    async (text) => {
      const wrapper = await submit(text);

      expect(wrapper.emitted("error")).toHaveLength(1);
      expect(wrapper.emitted("addToCart")).toBeUndefined();
    },
  );
});
