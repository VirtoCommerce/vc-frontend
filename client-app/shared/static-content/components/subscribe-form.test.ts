import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import SubscribeForm from "./subscribe-form.vue";

describe("SubscribeForm", () => {
  it("sanitizes the checkbox text HTML", () => {
    const wrapper = mount(SubscribeForm, {
      props: { checkboxText: 'I agree to the <a href="/terms" onclick="alert(1)">terms</a><script>alert(1)</script>' },
      global: { stubs: { VcInput: true, VcButton: true, VcCheckbox: { template: "<label><slot /></label>" } } },
    });

    expect(wrapper.find(".checkbox-label").html()).toBe(
      '<span class="checkbox-label">I agree to the <a href="/terms">terms</a></span>',
    );
  });
});
