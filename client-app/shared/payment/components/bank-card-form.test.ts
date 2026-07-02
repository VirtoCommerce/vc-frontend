import {
  render,
  fireEvent,
  cleanup,
  waitForElementToBeRemoved as _waitForElementToBeRemoved,
} from "@testing-library/vue";
import { vMaska } from "maska/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VcInput, VcButton, VcInputDetails, VcLabel } from "@/ui-kit/components";
import BankCardForm from "./bank-card-form.vue";
import type { RenderResult } from "@testing-library/vue";
import type { DirectiveBinding } from "vue";
import type { ComponentProps } from "vue-component-type-helpers";
import "@testing-library/jest-dom/vitest";

vi.mock("vue-i18n", () => {
  return {
    useI18n: vi.fn().mockReturnValue({
      t: (key: string) => key,
      te: (key: string) => key,
    }),
  };
});

const CARD_NUMBER_LABEL = "shared.payment.bank_card_form.number_label";
const EXPIRATION_FIELD_LABEL = "shared.payment.bank_card_form.expiration_date_label";
const SECURITY_CODE_LABEL = "shared.payment.bank_card_form.security_code_label";
const ERROR_MESSAGES = {
  MONTH: "shared.payment.bank_card_form.errors.month",
  MONTH_INCOMPLETE: "shared.payment.bank_card_form.month_label must be exactly 2 characters",
  YEAR_INCOMPLETE: "shared.payment.bank_card_form.year_label must be exactly 2 characters",
  CVV_3: "shared.payment.bank_card_form.security_code_label must be exactly 3 characters",
  CVV_4: "shared.payment.bank_card_form.security_code_label must be exactly 4 characters",
} as const;

async function findElementByText(text: string) {
  return await renderedComponent.findByText(text);
}
function queryElementByText(text: string) {
  return renderedComponent.queryByText(text);
}
function getExpirationInput() {
  return renderedComponent.getByLabelText<HTMLInputElement>(EXPIRATION_FIELD_LABEL);
}
function getCardNumberInput() {
  return renderedComponent.getByLabelText<HTMLInputElement>(CARD_NUMBER_LABEL);
}
function getSecurityCodeInput() {
  return renderedComponent.getByLabelText<HTMLInputElement>(SECURITY_CODE_LABEL);
}

async function waitForElementToBeRemoved(selector: string) {
  return await _waitForElementToBeRemoved(() => renderedComponent.queryByText(selector));
}

let renderedComponent: RenderResult;

describe("BankCardForm", () => {
  const renderComponent = (props = {} as Partial<ComponentProps<typeof BankCardForm>>) => {
    return render(BankCardForm, {
      props: {
        modelValue: {
          number: "",
          cardholderName: "",
          month: "",
          year: "",
          securityCode: "",
        },
        ...props,
      },
      global: {
        components: {
          VcInput,
          VcButton,
          VcInputDetails,
          VcLabel,
        },
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          VcIcon: true,
          VcTooltip: true,
        },
        directives: {
          maska: vMaska,
          "html-safe": {
            mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
              el.textContent = binding.value;
            },
            updated(el: HTMLElement, binding: DirectiveBinding<string>) {
              el.textContent = binding.value;
            },
          },
        },
      },
    });
  };

  beforeEach(() => {
    renderedComponent = renderComponent();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Card Number Field", () => {
    it("should format input with spaces every 4 digits", async () => {
      const input = getCardNumberInput();

      await fireEvent.update(input, "1111");
      expect(input.value).toBe("1111");

      await fireEvent.update(input, "11111");
      expect(input.value).toBe("1111 1");

      await fireEvent.update(input, "111111111111");
      expect(input.value).toBe("1111 1111 1111");
    });

    it("should not allow non-numeric characters", async () => {
      const input = getCardNumberInput();

      await fireEvent.update(input, "123a");
      expect(input.value).toBe("123");

      await fireEvent.update(input, "123/");
      expect(input.value).toBe("123");
    });
  });

  describe("Expiration Date Field", () => {
    describe("Formatting", () => {
      it("should format input as MM/YY while typing", async () => {
        const input = getExpirationInput();

        await fireEvent.update(input, "12");
        expect(input.value).toBe("12");

        await fireEvent.update(input, "122");
        expect(input.value).toBe("12 / 2");

        await fireEvent.update(input, "1223");
        expect(input.value).toBe("12 / 23");
      });

      it("should handle backspace correctly", async () => {
        const input = getExpirationInput();

        // Type full date then erase
        await fireEvent.update(input, "1223");
        expect(input.value).toBe("12 / 23");

        await fireEvent.update(input, "122");
        expect(input.value).toBe("12 / 2");

        await fireEvent.update(input, "12");
        expect(input.value).toBe("12");

        await fireEvent.update(input, "1");
        expect(input.value).toBe("1");
      });

      it("should limit input to 4 digits (MMYY -> MM / YY)", async () => {
        const input = getExpirationInput();

        await fireEvent.update(input, "123456");
        // 1234 -> 12 / 34. 56 ignored due to mask length
        expect(input.value).toBe("12 / 34");
      });
    });

    describe("Validation", () => {
      it("should show error for invalid month (00-12)", async () => {
        const input = getExpirationInput();

        // Invalid months
        await fireEvent.update(input, "0");
        expect(await findElementByText(ERROR_MESSAGES.MONTH_INCOMPLETE)).toBeVisible();

        await fireEvent.update(input, "00");
        expect(await findElementByText(ERROR_MESSAGES.MONTH)).toBeVisible();

        await fireEvent.update(input, "13");
        expect(await findElementByText(ERROR_MESSAGES.MONTH)).toBeVisible();

        // Valid months
        await fireEvent.update(input, "01");
        await waitForElementToBeRemoved(ERROR_MESSAGES.MONTH);
        expect(queryElementByText(ERROR_MESSAGES.MONTH)).not.toBeInTheDocument();

        await fireEvent.update(input, "12");
        expect(queryElementByText(ERROR_MESSAGES.MONTH)).not.toBeInTheDocument();
      });

      it("should show error for incomplete input", async () => {
        const input = getExpirationInput();

        // Single digit
        await fireEvent.update(input, "1");
        expect(await findElementByText(ERROR_MESSAGES.MONTH_INCOMPLETE)).toBeInTheDocument();

        // Month only
        await fireEvent.update(input, "12");
        expect(await findElementByText(ERROR_MESSAGES.YEAR_INCOMPLETE)).toBeInTheDocument();

        // Month and partial year
        await fireEvent.update(input, "122");
        expect(await findElementByText(ERROR_MESSAGES.YEAR_INCOMPLETE)).toBeInTheDocument();
      });
    });
  });

  // VCST-5344: the CVV length must be validated per detected card brand. Amex (prefix 34/37)
  // requires a 4-digit CVV; all other brands require exactly 3. The previous brand-agnostic
  // rule (min 3 / max 4) accepted both lengths for any brand, letting a malformed CVV enable
  // Place order and create an unpaid ghost order before Accept.js rejected it downstream.
  describe("Security Code Field (per-brand CVV)", () => {
    const AMEX_NUMBER = "370000000000002";
    const VISA_NUMBER = "4007000000027";

    async function fillBrandAndCvv(cardNumber: string, cvv: string) {
      await fireEvent.update(getCardNumberInput(), cardNumber);
      await fireEvent.update(getSecurityCodeInput(), cvv);
    }

    it("should reject a 3-digit CVV on an Amex card (needs 4)", async () => {
      await fillBrandAndCvv(AMEX_NUMBER, "123");
      expect(await findElementByText(ERROR_MESSAGES.CVV_4)).toBeInTheDocument();
    });

    it("should clamp the CVV mask to 3 digits on a Visa card (cannot over-type a 4-digit CVV)", async () => {
      const cvvInput = getSecurityCodeInput();
      await fireEvent.update(getCardNumberInput(), VISA_NUMBER);
      await fireEvent.update(cvvInput, "1234");
      // The brand-conditional mask truncates the 4th digit so a Visa CVV can never exceed 3.
      expect(cvvInput.value).toBe("123");
    });

    it("should reject a 2-digit CVV on a Visa card (needs exactly 3)", async () => {
      await fillBrandAndCvv(VISA_NUMBER, "12");
      expect(await findElementByText(ERROR_MESSAGES.CVV_3)).toBeInTheDocument();
    });

    it("should accept a 4-digit CVV on an Amex card", async () => {
      await fillBrandAndCvv(AMEX_NUMBER, "1234");
      expect(queryElementByText(ERROR_MESSAGES.CVV_3)).not.toBeInTheDocument();
      expect(queryElementByText(ERROR_MESSAGES.CVV_4)).not.toBeInTheDocument();
    });

    it("should accept a 3-digit CVV on a Visa card", async () => {
      await fillBrandAndCvv(VISA_NUMBER, "123");
      expect(queryElementByText(ERROR_MESSAGES.CVV_3)).not.toBeInTheDocument();
      expect(queryElementByText(ERROR_MESSAGES.CVV_4)).not.toBeInTheDocument();
    });
  });
});
