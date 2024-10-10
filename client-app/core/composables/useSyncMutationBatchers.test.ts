import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSyncMutationBatchers } from "./useSyncMutationBatchers";
import type { useMutationBatcher } from "./useMutationBatcher";
import type { Mock } from "vitest";

type MutationBatcherType = ReturnType<typeof useMutationBatcher>;

describe("useSyncMutationBatchers", () => {
  let mockBatcher1: MutationBatcherType;
  let mockBatcher2: MutationBatcherType;
  let callback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockBatcher1 = {
      id: "batcher1",
      registerOnAddHandler: vi.fn(),
    } as unknown as MutationBatcherType;

    mockBatcher2 = {
      id: "batcher2",
      registerOnAddHandler: vi.fn(),
    } as unknown as MutationBatcherType;

    callback = vi.fn();
  });

  it("should register onAddHandler for both batchers", () => {
    useSyncMutationBatchers(mockBatcher1, mockBatcher2, callback);
    expect(mockBatcher1.registerOnAddHandler).toHaveBeenCalledTimes(1);
    expect(mockBatcher2.registerOnAddHandler).toHaveBeenCalledTimes(1);
  });

  it("should call callback with batcher1 as currentBatcher when mutation is added to batcher1", () => {
    useSyncMutationBatchers(mockBatcher1, mockBatcher2, callback);
    const handler = (mockBatcher1.registerOnAddHandler as Mock).mock.calls[0][0];
    handler("batcher1", { test: "data" });
    expect(callback).toHaveBeenCalledWith({
      args: { test: "data" },
      currentBatcher: mockBatcher1,
      anotherBatcher: mockBatcher2,
    });
  });

  it("should call callback with batcher2 as currentBatcher when mutation is added to batcher2", () => {
    useSyncMutationBatchers(mockBatcher1, mockBatcher2, callback);
    const handler = (mockBatcher2.registerOnAddHandler as Mock).mock.calls[0][0];
    handler("batcher2", { test: "data2" });
    expect(callback).toHaveBeenCalledWith({
      args: { test: "data2" },
      currentBatcher: mockBatcher2,
      anotherBatcher: mockBatcher1,
    });
  });

  it("should handle multiple calls to the add handler", () => {
    useSyncMutationBatchers(mockBatcher1, mockBatcher2, callback);
    const handler1 = (mockBatcher1.registerOnAddHandler as Mock).mock.calls[0][0];
    const handler2 = (mockBatcher2.registerOnAddHandler as Mock).mock.calls[0][0];

    handler1("batcher1", { test: "data1" });
    expect(callback).toHaveBeenCalledWith({
      args: { test: "data1" },
      currentBatcher: mockBatcher1,
      anotherBatcher: mockBatcher2,
    });

    handler2("batcher2", { test: "data2" });
    expect(callback).toHaveBeenCalledWith({
      args: { test: "data2" },
      currentBatcher: mockBatcher2,
      anotherBatcher: mockBatcher1,
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
