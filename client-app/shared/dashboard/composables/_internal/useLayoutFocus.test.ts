import { afterEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { createSurfaceRoot } from "../../layout-test-utils";
import { useLayoutFocus } from "./useLayoutFocus";

type LayoutFocusType = ReturnType<typeof useLayoutFocus>;

/** Renders one surface per markup, in order, and returns their roots. */
function render(...surfaces: string[]): HTMLElement[] {
  const roots = surfaces.map((markup) => createSurfaceRoot(markup));
  document.body.replaceChildren(...roots);
  return roots;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("focusEditToggle", () => {
  it("focuses the edit toggle", async () => {
    const [root] = render(`<button data-layout-edit-toggle>Edit layout</button>`);

    useLayoutFocus(root).focusEditToggle();
    await nextTick();

    expect(document.activeElement).toBe(root.querySelector("[data-layout-edit-toggle]"));
  });

  it("does nothing when there is no toggle to focus", async () => {
    const [root] = render(`<button id="elsewhere"></button>`);
    const elsewhere = root.querySelector<HTMLElement>("#elsewhere")!;
    elsewhere.focus();

    useLayoutFocus(root).focusEditToggle();
    await nextTick();

    expect(document.activeElement).toBe(elsewhere);
  });
});

describe("focusSurfaceStart", () => {
  it("focuses the surface itself", async () => {
    const [root] = render(`<button data-layout-save>Save layout</button>`);

    useLayoutFocus(root).focusSurfaceStart();
    await nextTick();

    expect(document.activeElement).toBe(root);
  });
});

// Starting a save makes the wrapper inert, which drops focus to <body>; a failure leaves the bar
// mounted with nothing holding it, since edit mode never ends.
describe("focusSaveButton", () => {
  it("focuses the save button", async () => {
    const [root] = render(`<button data-layout-save>Save layout</button>`);

    useLayoutFocus(root).focusSaveButton();
    await nextTick();

    expect(document.activeElement).toBe(root.querySelector("[data-layout-save]"));
  });

  it("does nothing when the edit bar is gone", async () => {
    const [root] = render(`<button id="elsewhere"></button>`);
    const elsewhere = root.querySelector<HTMLElement>("#elsewhere")!;
    elsewhere.focus();

    useLayoutFocus(root).focusSaveButton();
    await nextTick();

    expect(document.activeElement).toBe(elsewhere);
  });
});

describe("focusBlockControl", () => {
  // Ordered by how specific the control is: a widget's handle, then a whole-card stat, then the
  // tray's restore button — a block is only ever rendered as one of the three.
  it.each([
    ["widget handle", `<div data-block-id="orders"><button class="layout-widget__handle"></button></div>`, "BUTTON"],
    ["whole stat card", `<div data-block-id="orders" role="button" tabindex="0"></div>`, "DIV"],
    ["tray restore button", `<button data-restore-id="orders"></button>`, "BUTTON"],
  ])("focuses the %s", async (_label, markup, tag) => {
    const [root] = render(markup);

    useLayoutFocus(root).focusBlockControl("orders");
    await nextTick();

    expect(document.activeElement?.tagName).toBe(tag);
    expect(document.activeElement).not.toBe(document.body);
  });

  it("leaves focus alone when the block is gone", async () => {
    const [root] = render(`<div data-block-id="something-else" role="button" tabindex="0"></div>`);

    useLayoutFocus(root).focusBlockControl("orders");
    await nextTick();

    expect(document.activeElement).toBe(document.body);
  });
});

// Two surfaces of one dashboard, both in edit mode: the first surface's controls come first in the page.
describe("with two surfaces on the page", () => {
  const chrome = `
    <button data-layout-edit-toggle></button>
    <button data-layout-save></button>
    <div data-block-id="orders"><button class="layout-widget__handle"></button></div>`;

  it.each<[string, (focus: LayoutFocusType) => void, string]>([
    ["edit toggle", (focus) => focus.focusEditToggle(), "[data-layout-edit-toggle]"],
    ["Save", (focus) => focus.focusSaveButton(), "[data-layout-save]"],
    ["block control", (focus) => focus.focusBlockControl("orders"), ".layout-widget__handle"],
  ])("focuses the %s of its own surface", async (_label, move, selector) => {
    const [, second] = render(chrome, chrome);

    move(useLayoutFocus(second));
    await nextTick();

    expect(document.activeElement).toBe(second.querySelector(selector));
  });

  it("focuses the start of its own surface", async () => {
    const [, second] = render(chrome, chrome);

    useLayoutFocus(second).focusSurfaceStart();
    await nextTick();

    expect(document.activeElement).toBe(second);
  });
});
