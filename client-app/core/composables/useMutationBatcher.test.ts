import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DEFAULT_DEBOUNCE_IN_MS } from "@/shared/cart/constants";
import { useMutationBatcher } from "./useMutationBatcher";

const mutationMock = () =>
  new Promise((resolve) => {
    setTimeout(resolve, DEFAULT_DEBOUNCE_IN_MS);
  });

const INITIAL_DELAY_MS = DEFAULT_DEBOUNCE_IN_MS;
const SHORT_INITIAL_DELAY_MS = DEFAULT_DEBOUNCE_IN_MS / 2;
const SIMULATED_REQUEST_DURATION_MS = DEFAULT_DEBOUNCE_IN_MS;
const TOTAL_PROCESSING_DELAY_MS = INITIAL_DELAY_MS + SIMULATED_REQUEST_DURATION_MS;

describe("useMutationBatcher", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call one mutation after delay", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation);
    add("test");
    expect(mutation).not.toBeCalled();
    vi.advanceTimersByTime(INITIAL_DELAY_MS);
    expect(mutation).toBeCalledWith([["test"]], { context: { signal: expect.any(AbortSignal) } });
  });

  it("should apply debounce option correctly", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation, { debounce: SHORT_INITIAL_DELAY_MS });
    add("test");
    expect(mutation).not.toBeCalled();
    vi.advanceTimersByTime(SHORT_INITIAL_DELAY_MS);
    expect(mutation).toBeCalled();
  });

  it("should abort previous pending mutation when add new", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation);
    add("test1");
    await vi.advanceTimersByTimeAsync(INITIAL_DELAY_MS / 2);
    add("test2");
    expect(abortSpy).toBeCalled();
  });

  it("should abort previous mutation if batch is overflowed", () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add, overflowed } = useMutationBatcher(mutation, { maxLength: 1 });
    add("test1");
    add("test2");
    expect(overflowed.value).toBe(true);
    expect(abortSpy).toBeCalled();
  });

  it("should set correct overflowed state", async () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add, overflowed } = useMutationBatcher(mutation, { maxLength: 1 });
    add("test1");
    add("test2");
    expect(overflowed.value).toBe(true);
    await vi.advanceTimersByTimeAsync(TOTAL_PROCESSING_DELAY_MS);
    expect(overflowed.value).toBe(false);
  });

  it("should call mutation with batched arguments", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation);
    add("test1");
    add("test2");
    add("test3");
    vi.advanceTimersByTime(INITIAL_DELAY_MS);
    expect(mutation).toBeCalledWith([["test1"], ["test2"], ["test3"]], {
      context: { signal: expect.any(AbortSignal) },
    });
  });
});
