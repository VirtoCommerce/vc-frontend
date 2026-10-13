import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { ref } from "vue";
import SignInCodeInput from "./sign-in-code-input.vue";

function mountInput() {
  const code = ref("");
  const wrapper = mount(SignInCodeInput, {
    props: {
      inputId: "code",
      length: 6,
      modelValue: code.value,
      "onUpdate:modelValue": (value: string) => {
        code.value = value;
        void wrapper.setProps({ modelValue: value });
      },
    },
  });

  return { wrapper, code };
}

async function paste(wrapper: ReturnType<typeof mountInput>["wrapper"], text: string) {
  await wrapper.find("input").trigger("paste", { clipboardData: { getData: () => text } });
}

describe("SignInCodeInput", () => {
  it("keeps only the digits that are typed, up to the code length", async () => {
    const { wrapper, code } = mountInput();

    await wrapper.find("input").setValue("12a3-4567");

    expect(code.value).toBe("123456");
  });

  it("drops a typed non-digit from the field", async () => {
    const { wrapper, code } = mountInput();
    const input = wrapper.find("input");

    await input.setValue("12");
    await input.setValue("12a");

    expect(code.value).toBe("12");
    expect((input.element as HTMLInputElement).value).toBe("12");
  });

  it.each([
    ["123456", "123456"],
    ["123 456", "123456"],
    ["Your code: 654321", "654321"],
    ["Valid 10 min: 123456", "123456"],
  ])("takes the code from the pasted text %j", async (text, expected) => {
    const { wrapper, code } = mountInput();

    await paste(wrapper, text);

    expect(code.value).toBe(expected);
  });

  it("ignores a paste without digits", async () => {
    const { wrapper, code } = mountInput();

    await paste(wrapper, "no digits");

    expect(code.value).toBe("");
  });

  it("shows the digits in the cells", async () => {
    const { wrapper } = mountInput();

    await wrapper.find("input").setValue("12");

    const cells = wrapper.findAll(".sign-in-code-input__cell").map((cell) => cell.text());
    expect(cells).toEqual(["1", "2", "", "", "", ""]);
  });

  it("marks the cell of the next digit while focused, and the last cell once the code is complete", async () => {
    const { wrapper } = mountInput();
    const input = wrapper.find("input");
    const activeCells = () =>
      wrapper.findAll(".sign-in-code-input__cell").map((cell) => cell.classes("sign-in-code-input__cell--active"));

    await input.trigger("focus");
    await input.setValue("12");
    expect(activeCells()).toEqual([false, false, true, false, false, false]);

    await input.setValue("123456");
    expect(activeCells()).toEqual([false, false, false, false, false, true]);

    await input.trigger("blur");
    expect(activeCells()).not.toContain(true);
  });
});
