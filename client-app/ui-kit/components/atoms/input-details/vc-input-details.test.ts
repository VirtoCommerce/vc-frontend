import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import VcPopover from "../../molecules/popover/vc-popover.vue";
import VcTooltip from "../tooltip/vc-tooltip.vue";
import VcInputDetails from "./vc-input-details.vue";

const MESSAGE = "End date must be on or after start date";

// VcTooltip stays real: the whole point is the trigger it renders around the clamped message.
function mountDetails(props = {}) {
  return mount(VcInputDetails, {
    props: { message: MESSAGE, ...props },
    global: { components: { VcTooltip, VcPopover }, directives: { "html-safe": {} } },
  });
}

describe("VcInputDetails single-line message", () => {
  // Clamped text is unreadable without a pointer unless the trigger is focusable; VcPopover opens on focusin.
  it("makes the clamped message reachable by keyboard", () => {
    const message = mountDetails({ singleLine: true }).find(".vc-input-details__message");
    expect(message.attributes("tabindex")).toBe("0");
  });

  it("leaves the wrapping message out of the tab order", () => {
    const message = mountDetails().find(".vc-input-details__message");
    expect(message.attributes("tabindex")).toBeUndefined();
  });

  it("keeps the full message in the DOM when clamped, so aria-describedby still resolves to it", () => {
    expect(mountDetails({ singleLine: true }).text()).toContain(MESSAGE);
  });
});
