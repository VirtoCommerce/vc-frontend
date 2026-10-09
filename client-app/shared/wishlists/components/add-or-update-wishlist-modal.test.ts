/* The ui-kit stubs below are deliberately minimal test doubles, not shippable components — emit validators and
   component-block padding would only add noise to them. */
/* eslint-disable vue/require-emit-validator, vue/padding-lines-in-component-definition */
import { render, fireEvent, cleanup, configure } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { WishlistScopeType } from "@/core/api/graphql/types";
import AddOrUpdateWishlistModal from "./add-or-update-wishlist-modal.vue";
import type { WishlistType } from "@/core/api/graphql/types";
import type { RenderResult } from "@testing-library/vue";
import "@testing-library/jest-dom/vitest";

// The app tags elements with `data-test-id`, not Testing Library's default `data-testid`.
configure({ testIdAttribute: "data-test-id" });

const KEY = "shared.wishlists.add_or_update_wishlist_modal";

const mocks = vi.hoisted(() => ({
  createWishlist: vi.fn(),
  updateWishlist: vi.fn(),
  fetchWishlists: vi.fn(),
  notifications: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
  logger: { error: vi.fn(), warn: vi.fn() },
  close: vi.fn(),
}));

// `t` echoes the key so assertions read as the copy contract.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => true }),
}));

vi.mock("../composables/useWishlists", () => ({
  useWishlists: () => ({
    createWishlist: mocks.createWishlist,
    updateWishlist: mocks.updateWishlist,
    fetchWishlists: mocks.fetchWishlists,
  }),
}));

vi.mock("@/shared/notification", () => ({ useNotifications: () => mocks.notifications }));

vi.mock("@/core/utilities", () => ({ Logger: mocks.logger }));

// Native controls stand in for the ui-kit: the kit's own behaviour is covered where it lives.
const VcModal = defineComponent({
  props: { title: { type: String, default: "" }, isPersistent: { type: Boolean, default: false } },
  setup(props, { slots }) {
    return () => [
      // Mirrors the real modal: while persistent it refuses Esc, the backdrop and its own close button.
      h("div", { "data-test-id": "modal", "data-persistent": String(props.isPersistent), "data-title": props.title }),
      slots.default?.(),
      slots.actions?.({ close: mocks.close }),
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
  setup(props, { emit }) {
    return () => [
      props.label ? h("label", props.label) : null,
      h("input", {
        "data-test-id": props.testIdInput,
        value: props.modelValue,
        onInput: (event: Event) => emit("update:modelValue", (event.target as HTMLInputElement).value),
      }),
    ];
  },
});

const VcTextarea = defineComponent({
  props: { modelValue: { type: String, default: "" } },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("textarea", {
        "data-test-id": "wishlist-description-input",
        value: props.modelValue,
        onInput: (event: Event) => emit("update:modelValue", (event.target as HTMLTextAreaElement).value),
      });
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
      components: { VcModal, VcInput, VcTextarea, VcButton },
      mocks: { $t: (key: string) => key },
      stubs: { VcIcon: true },
    },
  });

  return component;
}

function saveButton() {
  return component.getByTestId<HTMLElement>("wishlist-settings-save-button").closest("button")!;
}

function cancelButton() {
  return component.getByTestId<HTMLElement>("wishlist-settings-cancel-button").closest("button")!;
}

function sharedList(): WishlistType {
  return {
    id: "list-1",
    name: "Spring assortment",
    description: "Seasonal picks",
    sharingSetting: {
      id: "sharing-key-1",
      scope: WishlistScopeType.Organization,
      sharedWithId: "org-1",
      isOwner: true,
    },
  } as unknown as WishlistType;
}

async function nameTheList(name: string) {
  await fireEvent.update(component.getByTestId("wishlist-name-input"), name);
}

beforeEach(() => {
  mocks.createWishlist.mockReset().mockResolvedValue("list-new");
  mocks.updateWishlist.mockReset().mockResolvedValue(undefined);
  mocks.fetchWishlists.mockReset().mockResolvedValue(undefined);
  mocks.logger.error.mockReset();
  mocks.close.mockReset();
  Object.values(mocks.notifications).forEach((spy) => spy.mockReset());
});

afterEach(() => {
  cleanup();
});

describe("AddOrUpdateWishlistModal", () => {
  it("offers name and description, and no sharing controls", () => {
    renderModal(sharedList());

    expect(component.getByTestId("wishlist-name-input")).toBeInTheDocument();
    expect(component.getByTestId("wishlist-description-input")).toBeInTheDocument();
    expect(component.queryByTestId("wishlist-sharing-scope-select")).toBeNull();
    expect(component.queryByText(`${KEY}.sharing_link_label`)).toBeNull();
  });

  it("is titled for creation or for settings depending on whether a list is given", () => {
    renderModal();
    expect(component.getByTestId("modal")).toHaveAttribute("data-title", `${KEY}.title`);
    cleanup();

    renderModal(sharedList());
    expect(component.getByTestId("modal")).toHaveAttribute("data-title", `${KEY}.edit_mode_title`);
  });

  describe("gating Save", () => {
    it("stays disabled until the list has a name", async () => {
      renderModal();

      expect(saveButton()).toBeDisabled();

      await nameTheList("Autumn picks");

      expect(saveButton()).not.toBeDisabled();
    });

    it("stays disabled on an untouched list", () => {
      renderModal(sharedList());

      expect(saveButton()).toBeDisabled();
    });
  });

  describe("creating", () => {
    it("starts the new list private, with a fresh sharing key and no target", async () => {
      renderModal();
      await nameTheList("Autumn picks");
      await fireEvent.click(saveButton());

      expect(mocks.createWishlist).toHaveBeenCalledOnce();
      const command = mocks.createWishlist.mock.calls[0][0];
      expect(command).toMatchObject({ listName: "Autumn picks", scope: WishlistScopeType.Private });
      expect(command.sharingKey).toEqual(expect.any(String));
      expect(command).not.toHaveProperty("sharedWithId");
    });
  });

  describe("renaming", () => {
    it("sends the name and description only — sharing belongs to the share dialog", async () => {
      renderModal(sharedList());
      await nameTheList("Renamed");
      await fireEvent.click(saveButton());

      expect(mocks.updateWishlist).toHaveBeenCalledOnce();
      const command = mocks.updateWishlist.mock.calls[0][0];
      expect(command).toEqual({ listId: "list-1", listName: "Renamed", description: "Seasonal picks" });
    });

    it("refreshes the lists and closes once saved", async () => {
      renderModal(sharedList());
      await nameTheList("Renamed");
      await fireEvent.click(saveButton());

      expect(mocks.fetchWishlists).toHaveBeenCalledOnce();
      expect(mocks.close).toHaveBeenCalledOnce();
    });

    it("still closes when refreshing the lists afterwards fails — the list is already saved", async () => {
      mocks.fetchWishlists.mockRejectedValue(new Error("refetch failed"));

      renderModal(sharedList());
      await nameTheList("Renamed");
      await fireEvent.click(saveButton());

      expect(mocks.close).toHaveBeenCalledOnce();
      expect(mocks.notifications.error).not.toHaveBeenCalled();
      expect(mocks.logger.error).toHaveBeenCalledOnce();
    });

    it("stays open and reports when the save itself fails", async () => {
      mocks.updateWishlist.mockRejectedValue(new Error("boom"));

      renderModal(sharedList());
      await nameTheList("Renamed");
      await fireEvent.click(saveButton());

      expect(mocks.close).not.toHaveBeenCalled();
      expect(mocks.notifications.error).toHaveBeenCalledOnce();
      expect(mocks.notifications.error.mock.calls[0][0]).toMatchObject({ text: `${KEY}.save_error` });
    });
  });

  describe("staying put while a write is in flight", () => {
    it("refuses dismissal and locks Cancel until the save settles", async () => {
      let settle: () => void = () => {};
      mocks.updateWishlist.mockImplementation(() => new Promise<void>((resolve) => (settle = resolve)));

      renderModal(sharedList());
      await nameTheList("Renamed");
      await fireEvent.click(saveButton());

      expect(component.getByTestId("modal")).toHaveAttribute("data-persistent", "true");
      expect(cancelButton()).toBeDisabled();

      settle();

      // The save awaits the list refresh before releasing, so poll rather than count ticks.
      await vi.waitFor(() => expect(component.getByTestId("modal")).toHaveAttribute("data-persistent", "false"));
      expect(cancelButton()).not.toBeDisabled();
    });

    it("leaves Cancel usable when nothing is being written", () => {
      renderModal(sharedList());

      expect(component.getByTestId("modal")).toHaveAttribute("data-persistent", "false");
      expect(cancelButton()).not.toBeDisabled();
    });
  });
});
