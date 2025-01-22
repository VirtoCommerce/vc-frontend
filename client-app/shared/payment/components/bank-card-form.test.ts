/* eslint-disable */

import { screen } from "@testing-library/vue";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { VcInput, VcButton, VcInputDetails } from "@/ui-kit/components";
import BankCardForm from "./bank-card-form.vue";
import "@testing-library/jest-dom/vitest";

vi.mock("vue-i18n", () => {
  return {
    useI18n: vi.fn().mockReturnValue({
      t: (key: string) => key,
      te: (key: string) => key,
    }),
  };
});

describe("BankCardForm", () => {
  const createWrapper = (props = {}) => {
    return mount(BankCardForm, {
      props: {
        modelValue: {
          expirationDate: "",
        },
        ...props,
      },
      global: {
        components: {
          VcInput,
          VcButton,
          VcInputDetails,
        },
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          VcLabel: true,
          VcIcon: true,
          VcTooltip: true,
        },
        directives: {
          maska: true,
          "html-safe": {
            mounted(el, binding) {
              el.innerHTML = binding.value;
            },
          },
        },
      },
    });
  };

  describe("Expiration Date Field", () => {
    const getExpirationInput = (wrapper: ReturnType<typeof createWrapper>) => {
      return wrapper.find('[data-test-id="expiration-date-input"]');
    };

    describe("Formatting", () => {
      it("should format input as MM/YY while typing", async () => {
        const wrapper = createWrapper();
        const input = getExpirationInput(wrapper);

        await input.setValue("12");
        expect(input.element.value).toBe("12 / ");

        await input.setValue("1223");
        expect(input.element.value).toBe("12 / 23");
      });

      it("should handle backspace correctly", async () => {
        const wrapper = createWrapper();
        const input = getExpirationInput(wrapper);

        // Type full date then erase
        await input.setValue("1223");
        expect(input.element.value).toBe("12 / 23");

        await input.setValue("122");
        expect(input.element.value).toBe("12 / 2");

        await input.setValue("12");
        expect(input.element.value).toBe("12");

        await input.setValue("1");
        expect(input.element.value).toBe("1");
      });

      // TODO: Fix the component to pass the test
      it.skip("should not allow non-numeric input", async () => {
        const wrapper = createWrapper();
        const input = getExpirationInput(wrapper);

        await input.setValue("ab");
        expect(input.element.value).toBe("");

        await input.setValue("12ab34");
        expect(input.element.value).toBe("12 / 34");
      });

      it("should limit input to 4 digits", async () => {
        const wrapper = createWrapper();
        const input = getExpirationInput(wrapper);

        await input.setValue("123456");
        expect(input.element.value).toBe("12 / 34");
      });
    });

    describe("Validation", () => {
      it.only("should show error for invalid month (00-12)", async () => {
        const wrapper = createWrapper();
        const input = getExpirationInput(wrapper);

        // Invalid months
        await input.setValue("00");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await flushPromises();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await flushPromises();
        console.log(wrapper.html());
        expect(screen.queryByText("shared.payment.authorize_net.errors.month")).toBeInTheDocument();

        await input.setValue("13");
        expect(await screen.findByText("shared.payment.authorize_net.errors.month")).toBeInTheDocument();

        // Valid months
        await input.setValue("01");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(screen.queryByText("shared.payment.authorize_net.errors.month")).not.toBeInTheDocument();
        await input.setValue("12");
        expect(screen.queryByText("shared.payment.authorize_net.errors.month")).not.toBeInTheDocument();
      });

      it("should show error for past dates", async () => {
        const wrapper = createWrapper();
        const input = getExpirationInput(wrapper);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const lastYear = String(currentYear - 1).padStart(2, "0");

        // Past year
        await input.setValue(`12/${lastYear}`);
        expect(wrapper.find('[data-test="expiration-date-error"]').text()).toBe(
          "Expiration date cannot be in the past",
        );
      });

      it("should show error for current year but past month", async () => {
        const wrapper = createWrapper();
        const input = getExpirationInput(wrapper);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        const lastMonth = String(currentMonth - 1).padStart(2, "0");
        const currentYearStr = String(currentYear).padStart(2, "0");

        // Past month in current year
        await input.setValue(`${lastMonth}/${currentYearStr}`);
        expect(wrapper.find('[data-test="expiration-date-error"]').text()).toBe(
          "Expiration date cannot be in the past",
        );
      });

      it("should show error for incomplete input", async () => {
        const wrapper = createWrapper();
        const input = getExpirationInput(wrapper);

        // Single digit
        await input.setValue("1");
        expect(wrapper.find('[data-test="expiration-date-error"]').text()).toBe("Incomplete date");

        // Month only
        await input.setValue("12");
        expect(wrapper.find('[data-test="expiration-date-error"]').text()).toBe("Incomplete date");

        // Month and partial year
        await input.setValue("12/2");
        expect(wrapper.find('[data-test="expiration-date-error"]').text()).toBe("Incomplete date");
      });
    });

    describe("Form Integration", () => {
      it("should update form model value when expiration date changes", async () => {
        const wrapper = createWrapper();
        const input = getExpirationInput(wrapper);

        await input.setValue("1223");
        expect(wrapper.emitted("update:modelValue")?.[0][0]).toEqual({
          expirationDate: "12/23",
        });
      });

      it("should disable form submission when expiration date is invalid", async () => {
        const wrapper = createWrapper();
        const input = getExpirationInput(wrapper);
        const submitButton = wrapper.find('[data-test="submit-button"]');

        // Invalid date
        await input.setValue("00/23");
        expect(submitButton.attributes("disabled")).toBeDefined();

        // Valid date
        await input.setValue("12/23");
        expect(submitButton.attributes("disabled")).toBeUndefined();
      });

      it("should preserve other form fields when updating expiration date", async () => {
        const wrapper = createWrapper({
          modelValue: {
            expirationDate: "",
            cardNumber: "4111111111111111",
            cvv: "123",
          },
        });
        const input = getExpirationInput(wrapper);

        await input.setValue("1223");
        expect(wrapper.emitted("update:modelValue")?.[0][0]).toEqual({
          expirationDate: "12/23",
          cardNumber: "4111111111111111",
          cvv: "123",
        });
      });
    });

    describe("Edge Cases", () => {
      it("should handle pasted values", async () => {
        const wrapper = createWrapper();
        const input = getExpirationInput(wrapper);

        // Pasting with slash
        await input.setValue("12/23");
        expect(input.element.value).toBe("12/23");

        // Pasting without slash
        await input.setValue("1223");
        expect(input.element.value).toBe("12/23");

        // Pasting with extra characters
        await input.setValue("12/23/25");
        expect(input.element.value).toBe("12/23");
      });

      it("should handle rapid input changes", async () => {
        const wrapper = createWrapper();
        const input = getExpirationInput(wrapper);

        await input.setValue("1");
        await input.setValue("12");
        await input.setValue("122");
        await input.setValue("1223");

        expect(input.element.value).toBe("12/23");
        expect(wrapper.emitted("update:modelValue")?.length).toBe(4);
      });
    });
  });
});
