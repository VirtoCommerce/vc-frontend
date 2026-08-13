/* The ui-kit stubs below are deliberately minimal test doubles, not shippable components — emit validators and
   component-block padding would only add noise to them. */
/* eslint-disable vue/require-emit-validator, vue/padding-lines-in-component-definition */
import { render, fireEvent, cleanup, configure } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, onMounted, ref } from "vue";
import WishlistCustomerSharing from "./wishlist-customer-sharing.vue";
import type { IWishlistSharingScopeControlsType } from "@/shared/wishlists/composables/useWishlistSharingScopes";
import type { RenderResult } from "@testing-library/vue";
import "@testing-library/jest-dom/vitest";

configure({ testIdAttribute: "data-test-id" });

const KEY = "sales_rep.list_sharing";
const SHARING_LINK = "https://store.example.com/shared-list/sharing-key-1";

// What the module locale actually ships; anything else is a newly-added backend code an old storefront cannot map.
const translatedWarningKeys = await vi.hoisted(() =>
  [
    "generic",
    "NoRecipients",
    "EmailUnavailable",
    "EmailStoreAccessDenied",
    "EmailNoRecipients",
    "EmailSendFailed",
    "PushSendFailed",
  ].map((code) => `sales_rep.communication.warnings.${code}`),
);

const mocks = await vi.hoisted(async () => {
  const { ref: reactiveRef } = await import("vue");

  return {
    sendCommunication: vi.fn(),
    options: reactiveRef<{ organizationId: string; organizationName: string }[]>([]),
    loading: reactiveRef(false),
    failed: reactiveRef(false),
    notifications: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, named?: Record<string, unknown>) => (named ? `${key}|${JSON.stringify(named)}` : key),
    te: (key: string) => translatedWarningKeys.includes(key),
  }),
}));

vi.mock("../composables/useSalesRepCommunication", () => ({
  useSalesRepCommunication: () => ({ sendCommunication: mocks.sendCommunication }),
}));

vi.mock("../composables/useSalesRepCustomerOptions", () => ({
  useSalesRepCustomerOptions: () => ({
    options: mocks.options,
    loading: mocks.loading,
    failed: mocks.failed,
  }),
}));

vi.mock("@/shared/notification", () => ({ useNotifications: () => mocks.notifications }));

const VcSelect = defineComponent({
  props: {
    modelValue: { type: String, default: "" },
    items: { type: Array as () => Record<string, string>[], default: () => [] },
    textField: { type: String, default: "" },
    valueField: { type: String, default: "" },
    message: { type: String, default: "" },
    error: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    testIdDropdown: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("div", [
        h(
          "select",
          {
            "data-test-id": props.testIdDropdown,
            value: props.modelValue,
            disabled: props.disabled,
            required: props.required,
            "aria-invalid": String(props.error),
            onChange: (event: Event) => emit("update:modelValue", (event.target as HTMLSelectElement).value),
          },
          [
            h("option", { value: "" }),
            ...props.items.map((item) =>
              h("option", { key: item[props.valueField], value: item[props.valueField] }, item[props.textField]),
            ),
          ],
        ),
        props.message ? h("span", { "data-test-id": "field-message" }, props.message) : null,
      ]);
  },
});

const VcTextarea = defineComponent({
  props: { modelValue: { type: String, default: "" }, maxLength: { type: [Number, String], default: undefined } },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("textarea", {
        "data-test-id": "wishlist-share-message-input",
        value: props.modelValue,
        maxlength: props.maxLength,
        onInput: (event: Event) => emit("update:modelValue", (event.target as HTMLTextAreaElement).value),
      });
  },
});

const VcCheckbox = defineComponent({
  props: { modelValue: { type: Boolean, default: false }, testId: { type: String, default: "" } },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    // Mirrors the real component: the id lands on the input, not on a wrapper.
    return () =>
      h("div", [
        h("input", {
          type: "checkbox",
          "data-test-id": props.testId,
          checked: props.modelValue,
          onChange: (event: Event) => emit("update:modelValue", (event.target as HTMLInputElement).checked),
        }),
      ]);
  },
});

const VcLabel = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h("label", slots.default?.()),
});

let component: RenderResult;
/** Reached the way the modal reaches it — through a template ref. */
let controls: IWishlistSharingScopeControlsType;

function renderSharing(sharedWithId?: string) {
  const Host = defineComponent({
    props: {
      sharedWithId: { type: String, default: undefined },
      sharingLink: { type: String, required: true },
    },
    setup(props) {
      const inner = ref<IWishlistSharingScopeControlsType>();

      onMounted(() => {
        controls = inner.value!;
      });

      return () =>
        h(WishlistCustomerSharing, {
          ref: inner,
          sharedWithId: props.sharedWithId,
          sharingLink: props.sharingLink,
        });
    },
  });

  component = render(Host, {
    props: { sharedWithId, sharingLink: SHARING_LINK },
    global: {
      components: { VcSelect, VcTextarea, VcCheckbox, VcLabel },
      stubs: { VcIcon: true },
    },
  });

  return component;
}

function customerSelect() {
  return component.getByTestId<HTMLSelectElement>("wishlist-share-customer-select");
}

function shareMessage() {
  return component.getByTestId<HTMLTextAreaElement>("wishlist-share-message-input");
}

function channels() {
  return {
    email: component.getByTestId<HTMLInputElement>("wishlist-share-email-checkbox"),
    push: component.getByTestId<HTMLInputElement>("wishlist-share-push-checkbox"),
  };
}

const SUCCESS = { succeeded: true, pushSent: true, emailSent: true, warnings: [] as string[] };
const SAVED_CONTEXT = { listName: "Spring assortment", sharingLink: SHARING_LINK };

beforeEach(() => {
  mocks.sendCommunication.mockReset().mockResolvedValue(SUCCESS);
  mocks.options.value = [
    { organizationId: "org-1", organizationName: "Acme Inc." },
    { organizationId: "org-2", organizationName: "Globex" },
  ];
  mocks.loading.value = false;
  mocks.failed.value = false;
  Object.values(mocks.notifications).forEach((spy) => spy.mockReset());
});

afterEach(() => {
  cleanup();
});

describe("WishlistCustomerSharing", () => {
  describe("the customer picker", () => {
    it("lists the rep's served customers", () => {
      renderSharing();

      expect(customerSelect()).toContainHTML('value="org-1"');
      expect(customerSelect()).toContainHTML('value="org-2"');
    });

    it("pre-selects the customer the list is already published to", () => {
      renderSharing("org-2");

      expect(customerSelect()).toHaveValue("org-2");
    });

    it("is marked required, since the scope cannot be saved without a customer", () => {
      renderSharing();

      expect(customerSelect()).toBeRequired();
    });

    it("is disabled while the customers are still loading", () => {
      mocks.loading.value = true;

      renderSharing();

      expect(customerSelect()).toBeDisabled();
    });

    it("reports a failed load on the field instead of showing an empty dropdown", () => {
      mocks.failed.value = true;
      mocks.options.value = [];

      renderSharing();

      expect(customerSelect()).toHaveAttribute("aria-invalid", "true");
      expect(component.getByTestId("field-message")).toHaveTextContent(`${KEY}.share_customers_error`);
    });

    it("keeps a persisted target visible even when it is not among the loaded options", () => {
      // Over the cap or lost to a failed fetch: without seeding this would read as unshared.
      mocks.options.value = [{ organizationId: "org-9", organizationName: "Initech" }];

      renderSharing("org-outside-the-page");

      expect(customerSelect()).toContainHTML('value="org-outside-the-page"');
      expect(customerSelect()).toHaveValue("org-outside-the-page");
    });

    it("does not duplicate a persisted target that is already among the options", () => {
      renderSharing("org-1");

      const optionValues = [...customerSelect().querySelectorAll("option")].map((option) => option.value);
      expect(optionValues.filter((value) => value === "org-1")).toHaveLength(1);
    });

    it("warns that moving the list detaches the previous customer", async () => {
      renderSharing("org-1");

      expect(component.queryByTestId("field-message")).toBeNull();

      await fireEvent.update(customerSelect(), "org-2");

      expect(component.getByTestId("field-message")).toHaveTextContent(`${KEY}.share_replace_hint`);
    });

    it("does not warn about a replacement on a list that had no customer yet", async () => {
      renderSharing();

      await fireEvent.update(customerSelect(), "org-1");

      expect(component.queryByTestId("field-message")).toBeNull();
    });
  });

  describe("the message and channels", () => {
    it("appear only once a new customer is chosen", async () => {
      renderSharing();

      expect(component.queryByTestId("wishlist-share-message-input")).toBeNull();

      await fireEvent.update(customerSelect(), "org-1");

      expect(shareMessage()).toBeInTheDocument();
      expect(channels().email).toBeChecked();
      expect(channels().push).toBeChecked();
    });

    it("stay hidden when the list is re-opened on its current customer", () => {
      renderSharing("org-1");

      expect(component.queryByTestId("wishlist-share-message-input")).toBeNull();
    });

    it("cap the message so the appended link cannot exceed the backend limit", async () => {
      renderSharing();
      await fireEvent.update(customerSelect(), "org-1");

      expect(shareMessage()).toHaveAttribute("maxlength", String(1000 - SHARING_LINK.length - 2));
    });
  });

  describe("the contract it exposes", () => {
    it("blocks saving until a customer is chosen", async () => {
      renderSharing();

      expect(controls.canSave).toBe(false);

      await fireEvent.update(customerSelect(), "org-1");

      expect(controls.canSave).toBe(true);
    });

    it("contributes the chosen customer as sharedWithId", async () => {
      renderSharing();

      await fireEvent.update(customerSelect(), "org-1");

      expect(controls.payload).toEqual({ sharedWithId: "org-1" });
    });

    it("reports itself dirty only when the target actually changes", async () => {
      renderSharing("org-1");

      expect(controls.dirty).toBe(false);

      await fireEvent.update(customerSelect(), "org-2");
      expect(controls.dirty).toBe(true);

      await fireEvent.update(customerSelect(), "org-1");
      expect(controls.dirty).toBe(false);
    });
  });

  describe("notifying the customer after the save", () => {
    async function shareWith(organizationId: string, sharedWithId?: string) {
      renderSharing(sharedWithId);
      await fireEvent.update(customerSelect(), organizationId);
      await controls.onSaved!(SAVED_CONTEXT);
    }

    it("sends a default body carrying the list name and the link when the rep wrote nothing", async () => {
      await shareWith("org-1");

      expect(mocks.sendCommunication).toHaveBeenCalledOnce();
      const command = mocks.sendCommunication.mock.calls[0][0] as { message: string; title: string };
      expect(command.message).toContain(`${KEY}.share_default_message`);
      expect(command.message).toContain("Spring assortment");
      expect(command.message).toContain(SHARING_LINK);
      expect(command.title).toBe(`${KEY}.share_default_title`);
    });

    it("sends the rep's own text, still with the link appended", async () => {
      renderSharing();
      await fireEvent.update(customerSelect(), "org-1");
      await fireEvent.update(shareMessage(), "New season is live.");
      await controls.onSaved!(SAVED_CONTEXT);

      const command = mocks.sendCommunication.mock.calls[0][0] as { message: string };
      expect(command.message).toBe(`New season is live.\n\n${SHARING_LINK}`);
    });

    it("honours the channel checkboxes", async () => {
      renderSharing();
      await fireEvent.update(customerSelect(), "org-1");
      await fireEvent.click(channels().push);
      await controls.onSaved!(SAVED_CONTEXT);

      expect(mocks.sendCommunication.mock.calls[0][0]).toMatchObject({ sendEmail: true, sendPush: false });
    });

    it("sends nothing when both channels are cleared", async () => {
      renderSharing();
      await fireEvent.update(customerSelect(), "org-1");
      await fireEvent.click(channels().email);
      await fireEvent.click(channels().push);
      await controls.onSaved!(SAVED_CONTEXT);

      expect(mocks.sendCommunication).not.toHaveBeenCalled();
    });

    it("sends nothing when the target did not change", async () => {
      renderSharing("org-1");

      await controls.onSaved!(SAVED_CONTEXT);

      expect(mocks.sendCommunication).not.toHaveBeenCalled();
    });

    it("confirms a full delivery", async () => {
      await shareWith("org-1");

      expect(mocks.notifications.success).toHaveBeenCalledOnce();
      expect(mocks.notifications.success.mock.calls[0][0]).toMatchObject({ text: `${KEY}.share_success` });
    });

    it("names the channel that failed on a partial delivery", async () => {
      mocks.sendCommunication.mockResolvedValue({ ...SUCCESS, emailSent: false, warnings: ["EmailUnavailable"] });

      await shareWith("org-1");

      expect(mocks.notifications.warning).toHaveBeenCalledOnce();
      expect(mocks.notifications.warning.mock.calls[0][0].text).toContain(
        "sales_rep.communication.warnings.EmailUnavailable",
      );
    });

    it("states a partial delivery once for a code it cannot translate", async () => {
      mocks.sendCommunication.mockResolvedValue({ ...SUCCESS, warnings: ["SomethingBrandNew"] });

      await shareWith("org-1");

      // Exact match: an untranslatable code must not append a second copy of the summary sentence.
      expect(mocks.notifications.warning.mock.calls[0][0]).toMatchObject({ text: `${KEY}.share_partial` });
    });

    it("keeps the nothing-was-sent wording when the reason cannot be translated", async () => {
      mocks.sendCommunication.mockResolvedValue({
        succeeded: false,
        pushSent: false,
        emailSent: false,
        warnings: ["SomethingBrandNew"],
      });

      await shareWith("org-1");

      // Must not degrade into "shared, but not every notification was delivered" — nothing was delivered at all.
      expect(mocks.notifications.warning.mock.calls[0][0]).toMatchObject({ text: `${KEY}.share_notify_error` });
    });

    it("warns rather than errors when nothing could be sent, since the list itself is saved", async () => {
      mocks.sendCommunication.mockResolvedValue({
        succeeded: false,
        pushSent: false,
        emailSent: false,
        warnings: [],
      });

      await shareWith("org-1");

      expect(mocks.notifications.error).not.toHaveBeenCalled();
      expect(mocks.notifications.warning.mock.calls[0][0]).toMatchObject({ text: `${KEY}.share_notify_error` });
    });
  });
});
