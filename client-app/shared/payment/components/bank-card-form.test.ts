import {
  render,
  fireEvent,
  cleanup,
  waitForElementToBeRemoved as _waitForElementToBeRemoved,
} from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VcInput, VcButton, VcInputDetails, VcLabel } from "@/ui-kit/components";
import BankCardForm from "./bank-card-form.vue";
import type { RenderResult } from "@testing-library/vue";
import "@testing-library/jest-dom/vitest";
import type { DirectiveBinding } from "vue";
import type { ComponentProps } from "vue-component-type-helpers";

vi.mock("vue-i18n", () => {
  return {
    useI18n: vi.fn().mockReturnValue({
      t: (key: string) => key,
      te: (key: string) => key,
    }),
  };
});

const EXPIRATION_FIELD_LABEL = "shared.payment.bank_card_form.expiration_date_label";
const ERROR_MESSAGES = {
  MONTH: "shared.payment.authorize_net.errors.month",
  MONTH_INCOMPLETE: "shared.payment.bank_card_form.month_label must be exactly 2 characters",
  YEAR_INCOMPLETE: "shared.payment.bank_card_form.year_label must be exactly 2 characters",
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

  // describe other fields and general form cases

  describe("Expiration Date Field", () => {
    describe("Formatting", () => {
      it("should format input as MM/YY while typing", async () => {
        const input = getExpirationInput();

        await fireEvent.update(input, "12");
        expect(input.value).toBe("12 / ");

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

      it.skip("should not allow non-numeric input", async () => {
        const input = getExpirationInput();

        await fireEvent.update(input, "ab");
        expect(input.value).toBe("");

        await fireEvent.update(input, "12ab34");
        expect(input.value).toBe("12 / 34");
      });

      it("should limit input to 4 digits", async () => {
        const input = getExpirationInput();

        await fireEvent.update(input, "123456");
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
        await fireEvent.update(input, "12/2");
        expect(await findElementByText(ERROR_MESSAGES.YEAR_INCOMPLETE)).toBeInTheDocument();
      });
    });
  });
});
