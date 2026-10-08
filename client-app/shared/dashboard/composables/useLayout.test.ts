import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { registerTestDashboard, TEST_STAT_IDS, TestWidget } from "../layout-test-utils";
import { getBlockRegistry, registerBlock } from "../registry";
import { createLayoutController, useLayout } from "./useLayout";
import type { LayoutControllerType, LayoutInputType, SavedLayoutType } from "../types";
import type { EffectScope } from "vue";

const api = vi.hoisted(() => ({ getLayout: vi.fn(), saveLayout: vi.fn() }));

vi.mock("@/core/api/graphql/account/queries/getLayout", () => ({ getLayout: api.getLayout }));
vi.mock("@/core/api/graphql/account/mutations/saveLayout", () => ({ saveLayout: api.saveLayout }));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store", cultureName: "en-US" } }));
vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));

// The synthetic dashboard: stat cards alpha..delta; `list` (rows 5 of 1..20, rule tabs) and `notes` in the wide
// column; `side` and `extra` in the rail.
const SCOPE = "controllerSpec";
registerTestDashboard(SCOPE);

const load = vi.fn<() => Promise<SavedLayoutType | null | undefined>>();
const save = vi.fn<(command: LayoutInputType) => Promise<SavedLayoutType | null | undefined>>();

// What a faithful backend stores and echoes: the command as sent.
const asStored = (command: LayoutInputType): SavedLayoutType => ({ regions: command.regions });

beforeEach(() => {
  load.mockReset().mockResolvedValue(null);
  save.mockReset().mockImplementation((command) => Promise.resolve(asStored(command)));
  api.getLayout.mockReset().mockResolvedValue(null);
  api.saveLayout.mockReset().mockImplementation((command: LayoutInputType) => Promise.resolve(asStored(command)));
});

// The controller creates computeds, so each one gets an owning scope, stopped after the test.
let scopes: EffectScope[] = [];

afterEach(() => {
  scopes.forEach((owner) => owner.stop());
  scopes = [];
});

function owned<T>(create: () => T): T {
  const owner = effectScope();
  scopes.push(owner);
  return owner.run(create)!;
}

function controller(): LayoutControllerType {
  return owned(() =>
    createLayoutController({ scope: SCOPE, storeId: "B2B-store", load, save, defaults: () => getBlockRegistry(SCOPE) }),
  );
}

/** A controller whose read has landed — the state a page edits in. */
async function readController(): Promise<LayoutControllerType> {
  const layout = controller();
  await flushPromises();
  return layout;
}

/** A save that stays in flight until released, holding `saving` on meanwhile. */
function holdSave(): (echo?: SavedLayoutType | null) => void {
  let release: (echo?: SavedLayoutType | null) => void = () => {};
  save.mockImplementationOnce(
    (command) =>
      new Promise((resolve) => {
        release = (echo) => resolve(echo === undefined ? asStored(command) : echo);
      }),
  );
  return (echo) => release(echo);
}

const sentCommand = () => save.mock.calls[0][0];
const sentBlock = (id: string) =>
  sentCommand()
    .regions.flatMap((region) => region.blocks)
    .find((b) => b.type === id);

/** The command as sent, with one block's `hidden` flipped — an echo that disagrees on exactly one flag. */
function echoWithFlippedHidden(command: LayoutInputType, id: string): SavedLayoutType {
  return {
    regions: command.regions.map((region) => ({
      ...region,
      blocks: region.blocks.map((block) => (block.type === id ? { ...block, hidden: !block.hidden } : block)),
    })),
  };
}

describe("createLayoutController: the read", () => {
  // The page hands this object to <LayoutSurface> and to its statistics composables; both read the scope off it.
  it("names the dashboard it drives", () => {
    expect(controller().scope).toBe(SCOPE);
  });

  it("reads the document once, at once, and is neither settled nor editable while that read is in flight", () => {
    load.mockReturnValue(new Promise(() => {}));

    const { settled, loading, canEdit } = controller();

    expect(load).toHaveBeenCalledTimes(1);
    expect(settled.value).toBe(false);
    expect(loading.value).toBe(true);
    expect(canEdit.value).toBe(false);
  });

  // `null` is the never-saved case: the defaults are the arrangement, and the statistics queries may go.
  it("is settled once the read lands, saved document or not", async () => {
    const { settled, loading } = await readController();

    expect(settled.value).toBe(true);
    expect(loading.value).toBe(false);
  });

  // The cards stay fed behind the load-failed alert rather than sitting empty forever.
  it("is settled by a failed read too, over the defaults", async () => {
    load.mockRejectedValue(new Error("network"));

    const { settled, state } = await readController();

    expect(settled.value).toBe(true);
    expect(state.value.regions.mainRight.visible).toEqual(["side", "extra"]);
  });

  it("falls back to the defaults when the user never saved this dashboard", async () => {
    const { state } = await readController();

    expect(state.value.regions.statistics.visible).toEqual(TEST_STAT_IDS);
    expect(state.value.regions.mainLeft.visible).toEqual(["list", "notes"]);
    expect(state.value.regions.mainRight.visible).toEqual(["side", "extra"]);
  });

  it("applies a saved arrangement over the defaults", async () => {
    load.mockResolvedValue({
      regions: [
        {
          blocks: [
            { type: "extra", hidden: false },
            { type: "side", hidden: true },
          ],
        },
      ],
    });

    const { state } = await readController();

    expect(state.value.regions.mainRight.visible).toEqual(["extra"]);
    expect(state.value.regions.mainRight.hidden).toEqual(["side"]);
  });

  // The registry is reactive and read on every use, so a block a module registers later still joins the layout.
  it("follows a block registered after it was created", async () => {
    const scope = "controllerSpecLate";
    registerTestDashboard(scope);
    const layout = owned(() => createLayoutController({ scope, load, save, defaults: () => getBlockRegistry(scope) }));
    await flushPromises();

    registerBlock(scope, { id: "late", region: "mainRight", titleKey: "test.late", order: 30, component: TestWidget });

    expect(layout.visibleIn("mainRight")).toEqual(["side", "extra", "late"]);
  });

  it("blocks editing when the read failed, so a full-replace save cannot clobber an unread layout", async () => {
    load.mockRejectedValue(new Error("boom"));

    const { canEdit, startEdit, editing } = await readController();

    expect(canEdit.value).toBe(false);
    startEdit();
    expect(editing.value).toBe(false);
  });

  // The surface renders the defaults and drops the edit button when the read fails; without this flag there is
  // nothing to tell the user why, so it reads as their arrangement having been lost.
  it("reports a failed read so the surface can explain itself", async () => {
    load.mockRejectedValue(new Error("boom"));

    expect((await readController()).loadFailed.value).toBe(true);
  });

  it("does not report a failed read for the ordinary never-saved case, which stays editable", async () => {
    const { loadFailed, canEdit, startEdit, editing } = await readController();

    expect(loadFailed.value).toBe(false);
    expect(canEdit.value).toBe(true);
    startEdit();
    expect(editing.value).toBe(true);
  });
});

describe("createLayoutController: the draft", () => {
  it("keeps draft edits out of the live layout until saved", async () => {
    const { state, startEdit, setHidden, cancel } = await readController();
    startEdit();
    setHidden("side", true);

    expect(state.value.regions.mainRight.hidden).toContain("side");

    cancel();
    expect(state.value.regions.mainRight.visible).toContain("side");
  });

  // The surface renders components only for `visibleIn(...)`; the hidden tray renders names alone. A hidden
  // widget therefore never mounts, so it never issues its query.
  it("drops a hidden widget out of the rendered set entirely", async () => {
    const { startEdit, setHidden, visibleIn, hiddenIn } = await readController();
    startEdit();
    setHidden("list", true);

    expect(visibleIn("mainLeft")).toEqual(["notes"]);
    expect(hiddenIn("mainLeft")).toEqual(["list"]);
  });

  // A cross-zone drag reports where it was dropped; without it the block lands wherever its old position fell.
  it("places a hidden block at the dropped position rather than its old slot", async () => {
    const { startEdit, setHidden, hiddenIn } = await readController();
    startEdit();

    setHidden("extra", true);
    setHidden("side", true, 0);

    expect(hiddenIn("mainRight")).toEqual(["side", "extra"]);
  });

  it("appends to the destination half when no position is given", async () => {
    const { startEdit, setHidden, hiddenIn } = await readController();
    startEdit();

    setHidden("extra", true);
    setHidden("side", true);

    expect(hiddenIn("mainRight")).toEqual(["extra", "side"]);
  });

  // The block is not in the source half, so there is nothing to move — a keypress must not relocate it.
  it("ignores a toggle to the state a block is already in", async () => {
    const { startEdit, setHidden, visibleIn } = await readController();
    startEdit();
    const before = [...visibleIn("mainRight")];

    setHidden(before[0], false, 1);

    expect(visibleIn("mainRight")).toEqual(before);
  });

  it("keeps the visible half intact when the hidden half is reordered", async () => {
    const { startEdit, setHidden, reorderHidden, visibleIn, hiddenIn } = await readController();
    startEdit();
    setHidden("extra", true);
    setHidden("side", true);

    reorderHidden("mainRight", ["side", "extra"]);

    expect(hiddenIn("mainRight")).toEqual(["side", "extra"]);
    expect(visibleIn("mainRight")).toEqual([]);
    expect(visibleIn("mainLeft")).toEqual(["list", "notes"]);
  });

  it("lets a parked block come back after the visible half has been reordered", async () => {
    const { startEdit, setHidden, reorderVisible, visibleIn, hiddenIn } = await readController();
    startEdit();
    setHidden("side", true);

    reorderVisible("mainRight", [...visibleIn("mainRight")]);
    setHidden("side", false);

    expect(hiddenIn("mainRight")).toEqual([]);
    expect(visibleIn("mainRight")).toEqual(["extra", "side"]);
  });

  it("refills the draft from the defaults on reset, without persisting on its own", async () => {
    load.mockResolvedValue({
      regions: [
        {
          blocks: [
            { type: "extra", hidden: false },
            { type: "side", hidden: false },
          ],
        },
      ],
    });

    const { state, startEdit, reset, cancel } = await readController();
    startEdit();
    reset();

    expect(state.value.regions.mainRight.visible).toEqual(["side", "extra"]);
    expect(save).not.toHaveBeenCalled();

    // Cancelling after a reset returns to what is actually stored.
    cancel();
    expect(state.value.regions.mainRight.visible).toEqual(["extra", "side"]);
  });

  // Settings ride the same draft as the arrangement, so Cancel / Reset / Save cover them with no second state machine.
  it("keeps a settings edit in the draft only, so cancel discards it", async () => {
    const { startEdit, updateSettings, cancel, settingsOf } = await readController();
    startEdit();
    updateSettings("list", { maxRows: 9, hiddenTabs: ["New"] });

    expect(settingsOf("list")).toMatchObject({ maxRows: 9, hiddenTabs: ["New"] });

    cancel();
    expect(settingsOf("list")).toMatchObject({ maxRows: 5, hiddenTabs: [] });
  });

  // A row cap is a query variable, so widgets fetch with the saved value and it applies on save.
  it("keeps the saved row cap visible to widgets while the draft holds a different one", async () => {
    const { startEdit, updateSettings, settingsOf, persistedSettingsOf } = await readController();
    startEdit();
    updateSettings("list", { maxRows: 20 });

    expect(settingsOf("list").maxRows).toBe(20);
    expect(persistedSettingsOf("list").maxRows).toBe(5);
  });

  it("restores the registry default row cap on reset", async () => {
    load.mockResolvedValue({
      regions: [{ blocks: [{ type: "list", hidden: false, settings: [{ key: "maxRows", value: 12 }] }] }],
    });

    const { startEdit, reset, settingsOf } = await readController();
    expect(settingsOf("list").maxRows).toBe(12);

    startEdit();
    reset();
    expect(settingsOf("list").maxRows).toBe(5);
  });

  // An unknown id would create an entry the serializer drops — a change that never persists.
  it("ignores settings for a block that declares none", async () => {
    const { startEdit, updateSettings, settingsOf } = await readController();
    startEdit();

    updateSettings("notes", { maxRows: 3 });

    expect(settingsOf("notes")).toEqual({ hiddenTabs: [] });
  });
});

describe("createLayoutController: the save", () => {
  it("sends the complete document — every region, hidden blocks included", async () => {
    const { startEdit, setHidden, save: saveLayout } = await readController();
    startEdit();
    setHidden("side", true);

    await saveLayout();

    const command = sentCommand();
    expect(command).toMatchObject({ scope: SCOPE, storeId: "B2B-store", schemaVersion: 1 });
    expect(command.regions.map((region) => region.id)).toEqual(["statistics", "mainLeft", "mainRight"]);
    expect(sentBlock("side")?.hidden).toBe(true);
    expect(sentBlock("alpha")?.hidden).toBe(false);
  });

  it("leaves edit mode after a successful save", async () => {
    const { startEdit, save: saveLayout, editing, saveFailed } = await readController();
    startEdit();

    await expect(saveLayout()).resolves.toBe(true);
    expect(editing.value).toBe(false);
    expect(saveFailed.value).toBe(false);
  });

  it("keeps the draft and stays in edit mode when the save fails", async () => {
    save.mockRejectedValue(new Error("network"));

    const { startEdit, setHidden, save: saveLayout, editing, state, saveFailed } = await readController();
    startEdit();
    setHidden("side", true);

    await expect(saveLayout()).resolves.toBe(false);
    expect(editing.value).toBe(true);
    expect(saveFailed.value).toBe(true);
    expect(state.value.regions.mainRight.hidden).toContain("side");
  });

  // Reconciling a missing document yields the defaults, so trusting it would replace the arrangement with the
  // defaults and still report success.
  it("treats a response without a document as a failed save", async () => {
    save.mockResolvedValue(null);

    const { startEdit, setHidden, save: saveLayout, editing, saveFailed, state } = await readController();
    startEdit();
    setHidden("side", true);

    await expect(saveLayout()).resolves.toBe(false);
    expect(editing.value).toBe(true);
    expect(saveFailed.value).toBe(true);
    expect(state.value.regions.mainRight.hidden).toContain("side");
  });

  // No read follows a successful save, so the echo — not what was sent — is what the user ends up looking at. It
  // agrees on every flag, so ORDER is what proves it drives the state.
  it("reconciles the saved layout from the echoed document", async () => {
    save.mockImplementation((command) =>
      Promise.resolve({
        regions: command.regions.map((region) =>
          region.id === "mainRight" ? { ...region, blocks: [...region.blocks].reverse() } : region,
        ),
      }),
    );

    const { startEdit, save: saveLayout, state } = await readController();
    startEdit();
    expect(state.value.regions.mainRight.visible).toEqual(["side", "extra"]);

    await expect(saveLayout()).resolves.toBe(true);
    expect(state.value.regions.mainRight.visible).toEqual(["extra", "side"]);
  });

  // A document is not enough to trust — reconciling a partial one fills the gaps from the defaults, which silently
  // replaces the arrangement while reporting success.
  it("refuses the save and reads the document again when the echo is missing blocks that were sent", async () => {
    save.mockResolvedValue({ regions: [] });

    const { startEdit, setHidden, save: saveLayout, state, saveFailed, editing } = await readController();
    startEdit();
    setHidden("side", true);

    await expect(saveLayout()).resolves.toBe(false);

    // The draft survives, so the user can retry rather than lose the edit.
    expect(state.value.regions.mainRight.hidden).toContain("side");
    expect(editing.value).toBe(true);
    expect(saveFailed.value).toBe(true);
    // Neither side is trusted; the stored document is what resolves the disagreement.
    expect(load).toHaveBeenCalledTimes(2);
  });

  // Every block comes back, so a presence-only check passes, but one `hidden` is inverted.
  it("refuses the save when the echo contradicts a hidden flag", async () => {
    save.mockImplementation((command) => Promise.resolve(echoWithFlippedHidden(command, "side")));

    const { startEdit, setHidden, save: saveLayout, hiddenIn, saveFailed } = await readController();
    startEdit();
    setHidden("side", true);

    await expect(saveLayout()).resolves.toBe(false);

    expect(hiddenIn("mainRight")).toEqual(["side"]);
    expect(saveFailed.value).toBe(true);
    expect(load).toHaveBeenCalledTimes(2);
  });

  // Re-reading flips the read flag, and the surface swaps the whole layout for the skeleton while `loading` is on —
  // which mid-edit would unmount the edit bar and the draft's focus with it.
  it("does not blank the surface while it reads the document again", async () => {
    save.mockResolvedValue({ regions: [] });

    const { startEdit, save: saveLayout, loading, editing, canEdit } = await readController();
    load.mockReturnValue(new Promise(() => {}));
    startEdit();

    await expect(saveLayout()).resolves.toBe(false);

    expect(loading.value).toBe(false);
    expect(editing.value).toBe(true);
    // Not until the stored document is known again: a second save must not replace what nobody has seen.
    expect(canEdit.value).toBe(false);
  });

  it("survives a second read that fails", async () => {
    save.mockResolvedValue({ regions: [] });

    const { startEdit, save: saveLayout, saveFailed, editing } = await readController();
    load.mockRejectedValue(new Error("offline"));
    startEdit();

    await expect(saveLayout()).resolves.toBe(false);
    await flushPromises();

    expect(saveFailed.value).toBe(true);
    expect(editing.value).toBe(true);
  });

  // `save` snapshots the payload synchronously and clears the draft when it resolves, so an edit made mid-flight
  // would be written to a document nobody sends and then discarded.
  it("refuses draft edits while a save is in flight", async () => {
    const release = holdSave();
    const { startEdit, setHidden, reorderVisible, reset, save: saveLayout, state, saving } = await readController();
    startEdit();
    setHidden("side", true);

    const sent = { ...state.value.regions.mainRight };
    const pending = saveLayout();
    expect(saving.value).toBe(true);

    // Each of these would otherwise land visibly — `reset` most of all, wiping the arrangement to the defaults in
    // front of the user — only to be thrown away when the save resolves.
    reset();
    setHidden("extra", true);
    reorderVisible("mainRight", ["extra"]);

    expect(state.value.regions.mainRight).toEqual(sent);

    release();
    await expect(pending).resolves.toBe(true);
    expect(saving.value).toBe(false);
    // The saved arrangement survived; none of the mid-flight calls left a mark.
    expect(state.value.regions.mainRight.visible).toEqual(["extra"]);
    expect(state.value.regions.mainRight.hidden).toEqual(["side"]);
  });

  it("sends the drafted settings, not the defaults the document was read with", async () => {
    const { startEdit, updateSettings, save: saveLayout, settingsOf } = await readController();
    startEdit();
    updateSettings("list", { maxRows: 3, hiddenTabs: ["New"] });

    await expect(saveLayout()).resolves.toBe(true);
    expect(sentBlock("list")?.settings).toEqual([
      { key: "maxRows", value: 3 },
      { key: "tab.New", value: false },
    ]);
    // The echo agreed, so the saved state carries the choice rather than reverting to the default.
    expect(settingsOf("list")).toMatchObject({ maxRows: 3, hiddenTabs: ["New"] });
  });

  it("refuses a settings edit while a save is in flight", async () => {
    const release = holdSave();
    const { startEdit, updateSettings, save: saveLayout, settingsOf } = await readController();
    startEdit();
    const pending = saveLayout();

    updateSettings("list", { maxRows: 17 });
    expect(settingsOf("list").maxRows).toBe(5);

    release();
    await expect(pending).resolves.toBe(true);
    expect(settingsOf("list").maxRows).toBe(5);
  });

  // The breadcrumbs sit outside the surface's `inert` wrapper, so a route guard can call `save` again while the
  // first one is still in flight — a second full-document replace of the same document.
  it("refuses a second save while one is in flight", async () => {
    holdSave();
    const { startEdit, save: saveLayout } = await readController();
    startEdit();

    void saveLayout();
    await expect(saveLayout()).resolves.toBe(false);

    expect(save).toHaveBeenCalledTimes(1);
  });

  it("does nothing without a draft", async () => {
    const { save: saveLayout } = await readController();

    await expect(saveLayout()).resolves.toBe(false);
    expect(save).not.toHaveBeenCalled();
  });

  // Otherwise a previous failure's alert sits over a freshly rebuilt draft.
  it("clears a failed-save alert when the draft is reset", async () => {
    save.mockRejectedValue(new Error("network"));

    const { startEdit, save: saveLayout, reset, saveFailed } = await readController();
    startEdit();

    await saveLayout();
    expect(saveFailed.value).toBe(true);

    reset();
    expect(saveFailed.value).toBe(false);
  });
});

// The controller over the backend: what it reads, what it sends, and that neither names a user — the backend takes
// the user from the token (dashboard-operations.test.ts pins the operations themselves).
describe("useLayout", () => {
  it("reads the scope's document for the current store, and nothing else", async () => {
    owned(() => useLayout(SCOPE));
    await flushPromises();

    expect(api.getLayout).toHaveBeenCalledTimes(1);
    expect(api.getLayout).toHaveBeenCalledWith({ scope: SCOPE, storeId: "B2B-store" });
  });

  it("reconciles the document against the blocks registered under the scope", async () => {
    api.getLayout.mockResolvedValue({ regions: [{ blocks: [{ type: "notes", hidden: true }] }] });

    const { visibleIn, hiddenIn } = owned(() => useLayout(SCOPE));
    await flushPromises();

    expect(visibleIn("statistics")).toEqual(TEST_STAT_IDS);
    expect(visibleIn("mainLeft")).toEqual(["list"]);
    expect(hiddenIn("mainLeft")).toEqual(["notes"]);
  });

  it("falls back to the registry defaults when the user never saved", async () => {
    const { visibleIn } = owned(() => useLayout(SCOPE));
    await flushPromises();

    expect(visibleIn("mainLeft")).toEqual(["list", "notes"]);
    expect(visibleIn("mainRight")).toEqual(["side", "extra"]);
  });

  it("saves the whole document in the InputLayout shape, with no user in it", async () => {
    const { startEdit, setHidden, save: saveLayout } = owned(() => useLayout(SCOPE));
    await flushPromises();
    startEdit();
    setHidden("notes", true);

    await expect(saveLayout()).resolves.toBe(true);

    expect(api.saveLayout).toHaveBeenCalledTimes(1);
    const command = api.saveLayout.mock.calls[0][0] as LayoutInputType;
    expect(new Set(Object.keys(command))).toEqual(new Set(["regions", "schemaVersion", "scope", "storeId"]));
    expect(command).toMatchObject({ scope: SCOPE, storeId: "B2B-store", schemaVersion: 1 });
    const blocks = command.regions.flatMap((region) => region.blocks);
    const registered = [...TEST_STAT_IDS, "list", "notes", "side", "extra"];
    expect(blocks).toHaveLength(registered.length);
    expect(new Set(blocks.map((block) => block.type))).toEqual(new Set(registered));
    for (const block of blocks) {
      expect(new Set(Object.keys(block))).toEqual(new Set(["hidden", "id", "settings", "type"]));
    }
    expect(blocks.find((block) => block.type === "notes")?.hidden).toBe(true);
  });

  it("surfaces a failed read without throwing", async () => {
    api.getLayout.mockRejectedValue(new Error("offline"));

    const { loadFailed, settled } = owned(() => useLayout(SCOPE));
    await flushPromises();

    expect(loadFailed.value).toBe(true);
    expect(settled.value).toBe(true);
  });
});
