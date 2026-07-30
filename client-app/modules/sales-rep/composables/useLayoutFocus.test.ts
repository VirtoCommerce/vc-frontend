import { afterEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { focusBlockControl, focusEditToggle, focusSaveButton } from "./useLayoutFocus";

function render(markup: string): void {
  const parsed = new DOMParser().parseFromString(markup, "text/html");
  document.body.replaceChildren(...parsed.body.childNodes);
}

afterEach(() => {
  render("");
});

describe("focusEditToggle", () => {
  it("focuses the edit toggle", async () => {
    render(`<button data-layout-edit-toggle>Edit layout</button>`);

    focusEditToggle();
    await nextTick();

    expect(document.activeElement).toBe(document.querySelector("[data-layout-edit-toggle]"));
  });

  it("does nothing when there is no toggle to focus", async () => {
    render(`<button id="elsewhere"></button>`);
    const elsewhere = document.querySelector<HTMLElement>("#elsewhere")!;
    elsewhere.focus();

    focusEditToggle();
    await nextTick();

    expect(document.activeElement).toBe(elsewhere);
  });
});

// Starting a save makes the wrapper inert, which drops focus to <body>; a failure leaves the bar
// mounted with nothing holding it, since edit mode never ends.
describe("focusSaveButton", () => {
  it("focuses the save button", async () => {
    render(`<button data-layout-save>Save layout</button>`);

    focusSaveButton();
    await nextTick();

    expect(document.activeElement).toBe(document.querySelector("[data-layout-save]"));
  });

  it("does nothing when the edit bar is gone", async () => {
    render(`<button id="elsewhere"></button>`);
    const elsewhere = document.querySelector<HTMLElement>("#elsewhere")!;
    elsewhere.focus();

    focusSaveButton();
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
    render(markup);

    focusBlockControl("orders");
    await nextTick();

    expect(document.activeElement?.tagName).toBe(tag);
    expect(document.activeElement).not.toBe(document.body);
  });

  it("leaves focus alone when the block is gone", async () => {
    render(`<div data-block-id="something-else" role="button" tabindex="0"></div>`);

    focusBlockControl("orders");
    await nextTick();

    expect(document.activeElement).toBe(document.body);
  });
});
