/* The ui-kit stubs below are deliberately minimal test doubles, not shippable components — emit validators and
   component-block padding would only add noise to them. */
/* eslint-disable vue/require-emit-validator, vue/padding-lines-in-component-definition */
import { render, fireEvent, cleanup, configure } from "@testing-library/vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { useWishlistSharingScopes } from "../composables/useWishlistSharingScopes";
import ShareWishlistModal from "./share-wishlist-modal.vue";
import type { WishlistType } from "@/core/api/graphql/types";
import type { RenderResult } from "@testing-library/vue";
import "@testing-library/jest-dom/vitest";

// The app tags elements with `data-test-id`, not Testing Library's default `data-testid`.
configure({ testIdAttribute: "data-test-id" });

// The share dialog reuses the copy of the list-settings dialog it was split from.
const KEY = "shared.wishlists.add_or_update_wishlist_modal";

// Deliberately not the Sales Rep scope: core must not know any contributed scope by name.
const TARGETED_SCOPE = "TargetedTestScope";
const SCOPE_LABEL_KEY = "test_module.targeted_scope.label";

const mocks = await vi.hoisted(async () => {
  const { ref: reactiveRef } = await import("vue");

  return {
    updateWishlist: vi.fn(),
    fetchWishlists: vi.fn(),
    notifications: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
    logger: { error: vi.fn(), warn: vi.fn() },
    copy: vi.fn(),
    clipboardSupported: reactiveRef(true),
  };
});

// `t` echoes the key so assertions read as the copy contract.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => true }),
}));

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useClipboard: () => ({ copy: mocks.copy, isSupported: mocks.clipboardSupported }),
}));

vi.mock("../composables/useWishlists", () => ({
  useWishlists: () => ({
    updateWishlist: mocks.updateWishlist,
    fetchWishlists: mocks.fetchWishlists,
  }),
}));

vi.mock("@/shared/notification", () => ({ useNotifications: () => mocks.notifications }));

vi.mock("@/core/utilities", () => ({ Logger: mocks.logger }));

const scopeAvailable = ref(true);

const controls = {
  canSave: ref(false),
  dirty: ref(false),
  payload: ref<{ sharedWithId?: string }>({}),
  onSaved: vi.fn(),
};

// Owns state the modal cannot see and reports it through the contract — the whole point of the seam.
const ScopeControls = defineComponent({
  props: {
    sharedWithId: { type: String, default: undefined },
    sharingLink: { type: String, default: "" },
    saving: { type: Boolean, default: false },
  },
  setup(props, { expose }) {
    expose(controls);
    return () =>
      h("div", {
        "data-test-id": "scope-controls",
        "data-shared-with-id": props.sharedWithId ?? "",
        "data-sharing-link": props.sharingLink,
        "data-saving": String(props.saving),
      });
  },
});

// Native controls stand in for the ui-kit: the kit's own dropdown/teleport behaviour is covered where it lives.
const VcModal = defineComponent({
  props: { title: { type: String, default: "" }, isPersistent: { type: Boolean, default: false } },
  emits: ["close"],
  setup(props, { slots, emit }) {
    const close = () => emit("close");
    return () => [
      // Mirrors the real modal: while persistent it refuses Esc, the backdrop and its own close button.
      h("div", { "data-test-id": "modal", "data-persistent": String(props.isPersistent), "data-title": props.title }),
      slots.default?.(),
      slots.actions?.({ close }),
    ];
  },
});

const VcInput = defineComponent({
  props: {
    modelValue: { type: String, default: "" },
    testIdInput: { type: String, default: "" },
    label: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  setup(props, { emit, slots }) {
    return () => [
      props.label ? h("label", props.label) : null,
      h("input", {
        "data-test-id": props.testIdInput,
        value: props.modelValue,
        onInput: (event: Event) => emit("update:modelValue", (event.target as HTMLInputElement).value),
      }),
      slots.append?.(),
    ];
  },
});

const VcSelect = defineComponent({
  props: {
    modelValue: { type: String, default: "" },
    items: { type: Array as () => Record<string, string>[], default: () => [] },
    textField: { type: String, default: "" },
    valueField: { type: String, default: "" },
    testIdDropdown: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
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
      );
  },
});

const VcButton = defineComponent({
  props: { disabled: { type: Boolean, default: false }, loading: { type: Boolean, default: false } },
  setup(props, { slots }) {
    return () => h("button", { disabled: props.disabled }, slots.default?.());
  },
});

let component: RenderResult;

function renderModal(list: WishlistType) {
  component = render(ShareWishlistModal, {
    props: { list },
    global: {
      components: { VcModal, VcInput, VcSelect, VcButton },
      mocks: { $t: (key: string) => key },
      stubs: { VcIcon: true },
    },
  });

  return component;
}

function scopeSelect() {
  return component.getByTestId<HTMLSelectElement>("wishlist-sharing-scope-select");
}

function saveButton() {
  return component.getByTestId<HTMLElement>("wishlist-sharing-save-button").closest("button")!;
}

function cancelButton() {
  return component.getByTestId<HTMLElement>("wishlist-sharing-cancel-button").closest("button")!;
}

function privateList(): WishlistType {
  return {
    id: "list-1",
    name: "Spring assortment",
    description: "",
    sharingSetting: { id: "sharing-key-1", scope: WishlistScopeType.Private, isOwner: true },
  } as unknown as WishlistType;
}

function targetedList(sharedWithId?: string): WishlistType {
  return {
    id: "list-1",
    name: "Spring assortment",
    description: "",
    sharingSetting: { id: "sharing-key-1", scope: TARGETED_SCOPE, sharedWithId, isOwner: true },
  } as unknown as WishlistType;
}

async function selectScope(scope: string) {
  await fireEvent.update(scopeSelect(), scope);
}

beforeAll(() => {
  useWishlistSharingScopes().registerSharingScope({
    scope: TARGETED_SCOPE,
    labelKey: SCOPE_LABEL_KEY,
    statusKey: "test_module.targeted_scope.status",
    supportsLink: true,
    shoppable: true,
    isAvailable: () => scopeAvailable.value,
    element: ScopeControls,
  });
});

beforeEach(() => {
  mocks.updateWishlist.mockReset().mockResolvedValue(undefined);
  mocks.fetchWishlists.mockReset().mockResolvedValue(undefined);
  mocks.logger.error.mockReset();
  Object.values(mocks.notifications).forEach((spy) => spy.mockReset());
  scopeAvailable.value = true;
  controls.canSave.value = false;
  controls.dirty.value = false;
  controls.payload.value = {};
  controls.onSaved.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

describe("ShareWishlistModal", () => {
  it("is titled after the list it shares", () => {
    renderModal(privateList());

    expect(component.getByTestId("modal")).toHaveAttribute("data-title", "shared.wishlists.share_wishlist_modal.title");
  });

  describe("which scopes are listed", () => {
    it("always lists the scopes core owns", () => {
      renderModal(privateList());

      const select = scopeSelect();
      expect(select).toContainHTML(`value="${WishlistScopeType.Private}"`);
      expect(select).toContainHTML(`value="${WishlistScopeType.AnyoneAnonymous}"`);
      expect(select).toContainHTML(`value="${WishlistScopeType.Organization}"`);
    });

    it("lists a contributed scope, labelled from the provider's own key", () => {
      renderModal(privateList());

      expect(scopeSelect()).toContainHTML(`value="${TARGETED_SCOPE}"`);
      expect(component.getByText(SCOPE_LABEL_KEY)).toBeInTheDocument();
    });

    it("hides a contributed scope the current user may not use", () => {
      scopeAvailable.value = false;

      renderModal(privateList());

      expect(scopeSelect()).not.toContainHTML(`value="${TARGETED_SCOPE}"`);
    });

    it("still lists the scope a list already carries, so saving cannot silently rewrite it", () => {
      scopeAvailable.value = false;

      renderModal(targetedList("org-1"));

      expect(scopeSelect()).toContainHTML(`value="${TARGETED_SCOPE}"`);
    });

    it("hides the provider's controls for a user who may not use that scope", () => {
      scopeAvailable.value = false;

      renderModal(targetedList("org-1"));

      expect(component.queryByTestId("scope-controls")).toBeNull();
    });
  });

  describe("what the provider's controls receive", () => {
    it("renders them only while their scope is selected", async () => {
      renderModal(privateList());

      expect(component.queryByTestId("scope-controls")).toBeNull();

      await selectScope(TARGETED_SCOPE);

      expect(component.getByTestId("scope-controls")).toBeInTheDocument();
    });

    it("hands over the persisted target and the list's sharing link", () => {
      renderModal(targetedList("org-1"));

      const element = component.getByTestId("scope-controls");
      expect(element).toHaveAttribute("data-shared-with-id", "org-1");
      expect(element.getAttribute("data-sharing-link")).toContain("/shared-list/sharing-key-1");
    });
  });

  describe("gating Save", () => {
    it("keeps Save disabled while the provider reports incomplete input", async () => {
      renderModal(privateList());
      await selectScope(TARGETED_SCOPE);

      expect(saveButton()).toBeDisabled();
    });

    it("enables Save once the provider reports its input complete", async () => {
      renderModal(privateList());
      await selectScope(TARGETED_SCOPE);

      controls.canSave.value = true;
      await selectScope(TARGETED_SCOPE);

      expect(saveButton()).not.toBeDisabled();
    });

    it("enables Save when only the provider's own state changed", async () => {
      renderModal(targetedList("org-1"));

      expect(saveButton()).toBeDisabled();

      controls.canSave.value = true;
      controls.dirty.value = true;
      await selectScope(TARGETED_SCOPE);

      expect(saveButton()).not.toBeDisabled();
    });

    it("leaves Save disabled on an untouched list under a core scope", () => {
      renderModal(privateList());

      expect(saveButton()).toBeDisabled();
    });

    it("enables Save when a core scope is swapped for another", async () => {
      renderModal(privateList());

      await selectScope(WishlistScopeType.Organization);

      expect(saveButton()).not.toBeDisabled();
    });
  });

  describe("the primary action", () => {
    it("reads Share while a scope with recipients is selected", async () => {
      renderModal(privateList());

      await selectScope(TARGETED_SCOPE);

      expect(saveButton()).toHaveTextContent("shared.wishlists.list_card.share_button");
    });

    it("reads Save for a scope without recipients", async () => {
      renderModal(targetedList("org-1"));

      await selectScope(WishlistScopeType.Organization);

      expect(saveButton()).toHaveTextContent("common.buttons.save");
    });
  });

  describe("saving", () => {
    it("sends the scope, the key and the provider's contribution — and nothing about the name", async () => {
      controls.canSave.value = true;
      controls.dirty.value = true;
      controls.payload.value = { sharedWithId: "org-2" };

      renderModal(targetedList("org-1"));
      await selectScope(TARGETED_SCOPE);
      await fireEvent.click(saveButton());

      expect(mocks.updateWishlist).toHaveBeenCalledOnce();
      const command = mocks.updateWishlist.mock.calls[0][0];
      expect(command).toMatchObject({
        listId: "list-1",
        scope: TARGETED_SCOPE,
        sharingKey: "sharing-key-1",
        sharedWithId: "org-2",
      });
      // The rename dialog owns these; sending them from here would let a stale copy overwrite a concurrent rename.
      expect(command).not.toHaveProperty("listName");
      expect(command).not.toHaveProperty("description");
    });

    it("sends no target for a scope that contributes none", async () => {
      renderModal(targetedList("org-1"));

      await selectScope(WishlistScopeType.Private);
      await fireEvent.click(saveButton());

      expect(mocks.updateWishlist).toHaveBeenCalledOnce();
      expect(mocks.updateWishlist.mock.calls[0][0]).not.toHaveProperty("sharedWithId");
    });
  });

  describe("staying put while a write is in flight", () => {
    it("refuses dismissal and locks Cancel until the save settles", async () => {
      controls.canSave.value = true;
      controls.payload.value = { sharedWithId: "org-1" };
      let settle: () => void = () => {};
      mocks.updateWishlist.mockImplementation(() => new Promise<void>((resolve) => (settle = resolve)));

      renderModal(targetedList("org-1"));
      await selectScope(TARGETED_SCOPE);
      controls.dirty.value = true;
      await fireEvent.click(saveButton());

      // Unmounting here would null the exposed contract, dropping the follow-up without a trace.
      expect(component.getByTestId("modal")).toHaveAttribute("data-persistent", "true");
      expect(cancelButton()).toBeDisabled();

      settle();

      // The save awaits the follow-up and the list refresh before releasing, so poll rather than count ticks.
      await vi.waitFor(() => expect(component.getByTestId("modal")).toHaveAttribute("data-persistent", "false"));
      expect(cancelButton()).not.toBeDisabled();
    });

    it("leaves Cancel usable when nothing is being written", () => {
      renderModal(targetedList("org-1"));

      expect(component.getByTestId("modal")).toHaveAttribute("data-persistent", "false");
      expect(cancelButton()).not.toBeDisabled();
    });
  });

  describe("the provider's follow-up after a save", () => {
    it("runs once the list is persisted, with the list's name and the sharing link", async () => {
      controls.canSave.value = true;
      controls.payload.value = { sharedWithId: "org-1" };

      renderModal(privateList());
      await selectScope(TARGETED_SCOPE);
      await fireEvent.click(saveButton());

      expect(controls.onSaved).toHaveBeenCalledOnce();
      expect(controls.onSaved.mock.calls[0][0]).toMatchObject({ listName: "Spring assortment" });
      expect(controls.onSaved.mock.calls[0][0].sharingLink).toContain("/shared-list/sharing-key-1");
    });

    it("does not run when the list itself failed to save", async () => {
      controls.canSave.value = true;
      mocks.updateWishlist.mockRejectedValue(new Error("boom"));

      renderModal(privateList());
      await selectScope(TARGETED_SCOPE);
      await fireEvent.click(saveButton());

      expect(controls.onSaved).not.toHaveBeenCalled();
      expect(mocks.notifications.error).toHaveBeenCalledOnce();
      expect(mocks.notifications.error.mock.calls[0][0]).toMatchObject({ text: `${KEY}.save_error` });
    });

    it("still runs when refreshing the lists afterwards fails", async () => {
      controls.canSave.value = true;
      // Already persisted at this point, so a refresh hiccup must not cost the customer their notification.
      mocks.fetchWishlists.mockRejectedValue(new Error("refetch failed"));

      renderModal(privateList());
      await selectScope(TARGETED_SCOPE);
      await fireEvent.click(saveButton());

      expect(controls.onSaved).toHaveBeenCalledOnce();
      expect(mocks.notifications.error).not.toHaveBeenCalled();
    });

    it("does not turn its own failure into a save error — the list is already saved", async () => {
      controls.canSave.value = true;
      controls.onSaved.mockRejectedValue(new Error("notification failed"));

      renderModal(privateList());
      await selectScope(TARGETED_SCOPE);
      await fireEvent.click(saveButton());

      expect(mocks.updateWishlist).toHaveBeenCalledOnce();
      expect(mocks.notifications.error).not.toHaveBeenCalled();
      expect(mocks.logger.error).toHaveBeenCalledOnce();
    });
  });

  describe("the sharing link field", () => {
    it("is offered for a scope that declares its list link-reachable", async () => {
      renderModal(privateList());

      await selectScope(TARGETED_SCOPE);

      expect(component.getByText(`${KEY}.sharing_link_label`)).toBeInTheDocument();
    });

    it("is not offered for a private list", () => {
      renderModal(privateList());

      expect(component.queryByText(`${KEY}.sharing_link_label`)).toBeNull();
    });

    it("copies the link and confirms it", async () => {
      renderModal(targetedList("org-1"));

      // The copy button is the only button inside the link field's append slot.
      const buttons = component.getAllByRole("button");
      const copyButton = buttons.find((button) => !button.hasAttribute("data-test-id"))!;
      await fireEvent.click(copyButton);

      expect(mocks.copy).toHaveBeenCalledOnce();
      expect(mocks.copy.mock.calls[0][0]).toContain("/shared-list/sharing-key-1");
      expect(mocks.notifications.success).toHaveBeenCalledOnce();
    });
  });
});
