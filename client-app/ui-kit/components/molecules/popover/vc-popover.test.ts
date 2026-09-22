import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { VcPopover } from "@/ui-kit/components/molecules";

// The panel is only shown once Floating UI has a position for it; until then it is transparent, so
// the frame that would otherwise paint it at its unpositioned coordinates is never seen. jsdom has
// no layout, so what is testable here is the gate itself and the origin the entrance grows from.
function mountPopover(props: Record<string, unknown> = {}) {
  return mount(VcPopover, {
    props: { lazy: false, ...props },
    slots: {
      trigger: "<button>open</button>",
      content: "<div class='panel'>content</div>",
    },
  });
}

describe("VcPopover", () => {
  it("does not mark the panel as positioned while it is closed", () => {
    expect(mountPopover().get(".vc-popover__body").classes()).not.toContain("vc-popover__body--positioned");
  });

  describe("entrance origin", () => {
    it.each([
      ["bottom-end", "right top"],
      ["bottom-start", "left top"],
      ["bottom", "center top"],
      ["top-end", "right bottom"],
      ["top", "center bottom"],
      ["right", "left center"],
      ["left", "right center"],
    ])("grows out of the trigger for %s", (placement, expected) => {
      const body = mountPopover({ placement }).get(".vc-popover__body");

      expect(body.attributes("style")).toContain(`--vc-popover-origin: ${expected}`);
    });
  });
});
