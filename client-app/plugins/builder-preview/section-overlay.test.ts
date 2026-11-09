import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SectionOverlay } from "./section-overlay";

function addSection(id: string, parent: HTMLElement = document.body): HTMLElement {
  const element = document.createElement("section");
  element.setAttribute("data-pb-section", id);
  element.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 50 }) as DOMRect;
  element.scrollIntoView = vi.fn();
  parent.appendChild(element);
  return element;
}

function createOverlay(isPointTaken?: (clientX: number, clientY: number) => boolean) {
  const blocker = document.createElement("div");
  const onSelect = vi.fn();
  const onHover = vi.fn();
  const overlay = new SectionOverlay(document.body, blocker, onSelect, onHover, isPointTaken);
  overlay.setEnabled(true);
  overlay.setLabels({ section: "Section", block: "Block" });
  return { overlay, blocker, onSelect, onHover };
}

function selectedLabel(): string | undefined {
  const box = [...document.querySelectorAll<HTMLElement>("[aria-hidden='true'] > div")].find((element) =>
    element.style.border.startsWith("2px solid"),
  );

  return box?.style.display === "block" ? (box.textContent ?? "") : undefined;
}

describe("SectionOverlay", () => {
  let resizeCallbacks: (() => void)[];

  beforeEach(() => {
    resizeCallbacks = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resizeCallbacks.push(callback);
        }

        observe(): void {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("outlines a selected block's section until the block has an element of its own", () => {
    const { overlay } = createOverlay();
    addSection("section");

    overlay.select("block", "section");
    expect(selectedLabel()).toBe("Section");

    addSection("block");
    overlay.scheduleRender();
    expect(selectedLabel()).toBe("Block");
  });

  it("scrolls to a selection that renders after it was selected, once", () => {
    const { overlay } = createOverlay();

    overlay.select("section", null, true);
    expect(selectedLabel()).toBeUndefined();

    const section = addSection("section");
    resizeCallbacks.forEach((callback) => callback());
    resizeCallbacks.forEach((callback) => callback());

    expect(selectedLabel()).toBe("Section");
    expect(section.scrollIntoView).toHaveBeenCalledOnce();
  });

  it("leaves a point another overlay takes to it", () => {
    const { blocker, onSelect, onHover } = createOverlay(() => true);
    addSection("section");
    document.elementsFromPoint = () => [document.querySelector("[data-pb-section]")!];

    blocker.dispatchEvent(new MouseEvent("mousemove", { clientX: 10, clientY: 10 }));
    blocker.dispatchEvent(new MouseEvent("click", { clientX: 10, clientY: 10 }));
    delete (document as Partial<Document>).elementsFromPoint;

    expect(onHover).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
