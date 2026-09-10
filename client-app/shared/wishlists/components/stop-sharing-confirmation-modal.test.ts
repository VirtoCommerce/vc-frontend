/* The ui-kit stubs below are deliberately minimal test doubles, not shippable components — emit validators and
   component-block padding would only add noise to them. */
/* eslint-disable vue/require-emit-validator, vue/padding-lines-in-component-definition */
import { render, fireEvent, cleanup, configure } from "@testing-library/vue";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import StopSharingConfirmationModal from "./stop-sharing-confirmation-modal.vue";
import type { RenderResult } from "@testing-library/vue";
import "@testing-library/jest-dom/vitest";

configure({ testIdAttribute: "data-test-id" });

const KEY = "shared.wishlists.stop_sharing_modal";

const VcModal = defineComponent({
  props: { title: { type: String, default: "" }, variant: { type: String, default: "" } },
  emits: ["close"],
  setup(props, { slots, emit }) {
    const close = () => emit("close");
    return () => [
      h("div", { "data-test-id": "modal", "data-title": props.title, "data-variant": props.variant }),
      slots.default?.(),
      slots.actions?.({ close }),
    ];
  },
});

const VcButton = defineComponent({
  props: { color: { type: String, default: "" } },
  emits: ["click"],
  setup(props, { slots, emit }) {
    return () => h("button", { "data-color": props.color, onClick: () => emit("click") }, slots.default?.());
  },
});

let component: RenderResult;

function renderModal() {
  component = render(StopSharingConfirmationModal, {
    global: {
      components: { VcModal, VcButton },
      // `$t` echoes the key so assertions read as the copy contract.
      mocks: { $t: (key: string) => key },
      stubs: { VcIcon: true },
    },
  });

  return component;
}

afterEach(() => {
  cleanup();
});

describe("StopSharingConfirmationModal", () => {
  it("states what the list loses, in the wording the ticket prescribes", () => {
    renderModal();

    expect(component.getByTestId("modal")).toHaveAttribute("data-title", `${KEY}.title`);
    expect(component.getByText(`${KEY}.message`)).toBeInTheDocument();
  });

  it("names the destructive action rather than confirming with OK", () => {
    renderModal();

    const confirm = component.getByTestId("stop-sharing-confirm-button").closest("button")!;
    expect(confirm).toHaveTextContent(`${KEY}.confirm_button`);
    expect(confirm).toHaveAttribute("data-color", "danger");
  });

  it("reads as destructive", () => {
    renderModal();

    expect(component.getByTestId("modal")).toHaveAttribute("data-variant", "danger");
  });

  it("asks the caller to go ahead", async () => {
    renderModal();

    await fireEvent.click(component.getByTestId("stop-sharing-confirm-button").closest("button")!);

    expect(component.emitted("confirm")).toHaveLength(1);
    expect(component.emitted("close")).toBeUndefined();
  });

  it("backs out without confirming anything", async () => {
    renderModal();

    await fireEvent.click(component.getByTestId("stop-sharing-cancel-button").closest("button")!);

    expect(component.emitted("close")).toHaveLength(1);
    expect(component.emitted("confirm")).toBeUndefined();
  });
});
