import { cleanup, render, waitFor } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { authorizePayment, initializeCartPayment, initializePayment } from "@/core/api/graphql";
import { useCardSavingRequirement } from "../composables/useCardSavingRequirement";
import { usePayment } from "../composables/usePayment";
import PaymentProcessingAuthorizeNet from "./payment-processing-authorize-net.vue";
import type { CartType, CustomerOrderType, PaymentType } from "@/core/api/graphql/types";
import "@testing-library/jest-dom/vitest";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/core/api/graphql", () => ({
  authorizePayment: vi.fn(),
  initializeCartPayment: vi.fn(),
  initializePayment: vi.fn(),
}));

vi.mock("@/core/composables/useAnalytics", () => ({
  useAnalytics: () => ({ analytics: vi.fn() }),
}));

vi.mock("@/shared/account/composables/useUser", async () => {
  const { ref: vueRef } = await import("vue");
  return { useUser: () => ({ isAuthenticated: vueRef(true) }) };
});

vi.mock("../composables/useSavedPaymentMethods", () => ({
  useSavedPaymentMethods: () => ({ fetch: vi.fn().mockResolvedValue(undefined), methodsFor: () => [] }),
}));

// Accept.js: loads at once and tokenizes any card into the same nonce.
vi.mock("@/shared/payment/composables/useAuthorizeNet", async () => {
  const graphql = await import("@/core/api/graphql");
  return {
    useAuthorizeNet: () => ({
      loadAcceptJS: vi.fn().mockResolvedValue(undefined),
      dispatchData: (_data: unknown, handler: (response: unknown) => void) =>
        handler({
          messages: { resultCode: "Ok", message: [] },
          opaqueData: { dataDescriptor: "COMMON.ACCEPT.INAPP.PAYMENT", dataValue: "nonce" },
        }),
      sendOpaqueData: (payload: {
        orderId: string;
        paymentId: string;
        opaqueData: { dataDescriptor: string; dataValue: string };
        additionalParameters: { key: string; value: string }[];
      }) =>
        graphql.authorizePayment({
          orderId: payload.orderId,
          paymentId: payload.paymentId,
          parameters: [
            { key: "dataValue", value: payload.opaqueData.dataValue },
            { key: "dataDescriptor", value: payload.opaqueData.dataDescriptor },
            ...payload.additionalParameters,
          ],
        }),
    }),
  };
});

// The card fields are their own component: here they report a valid card at once.
const BankCardFormStub = defineComponent({
  emits: { "update:valid": (value: boolean) => typeof value === "boolean" },

  setup(_props, { emit }) {
    emit("update:valid", true);
    return () => h("div");
  },
});

const VcCheckboxStub = defineComponent({
  props: { modelValue: Boolean, disabled: Boolean, testId: { type: String, default: undefined } },
  emits: { "update:modelValue": (value: boolean) => typeof value === "boolean" },

  setup(props, { slots, emit }) {
    return () =>
      h("label", [
        h("input", {
          type: "checkbox",
          checked: props.modelValue,
          disabled: props.disabled,
          "data-test-id": props.testId,
          onChange: (event: Event) => emit("update:modelValue", (event.target as HTMLInputElement).checked),
        }),
        slots.default?.(),
      ]);
  },
});

const cart = { id: "cart-1" } as CartType;
const payment = { id: "payment-1" } as PaymentType;
const order = { id: "order-1", shoppingCartId: "cart-1", inPayments: [{ id: "order-payment-1" }] } as CustomerOrderType;

function renderForm(props: { cart?: CartType; payment?: PaymentType; order?: CustomerOrderType } = { cart, payment }) {
  return render(PaymentProcessingAuthorizeNet, {
    props: { ...props, hidePaymentButton: true },
    global: {
      stubs: {
        BankCardForm: BankCardFormStub,
        CardLabels: true,
        PaymentPolicies: true,
        SavedCardPicker: true,
        VcCheckbox: VcCheckboxStub,
        VcButton: true,
        VcLoaderWithText: true,
      },
      mocks: { $t: (key: string) => key },
    },
  });
}

describe("PaymentProcessingAuthorizeNet", () => {
  // called as methods: a bare `require(...)` reads as a CommonJS import to the dependency check
  const cardSaving = useCardSavingRequirement();

  beforeEach(() => {
    sessionStorage.clear();
    const initialized = {
      isSuccess: true,
      paymentActionType: "PreparedForm",
      publicParameters: [
        { key: "acceptJsPath", value: "https://example.test/accept.js" },
        { key: "apiLogin", value: "login" },
        { key: "clientKey", value: "key" },
      ],
    };
    vi.mocked(initializeCartPayment).mockResolvedValue(initialized);
    vi.mocked(initializePayment).mockResolvedValue(initialized);
    vi.mocked(authorizePayment).mockResolvedValue({ isSuccess: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // Single-page checkout: the card form is shown first, the subscription terms are accepted below it afterwards.
  it("follows a card-saving requirement given after the form is shown", async () => {
    const { container, findByText, queryByText } = renderForm();
    const checkbox = () => container.querySelector<HTMLInputElement>('[data-test-id="authorize-net-save-card"]');

    await waitFor(() => expect(checkbox()).not.toBeNull());
    expect(checkbox()).not.toBeChecked();
    expect(checkbox()).toBeEnabled();
    expect(queryByText("shared.payment.saved_cards.save_card_required")).toBeNull();

    cardSaving.require("consent-1", cart.id);
    await nextTick();

    expect(await findByText("shared.payment.saved_cards.save_card_required")).toBeInTheDocument();
    expect(checkbox()).toBeChecked();
    expect(checkbox()).toBeDisabled();

    await usePayment().finalizePayment(order);

    expect(authorizePayment).toHaveBeenCalledWith({
      orderId: "order-1",
      paymentId: "order-payment-1",
      parameters: expect.arrayContaining([
        { key: "storeForFutureUse", value: "true" },
        { key: "consentId", value: "consent-1" },
      ]) as unknown,
    });
  });

  it("shows the save-card checkbox ticked and disabled while a requirement covers the paid order", async () => {
    cardSaving.require("consent-1", "cart-1");
    const { container, findByText } = renderForm({ order });
    const checkbox = () => container.querySelector<HTMLInputElement>('[data-test-id="authorize-net-save-card"]');

    await waitFor(() => expect(checkbox()).not.toBeNull());
    expect(checkbox()).toBeChecked();
    expect(checkbox()).toBeDisabled();
    expect(await findByText("shared.payment.saved_cards.save_card_required")).toBeInTheDocument();
  });

  it("clears the requirement after a payment that carried it, and keeps one it did not use", async () => {
    cardSaving.require("consent-1", "cart-2");
    const first = renderForm();
    await waitFor(() =>
      expect(first.container.querySelector('[data-test-id="authorize-net-save-card"]')).not.toBeNull(),
    );

    await usePayment().finalizePayment(order);
    expect(cardSaving.read({ cart: { id: "cart-2" } })?.consentId).toBe("consent-1");
    first.unmount();

    cardSaving.require("consent-1", cart.id);
    const second = renderForm();
    await waitFor(() =>
      expect(second.container.querySelector('[data-test-id="authorize-net-save-card"]')).not.toBeNull(),
    );

    await usePayment().finalizePayment(order);
    expect(cardSaving.read({ cart })).toBeUndefined();
  });

  it("asks nothing and sends no consent when no requirement applies", async () => {
    const { container } = renderForm();
    await waitFor(() => expect(container.querySelector('[data-test-id="authorize-net-save-card"]')).not.toBeNull());

    await usePayment().finalizePayment(order);

    const [{ parameters }] = vi.mocked(authorizePayment).mock.calls[0];
    expect(parameters).toContainEqual({ key: "storeForFutureUse", value: "false" });
    expect(parameters?.some((x) => x.key === "consentId")).toBe(false);
  });
});
