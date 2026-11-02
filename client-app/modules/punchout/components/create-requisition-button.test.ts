import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { usePunchoutRequisition } from "../composables/usePunchoutRequisition";
import CreateRequisitionButton from "./create-requisition-button.vue";
import ProceedTo from "@/shared/checkout/components/proceed-to.vue";

const { createPunchoutRequisition, submitPunchoutOrderMessage, notificationsError } = vi.hoisted(() => ({
  createPunchoutRequisition: vi.fn(),
  submitPunchoutOrderMessage: vi.fn(),
  notificationsError: vi.fn(),
}));

// Real English messages, so the specs check the text the buyer reads
vi.mock("vue-i18n", async () => {
  const { createI18n } = await vi.importActual<typeof import("vue-i18n")>("vue-i18n");
  const en = await vi.importActual<typeof import("../locales/en.json")>("../locales/en.json");
  const i18n = createI18n({ locale: "en", legacy: false, messages: { en }, missingWarn: false });
  return { useI18n: () => ({ t: i18n.global.t }) };
});

vi.mock("@/core/utilities", () => ({
  Logger: { error: vi.fn() },
}));

vi.mock("@/shared/cart", () => ({
  useFullCart: () => ({ hasOnlyUnselectedLineItems: ref(false) }),
}));

vi.mock("@/shared/checkout", () => ({
  useCheckoutSections: () => ({ hasIncompleteSections: ref(false) }),
}));

vi.mock("@/shared/notification", () => ({
  useNotifications: () => ({ error: notificationsError }),
}));

// Same props as the real ProceedTo, whose @click falls through to its root button, disabled while loading
vi.mock("@/shared/checkout/components/proceed-to.vue", async () => {
  const { defineComponent, h } = await import("vue");

  return {
    default: defineComponent({
      name: "ProceedTo",
      props: { disabled: Boolean, loading: Boolean, to: [String, Object], testId: String },

      setup(props, { slots }) {
        return () =>
          h("button", { "data-test-id": props.testId, disabled: props.disabled || props.loading }, slots.default?.());
      },
    }),
  };
});

vi.mock("../api/graphql", () => ({ createPunchoutRequisition }));

vi.mock("../utils/submitPunchoutOrderMessage", () => ({ submitPunchoutOrderMessage }));

const ORDER_MESSAGE = { url: "https://procurement.example/receive", formField: "cxml-urlencoded", cxml: "<cXML />" };

const FALLBACK_TEXT = "Could not create the requisition. Please try again.";
const SESSION_EXPIRED_TEXT =
  "Your punchout session has expired. Return to your procurement system and start a new session.";
const SESSION_RETURNED_TEXT = "Requisition already sent.";

function mountButton() {
  return mount(CreateRequisitionButton, {
    global: { mocks: { $t: (key: string) => key } },
  });
}

async function clickButton(wrapper: ReturnType<typeof mountButton>) {
  await wrapper.findComponent(ProceedTo).trigger("click");
  await flushPromises();
}

function isBusy(wrapper: ReturnType<typeof mountButton>) {
  return wrapper.findComponent(ProceedTo).props("loading") as boolean;
}

enableAutoUnmount(afterEach);

describe("create requisition button", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePunchoutRequisition().setSubmitting(false);
  });

  it("posts the order message and keeps the button busy on success", async () => {
    createPunchoutRequisition.mockResolvedValue({ ...ORDER_MESSAGE, errorCode: null });
    const wrapper = mountButton();

    await clickButton(wrapper);

    expect(submitPunchoutOrderMessage).toHaveBeenCalledExactlyOnceWith(ORDER_MESSAGE);
    expect(notificationsError).not.toHaveBeenCalled();
    expect(isBusy(wrapper)).toBe(true);
  });

  it("disables every button instance while one request is pending", async () => {
    createPunchoutRequisition.mockReturnValue(new Promise(() => {}));
    // The cart renders the button in the order summary and in the sticky bar
    const summaryButton = mountButton();
    const stickyBarButton = mountButton();

    await clickButton(summaryButton);

    expect(isBusy(stickyBarButton)).toBe(true);
    expect(stickyBarButton.find("button").attributes("disabled")).toBeDefined();

    await clickButton(stickyBarButton);

    expect(createPunchoutRequisition).toHaveBeenCalledOnce();
  });

  it.each([
    ["SessionExpired", SESSION_EXPIRED_TEXT],
    ["SessionReturned", SESSION_RETURNED_TEXT],
  ])("shows the message of the known error code %s and re-enables the button", async (errorCode, text) => {
    createPunchoutRequisition.mockResolvedValue({ errorCode });
    const wrapper = mountButton();

    await clickButton(wrapper);

    expect(submitPunchoutOrderMessage).not.toHaveBeenCalled();
    expect(notificationsError).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ text }));
    expect(isBusy(wrapper)).toBe(false);
  });

  it.each(["INVALID_CART", "toString"])(
    "shows the fallback message for the unknown error code %s",
    async (errorCode) => {
      createPunchoutRequisition.mockResolvedValue({ errorCode });
      const wrapper = mountButton();

      await clickButton(wrapper);

      expect(submitPunchoutOrderMessage).not.toHaveBeenCalled();
      expect(notificationsError).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ text: FALLBACK_TEXT }));
      expect(isBusy(wrapper)).toBe(false);
    },
  );

  it("does not post the order message when the response carries an error code next to the cXML", async () => {
    createPunchoutRequisition.mockResolvedValue({ ...ORDER_MESSAGE, errorCode: "INVALID_CART" });
    const wrapper = mountButton();

    await clickButton(wrapper);

    expect(submitPunchoutOrderMessage).not.toHaveBeenCalled();
    expect(notificationsError).toHaveBeenCalledOnce();
    expect(isBusy(wrapper)).toBe(false);
  });

  it("shows the error toast and does not post the order message when the response has no cXML", async () => {
    createPunchoutRequisition.mockResolvedValue({ url: ORDER_MESSAGE.url, formField: ORDER_MESSAGE.formField });
    const wrapper = mountButton();

    await clickButton(wrapper);

    expect(submitPunchoutOrderMessage).not.toHaveBeenCalled();
    expect(notificationsError).toHaveBeenCalledOnce();
    expect(isBusy(wrapper)).toBe(false);
  });

  it("shows the error toast and re-enables the button when the request throws", async () => {
    createPunchoutRequisition.mockRejectedValue(new Error("network"));
    const wrapper = mountButton();

    await clickButton(wrapper);

    expect(submitPunchoutOrderMessage).not.toHaveBeenCalled();
    expect(notificationsError).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ text: FALLBACK_TEXT }));
    expect(isBusy(wrapper)).toBe(false);
  });
});
