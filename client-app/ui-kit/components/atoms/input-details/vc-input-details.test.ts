import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import VcPopover from "../../molecules/popover/vc-popover.vue";
import VcTooltip from "../tooltip/vc-tooltip.vue";
import VcInputDetails from "./vc-input-details.vue";

const MESSAGE = "End date must be on or after start date";

// VcTooltip stays real: the clamped branch renders the message inside it, which is what these guard.
function mountDetails(props = {}) {
  return mount(VcInputDetails, {
    props: { message: MESSAGE, ...props },
    global: { components: { VcTooltip, VcPopover }, directives: { "html-safe": {} } },
  });
}

describe("VcInputDetails single-line message", () => {
  it("clamps to one line so a reserved details row keeps the height it renders", () => {
    expect(mountDetails({ singleLine: true }).classes()).toContain("vc-input-details--single-line");
  });

  // Clamping moves the message into a tooltip; consumers point aria-describedby at this row.
  it("keeps the full message in the DOM when clamped", () => {
    expect(mountDetails({ singleLine: true }).text()).toContain(MESSAGE);
  });
});
