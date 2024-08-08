import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DEFAULT_DEBOUNCE_IN_MS } from "@/shared/cart/constants";
import { useMutationBatcher } from "./useMutationBatcher";

const mutationMock = (value: unknown) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, DEFAULT_DEBOUNCE_IN_MS);
  });

const INITIAL_DELAY_MS = DEFAULT_DEBOUNCE_IN_MS;
const SHORT_INITIAL_DELAY_MS = DEFAULT_DEBOUNCE_IN_MS / 2;
const SIMULATED_REQUEST_DURATION_MS = DEFAULT_DEBOUNCE_IN_MS;
const TOTAL_PROCESSING_DELAY_MS = INITIAL_DELAY_MS + SIMULATED_REQUEST_DURATION_MS;
const MUTATION_OVERRIDE_OPTIONS = {
  context: { fetchOptions: { signal: expect.any(AbortSignal) } },
};

const getTestArguments = (productId: string) => ({ command: { cartItems: [{ productId, quantity: 1 }] } });

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
    add(getTestArguments("product_id_1"));
    expect(mutation).not.toBeCalled();
    vi.advanceTimersByTime(INITIAL_DELAY_MS);
    expect(mutation).toBeCalledWith(getTestArguments("product_id_1"), MUTATION_OVERRIDE_OPTIONS);
  });

  it("should return value from mutation", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation);
    const promise = add({ data: "test" });
    vi.advanceTimersByTime(TOTAL_PROCESSING_DELAY_MS);
    expect(promise).resolves.toEqual({ data: "test" });
  });

  it("should apply debounce option correctly", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation, { debounce: SHORT_INITIAL_DELAY_MS });
    add(getTestArguments("product_id_1"));
    expect(mutation).not.toBeCalled();
    vi.advanceTimersByTime(SHORT_INITIAL_DELAY_MS);
    expect(mutation).toBeCalled();
  });

  it("should abort previous pending mutation when add new", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation);
    add(getTestArguments("product_id_1"));
    await vi.advanceTimersByTimeAsync(INITIAL_DELAY_MS);
    add(getTestArguments("product_id_2"));
    await vi.advanceTimersByTimeAsync(INITIAL_DELAY_MS);
    add(getTestArguments("product_id_3"));
    expect(abortSpy).toBeCalledTimes(2);
  });

  it("should abort previous mutation if batch is overflowed", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add, overflowed } = useMutationBatcher(mutation, { maxLength: 1 });
    add(getTestArguments("product_id_1"));
    await vi.advanceTimersByTimeAsync(INITIAL_DELAY_MS);
    add(getTestArguments("product_id_2"));
    expect(overflowed.value).toBe(true);
    expect(abortSpy).toBeCalled();
  });

  it("should set correct overflowed state", async () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add, overflowed } = useMutationBatcher(mutation, { maxLength: 1 });
    add(getTestArguments("product_id_1"));
    add(getTestArguments("product_id_2"));
    expect(overflowed.value).toBe(true);
    await vi.advanceTimersByTimeAsync(TOTAL_PROCESSING_DELAY_MS);
    expect(overflowed.value).toBe(false);
  });

  it("should call mutation with batched arguments", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation);
    add(getTestArguments("product_id_1"));
    add(getTestArguments("product_id_2"));
    add(getTestArguments("product_id_3"));
    vi.advanceTimersByTime(INITIAL_DELAY_MS);
    expect(mutation).toBeCalledWith(
      {
        command: {
          cartItems: [
            { productId: "product_id_1", quantity: 1 },
            { productId: "product_id_2", quantity: 1 },
            { productId: "product_id_3", quantity: 1 },
          ],
        },
      },
      MUTATION_OVERRIDE_OPTIONS,
    );
  });
});
