/* The ui-kit stubs below are deliberately minimal test doubles, not shippable components — emit validators and
   component-block padding would only add noise to them. */
/* eslint-disable vue/require-emit-validator, vue/padding-lines-in-component-definition */
import { render, fireEvent, cleanup, configure } from "@testing-library/vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { useWishlistSharingScopes } from "../composables/useWishlistSharingScopes";
import AddOrUpdateWishlistModal from "./add-or-update-wishlist-modal.vue";
import type { WishlistType } from "@/core/api/graphql/types";
import type { RenderResult } from "@testing-library/vue";
import "@testing-library/jest-dom/vitest";

// The app tags elements with `data-test-id`, not Testing Library's default `data-testid`.
configure({ testIdAttribute: "data-test-id" });

const KEY = "shared.wishlists.add_or_update_wishlist_modal";

// A stand-in for whatever a module contributes. Deliberately not the Sales Rep scope: these tests cover the core
// contract, and core must not know any contributed scope by name.
const TARGETED_SCOPE = "TargetedTestScope";
const SCOPE_LABEL_KEY = "test_module.targeted_scope.label";

const mocks = await vi.hoisted(async () => {
  const { ref: reactiveRef } = await import("vue");

  return {
    createWishlist: vi.fn(),
    updateWishlist: vi.fn(),
    fetchWishlists: vi.fn(),
    isCorporateMember: reactiveRef(true),
    notifications: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
    logger: { error: vi.fn(), warn: vi.fn() },
    copy: vi.fn(),
  };
});

// `t` echoes the key so assertions read as the copy contract rather than the English wording.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => true }),
}));

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useClipboard: () => ({ copy: mocks.copy, isSupported: ref(true) }),
}));

vi.mock("../composables/useWishlists", () => ({
  useWishlists: () => ({
    createWishlist: mocks.createWishlist,
    updateWishlist: mocks.updateWishlist,
    fetchWishlists: mocks.fetchWishlists,
  }),
}));

vi.mock("@/shared/account/composables", () => ({
  useUser: () => ({ isCorporateMember: mocks.isCorporateMember }),
}));

vi.mock("@/shared/notification", () => ({ useNotifications: () => mocks.notifications }));

vi.mock("@/core/utilities", () => ({ Logger: mocks.logger }));

/** Whether the contributed scope is on offer for the current user. */
const scopeAvailable = ref(true);

/** What the contributed scope's rendered element exposes back to the modal. */
const controls = {
  canSave: ref(false),
  dirty: ref(false),
  payload: ref<{ sharedWithId?: string }>({}),
  onSaved: vi.fn(),
};

// Stands in for a module's per-scope controls: it owns state the modal cannot see and reports it through the
// documented contract, which is the whole point of the seam.
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
  props: {
    modelValue: { type: String, default: "" },
    testIdInput: { type: String, default: "" },
    label: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  setup(props, { emit, slots }) {
    return () => [
      // The label is rendered so tests can tell which fields the modal is actually offering.
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

function renderModal(list?: WishlistType) {
  component = render(AddOrUpdateWishlistModal, {
    props: { list },
    global: {
      components: { VcModal, VcInput, VcTextarea, VcSelect, VcButton },
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
  return component.getByTestId<HTMLElement>("wishlist-settings-save-button").closest("button")!;
}

/** A list already published under the contributed scope, as the wishlist queries would return it. */
function targetedList(sharedWithId?: string): WishlistType {
  return {
    id: "list-1",
    name: "Spring assortment",
    description: "",
    sharingSetting: { id: "sharing-key-1", scope: TARGETED_SCOPE, sharedWithId, isOwner: true },
  } as unknown as WishlistType;
}

async function selectTargetedScope() {
  await fireEvent.update(scopeSelect(), TARGETED_SCOPE);
}

async function nameTheList(name = "Spring assortment") {
  await fireEvent.update(component.getByTestId("wishlist-name-input"), name);
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
  mocks.createWishlist.mockReset().mockResolvedValue("list-new");
  mocks.updateWishlist.mockReset().mockResolvedValue(undefined);
  mocks.fetchWishlists.mockReset().mockResolvedValue(undefined);
  mocks.logger.error.mockReset();
  Object.values(mocks.notifications).forEach((spy) => spy.mockReset());
  mocks.isCorporateMember.value = true;
  scopeAvailable.value = true;
  controls.canSave.value = false;
  controls.dirty.value = false;
  controls.payload.value = {};
  controls.onSaved.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

describe("AddOrUpdateWishlistModal — contributed sharing scopes", () => {
  describe("which scopes are listed", () => {
    it("always lists the scopes core owns", () => {
      renderModal();

      const select = scopeSelect();
      expect(select).toContainHTML(`value="${WishlistScopeType.Private}"`);
      expect(select).toContainHTML(`value="${WishlistScopeType.AnyoneAnonymous}"`);
      expect(select).toContainHTML(`value="${WishlistScopeType.Organization}"`);
    });

    it("lists a contributed scope, labelled from the provider's own key", () => {
      renderModal();

      expect(scopeSelect()).toContainHTML(`value="${TARGETED_SCOPE}"`);
      expect(component.getByText(SCOPE_LABEL_KEY)).toBeInTheDocument();
    });

    it("hides a contributed scope the current user may not use", () => {
      scopeAvailable.value = false;

      renderModal();

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
      renderModal();

      expect(component.queryByTestId("scope-controls")).toBeNull();

      await selectTargetedScope();

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
      renderModal();
      await nameTheList();
      await selectTargetedScope();

      expect(saveButton()).toBeDisabled();
    });

    it("enables Save once the provider reports its input complete", async () => {
      renderModal();
      await nameTheList();
      await selectTargetedScope();

      controls.canSave.value = true;
      await fireEvent.update(scopeSelect(), TARGETED_SCOPE);

      expect(saveButton()).not.toBeDisabled();
    });

    it("enables Save when only the provider's own state changed", async () => {
      renderModal(targetedList("org-1"));

      expect(saveButton()).toBeDisabled();

      controls.canSave.value = true;
      controls.dirty.value = true;
      await fireEvent.update(scopeSelect(), TARGETED_SCOPE);

      expect(saveButton()).not.toBeDisabled();
    });

    it("leaves Save disabled on an untouched list under a core scope", () => {
      renderModal({
        id: "list-1",
        name: "Spring assortment",
        description: "",
        sharingSetting: { id: "k", scope: WishlistScopeType.Private, isOwner: true },
      } as unknown as WishlistType);

      expect(saveButton()).toBeDisabled();
    });
  });

  describe("saving", () => {
    it("merges the provider's contribution into the create command", async () => {
      controls.canSave.value = true;
      controls.payload.value = { sharedWithId: "org-1" };

      renderModal();
      await nameTheList();
      await selectTargetedScope();
      await fireEvent.click(saveButton());

      expect(mocks.createWishlist).toHaveBeenCalledOnce();
      expect(mocks.createWishlist.mock.calls[0][0]).toMatchObject({
        listName: "Spring assortment",
        scope: TARGETED_SCOPE,
        sharedWithId: "org-1",
      });
    });

    it("merges the provider's contribution into the change command", async () => {
      controls.canSave.value = true;
      controls.dirty.value = true;
      controls.payload.value = { sharedWithId: "org-2" };

      renderModal(targetedList("org-1"));
      await fireEvent.update(scopeSelect(), TARGETED_SCOPE);
      await fireEvent.click(saveButton());

      expect(mocks.updateWishlist).toHaveBeenCalledOnce();
      expect(mocks.updateWishlist.mock.calls[0][0]).toMatchObject({
        listId: "list-1",
        scope: TARGETED_SCOPE,
        sharedWithId: "org-2",
      });
    });

    it("sends no target for a scope that contributes none", async () => {
      renderModal(targetedList("org-1"));

      await fireEvent.update(scopeSelect(), WishlistScopeType.Private);
      await fireEvent.click(saveButton());

      expect(mocks.updateWishlist).toHaveBeenCalledOnce();
      // The backend applies a null target for its non-targeted scopes, so the key is simply absent.
      expect(mocks.updateWishlist.mock.calls[0][0]).not.toHaveProperty("sharedWithId");
    });
  });

  describe("the provider's follow-up after a save", () => {
    it("runs once the list is persisted, with the saved name and the sharing link", async () => {
      controls.canSave.value = true;
      controls.payload.value = { sharedWithId: "org-1" };

      renderModal();
      await nameTheList("Autumn picks");
      await selectTargetedScope();
      await fireEvent.click(saveButton());

      expect(controls.onSaved).toHaveBeenCalledOnce();
      expect(controls.onSaved.mock.calls[0][0]).toMatchObject({ listName: "Autumn picks" });
      expect(controls.onSaved.mock.calls[0][0].sharingLink).toContain("/shared-list/");
    });

    it("does not run when the list itself failed to save", async () => {
      controls.canSave.value = true;
      mocks.createWishlist.mockRejectedValue(new Error("boom"));

      renderModal();
      await nameTheList();
      await selectTargetedScope();
      await fireEvent.click(saveButton());

      expect(controls.onSaved).not.toHaveBeenCalled();
      expect(mocks.notifications.error).toHaveBeenCalledOnce();
      expect(mocks.notifications.error.mock.calls[0][0]).toMatchObject({ text: `${KEY}.save_error` });
    });

    it("still runs when refreshing the lists afterwards fails", async () => {
      controls.canSave.value = true;
      // The list is already persisted at this point; a refresh hiccup must not cost the customer their notification.
      mocks.fetchWishlists.mockRejectedValue(new Error("refetch failed"));

      renderModal();
      await nameTheList();
      await selectTargetedScope();
      await fireEvent.click(saveButton());

      expect(controls.onSaved).toHaveBeenCalledOnce();
      expect(mocks.notifications.error).not.toHaveBeenCalled();
    });

    it("does not turn its own failure into a save error — the list is already saved", async () => {
      controls.canSave.value = true;
      controls.onSaved.mockRejectedValue(new Error("notification failed"));

      renderModal();
      await nameTheList();
      await selectTargetedScope();
      await fireEvent.click(saveButton());

      expect(mocks.createWishlist).toHaveBeenCalledOnce();
      expect(mocks.notifications.error).not.toHaveBeenCalled();
      expect(mocks.logger.error).toHaveBeenCalledOnce();
    });
  });

  describe("the sharing link field", () => {
    it("is offered for a scope that declares its list link-reachable", async () => {
      renderModal();

      await selectTargetedScope();

      expect(component.getByText(`${KEY}.sharing_link_label`)).toBeInTheDocument();
    });

    it("is not offered for a private list", async () => {
      renderModal();

      await fireEvent.update(scopeSelect(), WishlistScopeType.Private);

      expect(component.queryByText(`${KEY}.sharing_link_label`)).toBeNull();
    });
  });
});
