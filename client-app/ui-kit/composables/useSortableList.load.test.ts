import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useSortableList } from "./useSortableList";
import type { EffectScope } from "vue";

// Its own file: the first load of SortableJS fails here, and the module keeps its loader between tests.
const loads = vi.hoisted(() => ({ failures: 1, built: [] as HTMLElement[] }));
vi.mock("sortablejs", () => {
  if (loads.failures > 0) {
    loads.failures -= 1;
    throw new Error("Failed to fetch dynamically imported module");
  }
  return {
    default: class {
      option = vi.fn();
      destroy = vi.fn();
      constructor(el: HTMLElement) {
        loads.built.push(el);
      }
    },
  };
});

const scopes: EffectScope[] = [];

afterEach(() => {
  scopes.splice(0).forEach((scope) => scope.stop());
});

function mountList(el: HTMLElement) {
  const scope = effectScope();
  scopes.push(scope);
  return scope.run(() => useSortableList(ref(el), { name: "main", items: () => ["a"], onReorder: vi.fn() }))!;
}

describe("useSortableList — a failed SortableJS load", () => {
  it("keeps the keyboard, and lets the next list load it again", async () => {
    const first = document.createElement("div");
    const list = mountList(first);
    await vi.dynamicImportSettled();

    list.itemAttrs("a").onKeydown!({ key: " ", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(list.isGrabbed("a")).toBe(true);
    expect(loads.built).toEqual([]);

    const second = document.createElement("div");
    mountList(second);
    await vi.dynamicImportSettled();

    expect(loads.built).toEqual([second]);
  });
});
