import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createLayoutController } from "./composables/useLayout";
import { createFakeLayout, registerTestDashboard } from "./layout-test-utils";

vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));

// Spied, not replaced: the fake must run the real factory.
vi.mock("./composables/useLayout", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./composables/useLayout")>();
  return { ...actual, createLayoutController: vi.fn(actual.createLayoutController) };
});

const SCOPE = "fakeSpec";
registerTestDashboard(SCOPE);

// The engine's specs drive the fake, so what they prove holds for a real dashboard only while the fake IS the real
// state machine with in-memory storage — not a second implementation of it.
describe("createFakeLayout", () => {
  it("is createLayoutController over in-memory storage", () => {
    createFakeLayout(SCOPE);

    expect(createLayoutController).toHaveBeenCalledWith(expect.objectContaining({ scope: SCOPE }));
  });

  it("stores a save as sent, so its echo always agrees", async () => {
    const layout = createFakeLayout(SCOPE);
    await flushPromises();
    layout.startEdit();
    layout.setHidden("side", true);

    await expect(layout.save()).resolves.toBe(true);
    expect(layout.hiddenIn("mainRight")).toEqual(["side"]);
  });

  it("refuses the next save when asked to, keeping the draft", async () => {
    const layout = createFakeLayout(SCOPE);
    await flushPromises();
    layout.failNextSave.value = true;
    layout.startEdit();

    await expect(layout.save()).resolves.toBe(false);
    expect(layout.saveFailed.value).toBe(true);
    expect(layout.editing.value).toBe(true);
  });
});
