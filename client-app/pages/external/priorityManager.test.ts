import { describe, it, expect } from "vitest";
import { getVisiblePreviewer } from "./priorityManager";
import type { PreviewerStateType } from "./priorityManager";

describe("getVisiblePreviewer", () => {
  it("returns null if all previewers are inactive", () => {
    const test1: PreviewerStateType[] = [
      {
        id: "builderIo",
        priority: 2,
        state: "initial",
        isActive: false,
      },
      {
        id: "someOther",
        priority: 3,
        state: "initial",
        isActive: false,
      },
      {
        id: "slugContent",
        priority: 1,
        state: "initial",
        isActive: false,
      },
    ];
    expect(getVisiblePreviewer(test1)).toBe(null);
  });

  it("returns null if all elements has 'empty' state", () => {
    const test2: PreviewerStateType[] = [
      {
        id: "builderIo",
        priority: 2,
        state: "empty",
        isActive: true,
      },
      {
        id: "slugContent",
        priority: 1,
        state: "empty",
        isActive: true,
      },
    ];

    expect(getVisiblePreviewer(test2)).toBe(null);
  });

  it("returns previewer id if it has highest priority and 'ready' state", () => {
    const test3: PreviewerStateType[] = [
      {
        id: "builderIo",
        priority: 2,
        state: "loading",
        isActive: true,
      },
      {
        id: "slugContent",
        priority: 1,
        state: "ready",
        isActive: true,
      },
    ];

    expect(getVisiblePreviewer(test3)).toBe("slugContent");
  });

  it("should return 'loader' if every previewers has 'initial' state", () => {
    const test4: PreviewerStateType[] = [
      {
        id: "builderIo",
        priority: 2,
        state: "initial",
        isActive: true,
      },
      {
        id: "slugContent",
        priority: 1,
        state: "initial",
        isActive: true,
      },
    ];

    expect(getVisiblePreviewer(test4)).toBe("loader");
  });

  it("should return 'loader' if highest priority has 'loading' state", () => {
    const test5: PreviewerStateType[] = [
      {
        id: "builderIo",
        priority: 2,
        state: "loading",
        isActive: true,
      },
      {
        id: "slugContent",
        priority: 1,
        state: "empty",
        isActive: true,
      },
    ];

    expect(getVisiblePreviewer(test5)).toBe("loader");
  });

  it("should return 'loader' if highest priority has 'loading' state and other is 'ready'", () => {
    const test6: PreviewerStateType[] = [
      {
        id: "builderIo",
        priority: 2,
        state: "ready",
        isActive: true,
      },
      {
        id: "slugContent",
        priority: 1,
        state: "loading",
        isActive: true,
      },
    ];

    expect(getVisiblePreviewer(test6)).toBe("loader");
  });
});
