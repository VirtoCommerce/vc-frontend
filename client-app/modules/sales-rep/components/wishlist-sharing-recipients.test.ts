/* The ui-kit stubs below are deliberately minimal test doubles, not shippable components — emit validators and
   component-block padding would only add noise to them. */
/* eslint-disable vue/require-emit-validator, vue/padding-lines-in-component-definition */
import { render, fireEvent, cleanup, configure } from "@testing-library/vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import WishlistSharingRecipients from "./wishlist-sharing-recipients.vue";
import type { WishlistSharingRecipientType } from "../types";
import type { RenderResult } from "@testing-library/vue";
import "@testing-library/jest-dom/vitest";

configure({ testIdAttribute: "data-test-id" });

// `t` echoes the key so assertions read as the copy contract.
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const KEY = "sales_rep.list_sharing";

const VcButton = defineComponent({
  props: {
    disabled: { type: Boolean, default: false },
    ariaLabel: { type: String, default: "" },
    appendIcon: { type: String, default: "" },
    size: { type: String, default: "" },
  },
  emits: ["click"],
  setup(props, { slots, emit }) {
    return () =>
      h(
        "button",
        {
          disabled: props.disabled,
          "aria-label": props.ariaLabel,
          "data-append-icon": props.appendIcon,
          "data-size": props.size,
          onClick: () => emit("click"),
        },
        slots.default?.(),
      );
  },
});

let component: RenderResult;

function customers(count: number): WishlistSharingRecipientType[] {
  return Array.from({ length: count }, (_, index) => ({
    organizationId: `org-${index + 1}`,
    organizationName: `Customer ${index + 1}`,
    location: index % 2 ? "" : "Richmond, Virginia",
  }));
}

function renderRecipients(recipients: WishlistSharingRecipientType[], props: Record<string, unknown> = {}) {
  component = render(WishlistSharingRecipients, {
    props: { recipients, ...props },
    global: {
      components: { VcButton },
      stubs: { VcIcon: true },
    },
  });

  return component;
}

function rows() {
  return component.container.querySelectorAll(".wishlist-sharing-recipients__row");
}

function toggle() {
  return component.queryByTestId("wishlist-sharing-toggle-recipients-button");
}

afterEach(() => {
  cleanup();
});

describe("WishlistSharingRecipients", () => {
  it("lists every recipient it is given", () => {
    renderRecipients(customers(2));

    expect(rows()).toHaveLength(2);
    expect(component.getByText("Customer 1")).toBeInTheDocument();
    expect(component.getByText("Richmond, Virginia")).toBeInTheDocument();
  });

  it("leaves out the second line for a customer whose address never loaded", () => {
    renderRecipients([{ organizationId: "org-1", organizationName: "Acme", location: "" }]);

    expect(component.container.querySelector(".wishlist-sharing-recipients__location")).toBeNull();
  });

  it("initials a recipient from the first two words of their name", () => {
    renderRecipients([{ organizationId: "org-1", organizationName: "acme trading company", location: "" }]);

    expect(component.getByText("AT")).toBeInTheDocument();
  });

  it("asks to remove the recipient behind the button that was pressed", async () => {
    renderRecipients(customers(2));

    await fireEvent.click(component.getByTestId("wishlist-sharing-remove-recipient-org-2").closest("button")!);

    expect(component.emitted("remove")).toEqual([["org-2"]]);
  });

  it("labels each remove button with the customer it removes", () => {
    renderRecipients(customers(1));

    expect(component.getByTestId("wishlist-sharing-remove-recipient-org-1").closest("button")).toHaveAttribute(
      "aria-label",
      `${KEY}.remove_recipient_button`,
    );
  });

  it("locks the rows while a save is in flight", () => {
    renderRecipients(customers(1), { disabled: true });

    expect(component.getByTestId("wishlist-sharing-remove-recipient-org-1").closest("button")).toBeDisabled();
  });

  describe("a list short enough to read at a glance", () => {
    it("carries no header and no expand toggle", () => {
      renderRecipients(customers(3));

      expect(component.queryByTestId("wishlist-sharing-clear-recipients-button")).toBeNull();
      expect(toggle()).toBeNull();
    });
  });

  describe("a list longer than it shows", () => {
    it("shows only the first rows, and offers the rest", () => {
      renderRecipients(customers(30));

      expect(rows()).toHaveLength(3);
      expect(toggle()).toHaveTextContent(`${KEY}.show_all_recipients_button`);
    });

    it("shows every row once expanded, and offers the way back", async () => {
      renderRecipients(customers(30));

      await fireEvent.click(toggle()!.closest("button")!);

      expect(rows()).toHaveLength(30);
      expect(toggle()).toHaveTextContent(`${KEY}.show_less_recipients_button`);
    });

    it("turns the chevron over when expanded", async () => {
      renderRecipients(customers(30));

      expect(toggle()!.closest("button")).toHaveAttribute("data-append-icon", "chevron-down");

      await fireEvent.click(toggle()!.closest("button")!);

      expect(toggle()!.closest("button")).toHaveAttribute("data-append-icon", "chevron-up");
    });

    it("offers to clear the whole list", async () => {
      renderRecipients(customers(30));

      await fireEvent.click(component.getByTestId("wishlist-sharing-clear-recipients-button").closest("button")!);

      expect(component.emitted("clear")).toHaveLength(1);
    });

    it("honours a caller that wants a different number of rows shown", () => {
      renderRecipients(customers(30), { collapsedRows: 5 });

      expect(rows()).toHaveLength(5);
    });

    it("collapses again when the list shrinks below the cut", async () => {
      renderRecipients(customers(30));
      await fireEvent.click(toggle()!.closest("button")!);

      // Left expanded, a list that later fits would render its toggle-less state with no way to reset it.
      await component.rerender({ recipients: customers(2) });
      await component.rerender({ recipients: customers(30) });

      expect(rows()).toHaveLength(3);
    });
  });
});
