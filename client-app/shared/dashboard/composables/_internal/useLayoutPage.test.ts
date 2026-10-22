import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick } from "vue";
import { createFakeLayout, registerTestDashboard } from "../../layout-test-utils";
import { getBlockRegistry } from "../../registry";
import { useLayoutPage } from "./useLayoutPage";
import type { FakeLayoutType } from "../../layout-test-utils";
import type { SavedLayoutType } from "../../types";
import type { EffectScope } from "vue";

vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const SCOPE = "pageSpec";
registerTestDashboard(SCOPE);

// useLayoutPage registers watchers, so each call needs an owning scope, stopped after the test. Async because the
// layout is read first, as on a page: until then it cannot be edited.
let scopes: EffectScope[] = [];

async function withPage(layout: FakeLayoutType = createFakeLayout(SCOPE)) {
  const owner = effectScope();
  scopes.push(owner);
  const page = owner.run(() => useLayoutPage(layout))!;
  await flushPromises();
  return { layout, page };
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
    const { layout, page } = await withPage();
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
    const { page } = await withPage();
    page.startEdit();

    await page.save();
    await nextTick();
    await nextTick();

    expect(activeMarker()).toBe("layoutEditToggle");
  });

  // Nothing else tells a screen reader the surface changed, or that the arrow keys do anything.
  it("announces edit mode and the keyboard gesture on entry", async () => {
    const { page } = await withPage();

    page.startEdit();
    await nextTick();

    expect(page.message.value).toContain("shared.dashboard.editing");
    expect(page.message.value).toContain("shared.dashboard.hint_keyboard");
  });

  // VcAlert carries no live-region semantics, so without this a failed save is visual only.
  it("announces a failed save", async () => {
    const { layout, page } = await withPage();
    layout.failNextSave.value = true;
    page.startEdit();

    await page.save();
    await nextTick();

    expect(page.message.value).toContain("shared.dashboard.save_failed");
  });

  // Both widget columns share one tray, so a page reads them as a single list.
  it("gathers hidden widgets from both columns", async () => {
    const { page } = await withPage();
    page.startEdit();

    page.toggleHidden("list", true);
    page.toggleHidden("extra", true);

    expect(page.hiddenWidgets.value).toEqual(["list", "extra"]);
  });

  // The registry is the only place a block's props are declared, and the surface binds them blind. A
  // widget silently losing one (e.g. `filterable` on a list) drops a feature with nothing failing.
  it("hands a block its registry props, and an empty object when it has none", async () => {
    const { page } = await withPage();

    expect(page.propsOf("list")).toEqual({ filterable: true });
    expect(page.propsOf("notes")).toEqual({});
    // Stat blocks declare no `props` at all, and an unknown id must not throw.
    expect(page.propsOf("alpha")).toEqual({});
    expect(page.propsOf("nonexistent")).toEqual({});
  });

  it("resolves a widget's component from the registry, and none for a stat card or an unknown id", async () => {
    const { page } = await withPage();

    expect(page.componentOf("side")).toBeDefined();
    expect(page.componentOf("alpha")).toBeUndefined();
    expect(page.componentOf("nonexistent")).toBeUndefined();
  });
});

describe("useLayoutPage with every block hidden", () => {
  /** A saved document with every registered block hidden but the listed ones. */
  const savedShowing = (...visible: string[]): SavedLayoutType => ({
    regions: [
      { blocks: getBlockRegistry(SCOPE).map((block) => ({ type: block.id, hidden: !visible.includes(block.id) })) },
    ],
  });

  const allHiddenPage = () => withPage(createFakeLayout(SCOPE, { saved: savedShowing() }));

  // Where the empty state's actions send focus; `tabIndex` so jsdom lets a div take it, as the template does.
  function renderSurface(): void {
    const surface = document.createElement("div");
    surface.dataset.layoutSurface = "";
    surface.tabIndex = -1;
    document.body.append(surface);
  }

  // In edit mode the empty zones and the tray are the way back, so the empty state would only cover them.
  it("reports the surface empty outside edit mode only", async () => {
    const { page } = await allHiddenPage();
    expect(page.allHidden.value).toBe(true);

    page.startEdit();
    expect(page.allHidden.value).toBe(false);
  });

  it.each([
    ["a stat card", "alpha"],
    ["a main-column widget", "list"],
    ["a rail widget", "side"],
  ])("does not report a surface that still shows %s", async (_label, visibleId) => {
    const { page } = await withPage(createFakeLayout(SCOPE, { saved: savedShowing(visibleId) }));

    expect(page.allHidden.value).toBe(false);
  });

  it("announces a restore that saved and hands focus to the start of the surface", async () => {
    renderChrome();
    renderSurface();
    const { page } = await allHiddenPage();

    await page.restoreDefaults();
    await nextTick();
    await nextTick();

    expect(page.allHidden.value).toBe(false);
    expect(page.message.value).toBe("shared.dashboard.restored");
    expect(activeMarker()).toBe("layoutSurface");
  });

  it("leaves focus alone when the page is gone before a restore lands", async () => {
    renderSurface();
    const elsewhere = document.createElement("input");
    document.body.append(elsewhere);
    const layout = createFakeLayout(SCOPE, { saved: savedShowing() });
    await flushPromises();
    const land = layout.holdNextSave();

    const owner = effectScope();
    const page = owner.run(() => useLayoutPage(layout))!;
    const restoring = page.restoreDefaults();
    owner.stop();
    elsewhere.focus();

    land();
    await restoring;
    await nextTick();
    await nextTick();

    expect(document.activeElement).toBe(elsewhere);
    expect(page.message.value).toBe("");
  });

  // The failure lands in edit mode, whose entry announcement must not drown out the failure itself.
  it("announces a restore that failed and hands focus to Save", async () => {
    renderChrome();
    const { layout, page } = await allHiddenPage();
    layout.failNextSave.value = true;

    await page.restoreDefaults();
    await nextTick();
    await nextTick();

    expect(page.editing.value).toBe(true);
    expect(page.message.value).toBe("shared.dashboard.save_failed");
    expect(activeMarker()).toBe("layoutSave");
  });

  it("enters edit mode from the empty state with focus at the start of the surface", async () => {
    renderChrome();
    renderSurface();
    const { page } = await allHiddenPage();

    page.editFromEmpty();
    await nextTick();
    await nextTick();

    expect(page.editing.value).toBe(true);
    expect(activeMarker()).toBe("layoutSurface");
  });

  // Saving with every block hidden swaps the toggle for the empty state, so its Edit layout button is the only
  // control left to take focus — without it focus drops to <body>.
  it("hands focus to the empty state's Edit layout when edit mode ends on an empty surface", async () => {
    const emptyEdit = document.createElement("button");
    emptyEdit.dataset.layoutEmptyEdit = "";
    document.body.append(emptyEdit);
    const { page } = await allHiddenPage();
    page.startEdit();

    await expect(page.save()).resolves.toBe(true);
    await nextTick();
    await nextTick();

    expect(page.allHidden.value).toBe(true);
    expect(activeMarker()).toBe("layoutEmptyEdit");
  });
});
