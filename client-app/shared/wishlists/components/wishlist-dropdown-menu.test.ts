import { render, cleanup, configure } from "@testing-library/vue";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { createI18n } from "vue-i18n";
import WishlistDropdownMenu from "./wishlist-dropdown-menu.vue";
import type { RenderResult } from "@testing-library/vue";
import "@testing-library/jest-dom/vitest";

configure({ testIdAttribute: "data-test-id" });

const messages = {
  en: {
    common: { labels: { actions: "Actions" } },
    shared: {
      wishlists: {
        list_card: {
          rename_list_button: "Rename",
          share_button: "Share",
          remove_list_button: "Remove list",
        },
      },
    },
  },
};

/** The real dropdown only renders its content once opened; the menu's own gating is what is under test. */
const VcDropdownMenu = defineComponent({
  setup(_props, { slots }) {
    return () => h("div", [slots.trigger?.({ triggerProps: {} }), slots.content?.({ close: () => {} })]);
  },
});

const VcMenuItem = defineComponent({
  setup(_props, { slots }) {
    return () => h("div", slots.default?.());
  },
});

let component: RenderResult;

afterEach(() => {
  cleanup();
});

function renderMenu(props: { shareable?: boolean; removable?: boolean } = {}) {
  component = render(WishlistDropdownMenu, {
    props,
    global: {
      plugins: [createI18n({ legacy: false, locale: "en", messages })],
      stubs: { VcDropdownMenu, VcMenuItem, VcButton: true, VcIcon: true },
    },
  });

  return component;
}

const renameItem = () => component.queryByTestId("wishlist-card-edit-menu-item");
const shareItem = () => component.queryByTestId("wishlist-card-share-menu-item");
const removeItem = () => component.queryByTestId("wishlist-card-remove-menu-item");

describe("WishlistDropdownMenu", () => {
  it("offers rename to everyone who can reach the menu", () => {
    renderMenu();

    expect(renameItem()).toBeInTheDocument();
  });

  it("offers remove to the owner only", () => {
    // A co-member of an organization list holds Write and so reaches this menu, but deleting the list is the
    // owner's call — the backend refuses it either way (VCST-6125 follow-up).
    renderMenu({ removable: false });

    expect(removeItem()).not.toBeInTheDocument();

    cleanup();
    renderMenu({ removable: true });

    expect(removeItem()).toBeInTheDocument();
  });

  it("offers share to the owner of a corporate list only", () => {
    renderMenu({ shareable: false });

    expect(shareItem()).not.toBeInTheDocument();

    cleanup();
    renderMenu({ shareable: true });

    expect(shareItem()).toBeInTheDocument();
  });
});
