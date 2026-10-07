import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick } from "vue";
import { createFakeLayout, registerTestDashboard } from "../../layout-test-utils";
import { useLayoutPage } from "./useLayoutPage";
import type { FakeLayoutType } from "../../layout-test-utils";
import type { EffectScope } from "vue";

vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const SCOPE = "pageSpec";
registerTestDashboard(SCOPE);

// useLayoutPage registers watchers, so each call needs an owning scope, stopped after the test.
let scopes: EffectScope[] = [];

function withPage(layout: FakeLayoutType = createFakeLayout(SCOPE)) {
  const owner = effectScope();
  scopes.push(owner);
  return { layout, page: owner.run(() => useLayoutPage(layout))! };
}

afterEach(() => {
  scopes.forEach((owner) => owner.stop());
  scopes = [];
  document.body.replaceChildren();
});

// The edit bar and the toggle are never mounted together, which is the whole reason focus has to be
// handed between them; a test needs both present to prove the right one is chosen.
function renderChrome(): void {
  const save = document.createElement("button");
  save.dataset.layoutSave = "";
  const toggle = document.createElement("button");
  toggle.dataset.layoutEditToggle = "";
  document.body.append(save, toggle);
}

const activeMarker = () =>
  document.activeElement instanceof HTMLElement ? Object.keys(document.activeElement.dataset)[0] : undefined;

describe("useLayoutPage", () => {
  // Starting a save makes the wrapper inert, dropping focus to <body>. On success edit mode ends and
  // the toggle reclaims it; a failure keeps the bar mounted, so nothing else would.
  it("returns focus to Save when a save fails", async () => {
    renderChrome();
    const { layout, page } = withPage();
    layout.failNextSave.value = true;
    page.startEdit();

    await page.save();
    await nextTick();
    await nextTick();

    expect(page.editing.value).toBe(true);
    expect(activeMarker()).toBe("layoutSave");
  });

  it("returns focus to the edit toggle when edit mode ends", async () => {
    renderChrome();
    const { page } = withPage();
    page.startEdit();

    await page.save();
    await nextTick();
    await nextTick();

    expect(activeMarker()).toBe("layoutEditToggle");
  });

  // Nothing else tells a screen reader the surface changed, or that the arrow keys do anything.
  it("announces edit mode and the keyboard gesture on entry", async () => {
    const { page } = withPage();

    page.startEdit();
    await nextTick();

    expect(page.message.value).toContain("shared.dashboard.editing");
    expect(page.message.value).toContain("shared.dashboard.hint_keyboard");
  });

  // VcAlert carries no live-region semantics, so without this a failed save is visual only.
  it("announces a failed save", async () => {
    const { layout, page } = withPage();
    layout.failNextSave.value = true;
    page.startEdit();

    await page.save();
    await nextTick();

    expect(page.message.value).toContain("shared.dashboard.save_failed");
  });

  // Both widget columns share one tray, so a page reads them as a single list.
  it("gathers hidden widgets from both columns", () => {
    const { page } = withPage();
    page.startEdit();

    page.toggleHidden("list", true);
    page.toggleHidden("extra", true);

    expect(page.hiddenWidgets.value).toEqual(["list", "extra"]);
  });

  // The registry is the only place a block's props are declared, and the surface binds them blind. A
  // widget silently losing one (e.g. `filterable` on a list) drops a feature with nothing failing.
  it("hands a block its registry props, and an empty object when it has none", () => {
    const { page } = withPage();

    expect(page.propsOf("list")).toEqual({ filterable: true });
    expect(page.propsOf("notes")).toEqual({});
    // Stat blocks declare no `props` at all, and an unknown id must not throw.
    expect(page.propsOf("alpha")).toEqual({});
    expect(page.propsOf("nonexistent")).toEqual({});
  });

  it("resolves a widget's component from the registry, and none for a stat card or an unknown id", () => {
    const { page } = withPage();

    expect(page.componentOf("side")).toBeDefined();
    expect(page.componentOf("alpha")).toBeUndefined();
    expect(page.componentOf("nonexistent")).toBeUndefined();
  });
});
