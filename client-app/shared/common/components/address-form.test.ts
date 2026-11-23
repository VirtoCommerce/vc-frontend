import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import AddressForm from "./address-form.vue";

// Mirrors the VcInput props the form binds: the value, the message under the input and the input's test id
const VcInputStub = defineComponent({
  props: {
    modelValue: { type: String, default: "" },
    message: { type: String, default: "" },
    testIdInput: { type: String, default: "" },
  },

  emits: { "update:modelValue": (value: string) => typeof value === "string" },

  template: `
    <div :data-test-id="testIdInput">
      <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
      <span data-test-id="message">{{ message }}</span>
    </div>`,
});

function mountAddressForm() {
  return mount(AddressForm, {
    props: {
      withPersonalInfo: true,
      modelValue: {
        isDefault: false,
        isFavorite: false,
        firstName: "Jane2",
        lastName: "Doe",
        countryCode: "USA",
        postalCode: "10001",
        line1: "1 Main St",
      },
    },
    slots: {
      append: `<template #append="{ valid }"><span data-test-id="valid">{{ valid }}</span></template>`,
    },
    global: {
      stubs: { VcInput: VcInputStub, VcSelect: true, VcTextarea: true },
      mocks: { $t: (key: string) => key },
    },
  });
}

describe("AddressForm", () => {
  // A rejected save comes back as messages by field name. They read like the form's own errors: the input shows
  // the message and the form is invalid until the input is edited.
  it("shows the server's message on its input until the input is edited", async () => {
    const wrapper = mountAddressForm();
    const firstName = wrapper.find("[data-test-id='first-name-input']");

    await wrapper.setProps({ serverErrors: { firstName: "Contains invalid characters" } });
    await flushPromises();

    expect(firstName.find("[data-test-id='message']").text()).toBe("Contains invalid characters");
    expect(wrapper.find("[data-test-id='valid']").text()).toBe("false");

    await firstName.find("input").setValue("Jane");
    await flushPromises();

    expect(firstName.find("[data-test-id='message']").text()).toBe("");
    expect(wrapper.find("[data-test-id='valid']").text()).toBe("true");
  });
});
