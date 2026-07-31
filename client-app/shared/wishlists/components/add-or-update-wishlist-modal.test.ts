/* The ui-kit stubs below are deliberately minimal test doubles, not shippable components — emit validators and
   component-block padding would only add noise to them. */
/* eslint-disable vue/require-emit-validator, vue/padding-lines-in-component-definition */
import { render, fireEvent, cleanup, configure } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { WishlistScopeType } from "@/core/api/graphql/types";
import AddOrUpdateWishlistModal from "./add-or-update-wishlist-modal.vue";
import type { WishlistType } from "@/core/api/graphql/types";
import type { RenderResult } from "@testing-library/vue";
import "@testing-library/jest-dom/vitest";

// The app tags elements with `data-test-id`, not Testing Library's default `data-testid`.
configure({ testIdAttribute: "data-test-id" });

const KEY = "shared.wishlists.add_or_update_wishlist_modal";

const mocks = await vi.hoisted(async () => {
  const { ref: reactiveRef } = await import("vue");

  return {
    createWishlist: vi.fn(),
    updateWishlist: vi.fn(),
    sendCommunication: vi.fn(),
    customerOptions: reactiveRef<{ organizationId: string; organizationName: string }[]>([]),
    isSalesRepUser: vi.fn(() => true),
    isCorporateMember: reactiveRef(true),
    notifications: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
    copy: vi.fn(),
  };
});

// The warning codes the Sales Rep locale actually ships (see modules/sales-rep/locales/en.json). Anything else must
// be treated as untranslatable, which is what a newly-added backend code looks like to a not-yet-updated storefront.
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

// `t` echoes the key (plus interpolation params) so assertions read as the copy contract, not the English wording.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, named?: Record<string, unknown>) => (named ? `${key}|${JSON.stringify(named)}` : key),
    te: (key: string) => translatedWarningKeys.includes(key),
  }),
}));

vi.mock("@vueuse/core", () => ({
  useClipboard: () => ({ copy: mocks.copy, isSupported: ref(true) }),
}));

vi.mock("../composables/useWishlists", () => ({
  useWishlists: () => ({ createWishlist: mocks.createWishlist, updateWishlist: mocks.updateWishlist }),
}));

vi.mock("@/modules/sales-rep/composables/useSalesRepCommunication", () => ({
  useSalesRepCommunication: () => ({ sendCommunication: mocks.sendCommunication }),
}));

vi.mock("@/modules/sales-rep/composables/useSalesRepCustomerOptions", () => ({
  useSalesRepCustomerOptions: () => ({ options: mocks.customerOptions }),
}));

vi.mock("@/modules/sales-rep/composables/useSalesRepsConfig", () => ({
  isSalesRepUser: mocks.isSalesRepUser,
}));

vi.mock("@/shared/account/composables", () => ({
  useUser: () => ({ isCorporateMember: mocks.isCorporateMember }),
}));

vi.mock("@/shared/notification", () => ({ useNotifications: () => mocks.notifications }));

/**
 * The ui-kit widgets are replaced with native controls: the tests are about this modal's sharing logic, and the
 * kit's own dropdown/teleport behaviour is covered where it lives.
 */
const VcModal = defineComponent({
  props: { title: { type: String, default: "" } },
  emits: ["close"],
  setup(_, { slots, emit }) {
    const close = () => emit("close");
    return () => [slots.default?.(), slots.actions?.({ close })];
  },
});

const VcInput = defineComponent({
  props: { modelValue: { type: String, default: "" }, testIdInput: { type: String, default: "" } },
  emits: ["update:modelValue"],
  setup(props, { emit, slots }) {
    return () => [
      h("input", {
        "data-test-id": props.testIdInput,
        value: props.modelValue,
        onInput: (event: Event) => emit("update:modelValue", (event.target as HTMLInputElement).value),
      }),
      slots.append?.(),
    ];
  },
});

const VcTextarea = defineComponent({
  props: { modelValue: { type: String, default: "" } },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("textarea", {
        value: props.modelValue,
        onInput: (event: Event) => emit("update:modelValue", (event.target as HTMLTextAreaElement).value),
      });
  },
});

const VcSelect = defineComponent({
  props: {
    modelValue: { type: String, default: "" },
    items: { type: Array as () => Record<string, string>[], default: () => [] },
    textField: { type: String, default: "" },
    valueField: { type: String, default: "" },
    message: { type: String, default: "" },
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
            onChange: (event: Event) => emit("update:modelValue", (event.target as HTMLSelectElement).value),
          },
          [
            h("option", { value: "" }),
            ...props.items.map((item) =>
              h("option", { key: item[props.valueField], value: item[props.valueField] }, item[props.textField]),
            ),
          ],
        ),
        props.message ? h("span", props.message) : null,
      ]);
  },
});

const VcCheckbox = defineComponent({
  props: { modelValue: { type: Boolean, default: false } },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("input", {
        type: "checkbox",
        checked: props.modelValue,
        onChange: (event: Event) => emit("update:modelValue", (event.target as HTMLInputElement).checked),
      });
  },
});

const VcButton = defineComponent({
  props: { disabled: { type: Boolean, default: false }, loading: { type: Boolean, default: false } },
  setup(props, { slots }) {
    return () => h("button", { disabled: props.disabled }, slots.default?.());
  },
});

const VcLabel = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h("label", slots.default?.()),
});

let component: RenderResult;

function renderModal(list?: WishlistType) {
  component = render(AddOrUpdateWishlistModal, {
    props: { list },
    global: {
      components: { VcModal, VcInput, VcTextarea, VcSelect, VcCheckbox, VcButton, VcLabel },
      mocks: { $t: (key: string) => key },
      stubs: { VcIcon: true },
    },
  });

  return component;
}

function scopeSelect() {
  return component.getByTestId<HTMLSelectElement>("wishlist-sharing-scope-select");
}

function customerSelect() {
  return component.getByTestId<HTMLSelectElement>("wishlist-share-customer-select");
}

function shareMessageInput() {
  return component.getByTestId<HTMLTextAreaElement>("wishlist-share-message-input");
}

function saveButton() {
  return component.getByTestId<HTMLElement>("wishlist-settings-save-button").closest("button")!;
}

function channelCheckboxes() {
  return {
    email: component.getByTestId<HTMLInputElement>("wishlist-share-email-checkbox"),
    push: component.getByTestId<HTMLInputElement>("wishlist-share-push-checkbox"),
  };
}

/** A list already published to `sharedWithId`, as returned by the wishlist queries. */
function customerScopedList(sharedWithId: string): WishlistType {
  return {
    id: "list-1",
    name: "Spring assortment",
    description: "",
    sharingSetting: {
      id: "sharing-key-1",
      scope: WishlistScopeType.Customer,
      sharedWithId,
      isOwner: true,
    },
  } as WishlistType;
}

async function pickCustomer(organizationId: string) {
  await fireEvent.update(customerSelect(), organizationId);
}

async function selectCustomerScope() {
  await fireEvent.update(scopeSelect(), WishlistScopeType.Customer);
}

const SUCCESS = { succeeded: true, pushSent: true, emailSent: true, warnings: [] };

beforeEach(() => {
  mocks.createWishlist.mockReset().mockResolvedValue("list-new");
  mocks.updateWishlist.mockReset().mockResolvedValue(undefined);
  mocks.sendCommunication.mockReset().mockResolvedValue(SUCCESS);
  mocks.isSalesRepUser.mockReset().mockReturnValue(true);
  mocks.isCorporateMember.value = true;
  mocks.customerOptions.value = [
    { organizationId: "org-1", organizationName: "Acme Inc." },
    { organizationId: "org-2", organizationName: "Globex" },
  ];
  Object.values(mocks.notifications).forEach((spy) => spy.mockReset());
});

afterEach(() => {
  cleanup();
});

describe("AddOrUpdateWishlistModal — customer sharing scope", () => {
  describe("scope availability", () => {
    it("offers the Customer scope to a Sales Rep", () => {
      renderModal();

      expect(scopeSelect()).toContainHTML(`value="${WishlistScopeType.Customer}"`);
    });

    it("hides the Customer scope when the caller is not a Sales Rep", () => {
      mocks.isSalesRepUser.mockReturnValue(false);

      renderModal();

      expect(scopeSelect()).not.toContainHTML(`value="${WishlistScopeType.Customer}"`);
    });

    it("still shows the Customer scope of an already-shared list to a non-rep, so saving cannot overwrite it", () => {
      mocks.isSalesRepUser.mockReturnValue(false);

      renderModal(customerScopedList("org-1"));

      expect(scopeSelect()).toContainHTML(`value="${WishlistScopeType.Customer}"`);
      // The rep-only controls stay hidden for them.
      expect(component.queryByTestId("wishlist-share-customer-select")).toBeNull();
    });
  });

  describe("saving the sharing target", () => {
    it("passes the chosen organization as sharedWithId when creating", async () => {
      renderModal();

      await fireEvent.update(component.getByTestId("wishlist-name-input"), "Spring assortment");
      await selectCustomerScope();
      await pickCustomer("org-1");
      await fireEvent.click(saveButton());

      expect(mocks.createWishlist).toHaveBeenCalledOnce();
      expect(mocks.createWishlist.mock.calls[0][0]).toMatchObject({
        listName: "Spring assortment",
        scope: WishlistScopeType.Customer,
        sharedWithId: "org-1",
      });
    });

    it("omits sharedWithId for the non-targeted scopes", async () => {
      renderModal();

      await fireEvent.update(component.getByTestId("wishlist-name-input"), "Internal picks");
      await fireEvent.update(scopeSelect(), WishlistScopeType.Organization);
      await fireEvent.click(saveButton());

      expect(mocks.createWishlist.mock.calls[0][0]).toMatchObject({
        scope: WishlistScopeType.Organization,
        sharedWithId: undefined,
      });
      expect(mocks.sendCommunication).not.toHaveBeenCalled();
    });

    it("enables Save when only the customer changed, which the form schema cannot see", async () => {
      renderModal(customerScopedList("org-1"));

      // Nothing touched yet: the form is pristine and the target is unchanged.
      expect(saveButton()).toBeDisabled();

      await pickCustomer("org-2");

      expect(saveButton()).toBeEnabled();
    });

    it("keeps Save disabled when the customer is re-selected back to the persisted one", async () => {
      renderModal(customerScopedList("org-1"));

      await pickCustomer("org-2");
      await pickCustomer("org-1");

      expect(saveButton()).toBeDisabled();
    });
  });

  describe("notifying the customer", () => {
    async function shareWith(organizationId: string, list?: WishlistType) {
      renderModal(list);

      if (!list) {
        await fireEvent.update(component.getByTestId("wishlist-name-input"), "Spring assortment");
        await selectCustomerScope();
      }

      await pickCustomer(organizationId);

      return component;
    }

    it("sends on both channels by default, with a generated title and the default body plus the link", async () => {
      await shareWith("org-1");
      await fireEvent.click(saveButton());

      expect(mocks.sendCommunication).toHaveBeenCalledOnce();

      const command = mocks.sendCommunication.mock.calls[0][0] as {
        organizationId: string;
        sendEmail: boolean;
        sendPush: boolean;
        title: string;
        message: string;
      };

      expect(command.organizationId).toBe("org-1");
      expect(command.sendEmail).toBe(true);
      expect(command.sendPush).toBe(true);
      expect(command.title).toBe(`${KEY}.share_default_title`);
      // Default body carries the list name; the link is always appended so the customer can reach the list.
      expect(command.message).toContain(`${KEY}.share_default_message|{"listName":"Spring assortment"}`);
      expect(command.message).toContain("/shared-list/");
    });

    it("uses the rep's own text instead of the default body, still appending the link", async () => {
      await shareWith("org-1");
      await fireEvent.update(shareMessageInput(), "New season is live, take a look.");
      await fireEvent.click(saveButton());

      const { message } = mocks.sendCommunication.mock.calls[0][0] as { message: string };

      expect(message).toContain("New season is live, take a look.");
      expect(message).not.toContain(`${KEY}.share_default_message`);
      expect(message).toContain("/shared-list/");
    });

    it("honours the channel checkboxes", async () => {
      await shareWith("org-1");
      await fireEvent.click(channelCheckboxes().email);
      await fireEvent.click(saveButton());

      expect(mocks.sendCommunication.mock.calls[0][0]).toMatchObject({ sendEmail: false, sendPush: true });
    });

    it("saves without notifying when the rep clears both channels", async () => {
      await shareWith("org-1");
      const { email, push } = channelCheckboxes();
      await fireEvent.click(email);
      await fireEvent.click(push);
      await fireEvent.click(saveButton());

      expect(mocks.createWishlist).toHaveBeenCalledOnce();
      expect(mocks.sendCommunication).not.toHaveBeenCalled();
    });

    it("does not re-notify when the target is unchanged", async () => {
      renderModal(customerScopedList("org-1"));

      await fireEvent.update(component.getByTestId("wishlist-name-input"), "Spring assortment 2026");
      await fireEvent.click(saveButton());

      expect(mocks.updateWishlist).toHaveBeenCalledOnce();
      expect(mocks.sendCommunication).not.toHaveBeenCalled();
      // The messaging controls are not even offered for an edit that keeps the same customer.
      expect(component.queryByTestId("wishlist-share-message-input")).toBeNull();
    });

    it("warns that the previous customer loses access when the target is replaced", async () => {
      renderModal(customerScopedList("org-1"));

      expect(component.queryByText(`${KEY}.share_replace_hint`)).toBeNull();

      await pickCustomer("org-2");

      expect(component.getByText(`${KEY}.share_replace_hint`)).toBeInTheDocument();
    });

    it("does not hint about a replacement on a list that had no customer yet", async () => {
      await shareWith("org-1");

      expect(component.queryByText(`${KEY}.share_replace_hint`)).toBeNull();
    });
  });

  describe("delivery outcome", () => {
    it("reports success once the list is saved and both channels are delivered", async () => {
      renderModal(customerScopedList("org-1"));
      await pickCustomer("org-2");
      await fireEvent.click(saveButton());

      expect(mocks.notifications.success).toHaveBeenCalledOnce();
      expect(mocks.notifications.success.mock.calls[0][0]).toMatchObject({ text: `${KEY}.share_success` });
    });

    it("localizes the backend warning codes through the Sales Rep mapping on partial delivery", async () => {
      mocks.sendCommunication.mockResolvedValue({ ...SUCCESS, emailSent: false, warnings: ["EmailUnavailable"] });

      renderModal(customerScopedList("org-1"));
      await pickCustomer("org-2");
      await fireEvent.click(saveButton());

      expect(mocks.notifications.warning).toHaveBeenCalledOnce();
      expect(mocks.notifications.warning.mock.calls[0][0].text).toContain(
        "sales_rep.communication.warnings.EmailUnavailable",
      );
    });

    it("states the partial delivery once for a warning code it cannot translate", async () => {
      mocks.sendCommunication.mockResolvedValue({ ...SUCCESS, warnings: ["SomethingBrandNew"] });

      renderModal(customerScopedList("org-1"));
      await pickCustomer("org-2");
      await fireEvent.click(saveButton());

      // Exact match: an untranslatable code must not append a second copy of the summary sentence.
      expect(mocks.notifications.warning.mock.calls[0][0]).toMatchObject({ text: `${KEY}.share_partial` });
    });

    it("keeps the nothing-was-sent wording even when the reason cannot be translated", async () => {
      mocks.sendCommunication.mockResolvedValue({
        succeeded: false,
        pushSent: false,
        emailSent: false,
        warnings: ["SomethingBrandNew"],
      });

      renderModal(customerScopedList("org-1"));
      await pickCustomer("org-2");
      await fireEvent.click(saveButton());

      // Must not degrade into "shared, but not every notification was delivered" — nothing was delivered at all.
      expect(mocks.notifications.warning.mock.calls[0][0]).toMatchObject({ text: `${KEY}.share_notify_error` });
    });

    it("warns rather than errors when the list saved but nothing could be sent", async () => {
      mocks.sendCommunication.mockResolvedValue({ succeeded: false, pushSent: false, emailSent: false, warnings: [] });

      renderModal(customerScopedList("org-1"));
      await pickCustomer("org-2");
      await fireEvent.click(saveButton());

      expect(mocks.updateWishlist).toHaveBeenCalledOnce();
      expect(mocks.notifications.error).not.toHaveBeenCalled();
      expect(mocks.notifications.warning.mock.calls[0][0]).toMatchObject({ text: `${KEY}.share_notify_error` });
    });

    it("surfaces a save error and does not notify when the mutation fails", async () => {
      mocks.updateWishlist.mockRejectedValue(new Error("boom"));

      renderModal(customerScopedList("org-1"));
      await pickCustomer("org-2");
      await fireEvent.click(saveButton());

      expect(mocks.notifications.error).toHaveBeenCalledOnce();
      expect(mocks.notifications.error.mock.calls[0][0]).toMatchObject({ text: `${KEY}.save_error` });
      expect(mocks.sendCommunication).not.toHaveBeenCalled();
    });
  });
});
