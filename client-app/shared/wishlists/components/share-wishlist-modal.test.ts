/* The ui-kit stubs below are deliberately minimal test doubles, not shippable components — emit validators and
   component-block padding would only add noise to them. */
/* eslint-disable vue/require-emit-validator, vue/padding-lines-in-component-definition */
import { render, fireEvent, cleanup, configure } from "@testing-library/vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { defineAsyncComponent, defineComponent, h, ref } from "vue";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { useWishlistSharingScopes } from "../composables/useWishlistSharingScopes";
import ShareWishlistModal from "./share-wishlist-modal.vue";
import type { WishlistSharingScopePayloadType } from "../composables/useWishlistSharingScopes";
import type { SharingTargetType, WishlistType } from "@/core/api/graphql/types";
import type { RenderResult } from "@testing-library/vue";
import type { PropType } from "vue";
import "@testing-library/jest-dom/vitest";

// The app tags elements with `data-test-id`, not Testing Library's default `data-testid`.
configure({ testIdAttribute: "data-test-id" });

// The share dialog reuses the copy of the list-settings dialog it was split from.
const KEY = "shared.wishlists.add_or_update_wishlist_modal";

// Deliberately not the Sales Rep scope: core must not know any contributed scope by name.
const TARGETED_SCOPE = "TargetedTestScope";
const SCOPE_LABEL_KEY = "test_module.targeted_scope.label";

// A second contributed scope, registered the way a real module does it — behind `defineAsyncComponent`.
const ASYNC_SCOPE = "AsyncTestScope";

const mocks = await vi.hoisted(async () => {
  const { ref: reactiveRef } = await import("vue");

  return {
    updateWishlist: vi.fn(),
    fetchWishlists: vi.fn(),
    notifications: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
    logger: { error: vi.fn(), warn: vi.fn() },
    copy: vi.fn(),
    clipboardSupported: reactiveRef(true),
    openModal: vi.fn<(options: unknown) => () => void>(() => vi.fn()),
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

vi.mock("@/shared/modal", () => ({ useModal: () => ({ openModal: mocks.openModal }) }));

vi.mock("@/core/utilities", () => ({ Logger: mocks.logger }));

const scopeAvailable = ref(true);

const controls = {
  canSave: ref(false),
  dirty: ref(false),
  payload: ref<WishlistSharingScopePayloadType>({}),
  onSaved: vi.fn(),
};

const scopeElementProps = {
  targets: { type: Array as PropType<SharingTargetType[]>, default: () => [] },
  message: { type: String, default: "" },
  sharingLink: { type: String, default: "" },
  saving: { type: Boolean, default: false },
};

const targetIds = (targets: SharingTargetType[]) => targets.map((target) => target.id).join(",");

// Owns state the modal cannot see and reports it through the contract — the whole point of the seam.
const ScopeControls = defineComponent({
  props: scopeElementProps,
  setup(props, { expose }) {
    expose(controls);
    return () =>
      h("div", {
        "data-test-id": "scope-controls",
        "data-target-ids": targetIds(props.targets),
        "data-message": props.message,
        "data-sharing-link": props.sharingLink,
        "data-saving": String(props.saving),
      });
  },
});

const asyncControls = {
  canSave: ref(false),
  dirty: ref(false),
  payload: ref<WishlistSharingScopePayloadType>({}),
  onSaved: vi.fn(),
};

const asyncScopeSetup = vi.fn();

// Carries a draft of its own, so a lost instance is visible rather than silent.
const AsyncScopeControls = defineAsyncComponent(() =>
  Promise.resolve(
    defineComponent({
      props: scopeElementProps,
      setup(props, { expose }) {
        asyncScopeSetup();
        expose(asyncControls);

        const draft = ref("");

        return () =>
          h(
            "div",
            {
              "data-test-id": "async-scope-controls",
              "data-target-ids": targetIds(props.targets),
              "data-saving": String(props.saving),
            },
            [
              h("input", {
                "data-test-id": "async-scope-draft",
                value: draft.value,
                onInput: (event: Event) => (draft.value = (event.target as HTMLInputElement).value),
              }),
            ],
          );
      },
    }),
  ),
);

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

const VcTabSwitch = defineComponent({
  props: {
    modelValue: { type: String, default: "" },
    value: { type: String, required: true },
    label: { type: String, default: "" },
    icon: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
  },
  emits: ["change"],
  setup(props, { emit }) {
    return () =>
      h("label", { "data-icon": props.icon }, [
        h("input", {
          type: "radio",
          value: props.value,
          checked: props.modelValue === props.value,
          disabled: props.disabled,
        }),
        h("button", { type: "button", onClick: () => emit("change", props.value) }, props.label),
      ]);
  },
});

const VcLabel = defineComponent({
  setup(_, { slots }) {
    return () => h("label", slots.default?.());
  },
});

const VcButton = defineComponent({
  props: { disabled: { type: Boolean, default: false }, loading: { type: Boolean, default: false } },
  emits: ["click"],
  setup(props, { slots, emit }) {
    return () => h("button", { disabled: props.disabled, onClick: () => emit("click") }, slots.default?.());
  },
});

let component: RenderResult;

function renderModal(list: WishlistType) {
  component = render(ShareWishlistModal, {
    props: { list },
    global: {
      components: { VcModal, VcInput, VcTabSwitch, VcLabel, VcButton },
      mocks: { $t: (key: string) => key },
      stubs: { VcIcon: true },
    },
  });

  return component;
}

function scopeTab(scope: string) {
  return component.queryByTestId<HTMLElement>(`wishlist-sharing-scope-${scope}`);
}

function scopeRadio(scope: string) {
  return scopeTab(scope)!.querySelector<HTMLInputElement>("input")!;
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

function targetedList(...ids: string[]): WishlistType {
  return {
    id: "list-1",
    name: "Spring assortment",
    description: "",
    sharingSetting: {
      id: "sharing-key-1",
      scope: TARGETED_SCOPE,
      isOwner: true,
      message: "New season is live.",
      targets: ids.map((id) => ({ id, name: id.toUpperCase() })),
    },
  } as unknown as WishlistType;
}

async function selectScope(scope: string) {
  await fireEvent.click(scopeTab(scope)!.querySelector("button")!);
}

/** Answers the stop-sharing confirmation the way the modal stack would. */
function confirmStopSharing() {
  const options = mocks.openModal.mock.calls[0][0] as { props: { onConfirm: () => void } };

  options.props.onConfirm();
}

function asyncScopeList(...ids: string[]): WishlistType {
  return {
    id: "list-1",
    name: "Spring assortment",
    description: "",
    sharingSetting: {
      id: "sharing-key-1",
      scope: ASYNC_SCOPE,
      isOwner: true,
      targets: ids.map((id) => ({ id })),
    },
  } as unknown as WishlistType;
}

async function selectAsyncScope() {
  await selectScope(ASYNC_SCOPE);
  await vi.waitFor(() => expect(component.getByTestId("async-scope-controls")).toBeInTheDocument());
}

beforeAll(() => {
  useWishlistSharingScopes().registerSharingScope({
    scope: TARGETED_SCOPE,
    labelKey: SCOPE_LABEL_KEY,
    statusKey: "test_module.targeted_scope.status",
    icon: "test-glyph",
    supportsLink: true,
    shoppable: true,
    isAvailable: () => scopeAvailable.value,
    element: ScopeControls,
  });

  useWishlistSharingScopes().registerSharingScope({
    scope: ASYNC_SCOPE,
    labelKey: "test_module.async_scope.label",
    icon: "test-glyph",
    element: AsyncScopeControls,
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
  mocks.openModal.mockReset().mockImplementation(() => vi.fn());
  asyncControls.canSave.value = false;
  asyncControls.dirty.value = false;
  asyncControls.payload.value = {};
  asyncControls.onSaved.mockReset().mockResolvedValue(undefined);
  asyncScopeSetup.mockReset();
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

      expect(scopeTab(WishlistScopeType.Private)).toBeInTheDocument();
      expect(scopeTab(WishlistScopeType.AnyoneAnonymous)).toBeInTheDocument();
      expect(scopeTab(WishlistScopeType.Organization)).toBeInTheDocument();
    });

    it("lists a contributed scope, labelled from the provider's own key", () => {
      renderModal(privateList());

      expect(scopeTab(TARGETED_SCOPE)).toBeInTheDocument();
      expect(component.getByText(SCOPE_LABEL_KEY)).toBeInTheDocument();
    });

    it("hides a contributed scope the current user may not use", () => {
      scopeAvailable.value = false;

      renderModal(privateList());

      expect(scopeTab(TARGETED_SCOPE)).toBeNull();
    });

    it("still lists the scope a list already carries, so saving cannot silently rewrite it", () => {
      scopeAvailable.value = false;

      renderModal(targetedList("org-1"));

      expect(scopeTab(TARGETED_SCOPE)).toBeInTheDocument();
    });

    it("asks who can access, and shows each scope under the icon its provider declared", () => {
      renderModal(privateList());

      expect(component.getByText("shared.wishlists.share_wishlist_modal.who_can_access_label")).toBeInTheDocument();
      expect(scopeTab(TARGETED_SCOPE)).toHaveAttribute("data-icon", "test-glyph");
      expect(scopeTab(WishlistScopeType.Private)!.getAttribute("data-icon")).not.toBe("");
    });

    it("orders the tabs as the scopes declare, with unordered contributions last", () => {
      renderModal(privateList());

      const order = component.getAllByRole("radio").map((radio) => (radio as HTMLInputElement).value);
      expect(order).toEqual([
        WishlistScopeType.Private,
        WishlistScopeType.Organization,
        WishlistScopeType.AnyoneAnonymous,
        TARGETED_SCOPE,
        ASYNC_SCOPE,
      ]);
    });

    it("opens on the scope the list already has", () => {
      renderModal(targetedList("org-1"));

      expect(scopeRadio(TARGETED_SCOPE).checked).toBe(true);
      expect(scopeRadio(WishlistScopeType.Private).checked).toBe(false);
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

    it("hands over the persisted recipients, the saved note and the list's sharing link", () => {
      renderModal(targetedList("org-1", "org-2"));

      const element = component.getByTestId("scope-controls");
      expect(element).toHaveAttribute("data-target-ids", "org-1,org-2");
      expect(element).toHaveAttribute("data-message", "New season is live.");
      expect(element.getAttribute("data-sharing-link")).toContain("/shared-list/sharing-key-1");
    });
  });

  describe("looking at another tab and coming back", () => {
    function asyncScopeControls() {
      return component.getByTestId("async-scope-controls");
    }

    async function openOn(list: WishlistType) {
      renderModal(list);
      await vi.waitFor(() => expect(asyncScopeControls()).toBeInTheDocument());
    }

    it("keeps the scope's draft, and the instance that owns it", async () => {
      await openOn(asyncScopeList("org-1"));

      await fireEvent.update(component.getByTestId("async-scope-draft"), "Season preview");

      await selectScope(WishlistScopeType.Private);
      expect(component.queryByTestId("async-scope-controls")).toBeNull();

      await selectAsyncScope();

      expect(component.getByTestId<HTMLInputElement>("async-scope-draft")).toHaveValue("Season preview");
      expect(asyncScopeSetup).toHaveBeenCalledOnce();
    });

    it("reads the scope's contract again once it is back, through the wrapper the registry hands over", async () => {
      await openOn(asyncScopeList("org-1"));

      await selectScope(WishlistScopeType.Private);

      asyncControls.canSave.value = true;
      asyncControls.dirty.value = true;

      await selectAsyncScope();

      // Back on the list's own scope, so only the element's own report can enable Save.
      await vi.waitFor(() => expect(saveButton()).not.toBeDisabled());
    });

    it("hands the scope the list as it stands now, not as it stood when the tab was left", async () => {
      await openOn(asyncScopeList("org-1"));

      await selectScope(WishlistScopeType.Private);
      await component.rerender({ list: asyncScopeList("org-2") });
      await selectAsyncScope();

      expect(asyncScopeControls()).toHaveAttribute("data-target-ids", "org-2");
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
      controls.payload.value = { addSharedWithIds: ["org-2"], removeSharedWithIds: ["org-1"] };

      renderModal(targetedList("org-1"));
      await selectScope(TARGETED_SCOPE);
      await fireEvent.click(saveButton());

      expect(mocks.updateWishlist).toHaveBeenCalledOnce();
      const command = mocks.updateWishlist.mock.calls[0][0];
      expect(command).toMatchObject({
        listId: "list-1",
        scope: TARGETED_SCOPE,
        sharingKey: "sharing-key-1",
        addSharedWithIds: ["org-2"],
        removeSharedWithIds: ["org-1"],
      });
      // The rename dialog owns these; sending them from here would let a stale copy overwrite a concurrent rename.
      expect(command).not.toHaveProperty("listName");
      expect(command).not.toHaveProperty("description");
    });

    it("sends no target for a scope that contributes none", async () => {
      renderModal(targetedList("org-1"));

      // Leaving a sharing scope revokes the current audience, so this path goes through the confirmation.
      await selectScope(WishlistScopeType.Private);
      await fireEvent.click(saveButton());
      confirmStopSharing();

      await vi.waitFor(() => expect(mocks.updateWishlist).toHaveBeenCalledOnce());
      expect(mocks.updateWishlist.mock.calls[0][0]).not.toHaveProperty("addSharedWithIds");
    });
  });

  describe("warning before an audience loses the list", () => {
    it("asks before moving an already-shared list to another scope, and saves nothing until confirmed", async () => {
      renderModal(targetedList("org-1"));

      await selectScope(WishlistScopeType.Private);
      await fireEvent.click(saveButton());

      expect(mocks.openModal).toHaveBeenCalledOnce();
      expect(mocks.updateWishlist).not.toHaveBeenCalled();
    });

    it("saves once the confirmation comes back", async () => {
      renderModal(targetedList("org-1"));

      await selectScope(WishlistScopeType.Private);
      await fireEvent.click(saveButton());
      confirmStopSharing();

      await vi.waitFor(() => expect(mocks.updateWishlist).toHaveBeenCalledOnce());
      expect(mocks.updateWishlist.mock.calls[0][0]).toMatchObject({ scope: WishlistScopeType.Private });
    });

    it("changes nothing while the confirmation stands unanswered", async () => {
      renderModal(targetedList("org-1"));

      await selectScope(WishlistScopeType.Organization);
      await fireEvent.click(saveButton());

      // Dismissing the confirmation leaves the dialog as it was, with the new scope still only selected.
      expect(mocks.updateWishlist).not.toHaveBeenCalled();
      expect(scopeRadio(WishlistScopeType.Organization).checked).toBe(true);
    });

    it("asks nothing when a private list is shared for the first time", async () => {
      renderModal(privateList());

      await selectScope(WishlistScopeType.Organization);
      await fireEvent.click(saveButton());

      // Nobody had access, so nobody can lose it.
      expect(mocks.openModal).not.toHaveBeenCalled();
      expect(mocks.updateWishlist).toHaveBeenCalledOnce();
    });

    it("asks nothing when only the scope's own recipients change", async () => {
      controls.canSave.value = true;
      controls.dirty.value = true;
      controls.payload.value = { addSharedWithIds: ["org-2"] };

      renderModal(targetedList("org-1"));
      await selectScope(TARGETED_SCOPE);
      await fireEvent.click(saveButton());

      // Still the same scope: the audience is being edited, not revoked.
      expect(mocks.openModal).not.toHaveBeenCalled();
      expect(mocks.updateWishlist).toHaveBeenCalledOnce();
    });
  });

  describe("staying put while a write is in flight", () => {
    it("refuses dismissal and locks Cancel until the save settles", async () => {
      controls.canSave.value = true;
      controls.payload.value = { addSharedWithIds: ["org-1"] };
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
      controls.payload.value = { addSharedWithIds: ["org-1"] };

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

      await fireEvent.click(component.getByTestId("wishlist-sharing-copy-link-button"));

      expect(mocks.copy).toHaveBeenCalledOnce();
      expect(mocks.copy.mock.calls[0][0]).toContain("/shared-list/sharing-key-1");
      expect(mocks.notifications.success).toHaveBeenCalledOnce();
    });
  });
});
