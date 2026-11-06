import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SectionOverlay } from "./section-overlay";

function addSection(id: string): HTMLElement {
  const element = document.createElement("section");
  element.setAttribute("data-pb-section", id);
  element.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 50 }) as DOMRect;
  document.body.appendChild(element);
  return element;
}

/** The label of the solid outline, or nothing while no outline is shown. */
function selectedLabel(): string | undefined {
  const box = [...document.querySelectorAll<HTMLElement>("[aria-hidden='true'] > div")].find((element) =>
    element.style.border.startsWith("2px solid"),
  );

  return box?.style.display === "block" ? (box.textContent ?? "") : undefined;
}

describe("SectionOverlay", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("outlines a selected block's section until the block has an element of its own", () => {
    const overlay = new SectionOverlay(document.body, document.createElement("div"), vi.fn(), vi.fn());
    overlay.setEnabled(true);
    overlay.setLabels({ section: "Section", block: "Block" });
    addSection("section");

    overlay.select("block", "section");
    expect(selectedLabel()).toBe("Section");

    addSection("block");
    overlay.scheduleRender();
    expect(selectedLabel()).toBe("Block");
  });
});
