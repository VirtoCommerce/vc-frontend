import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DEFAULT_DEBOUNCE_IN_MS } from "@/shared/cart/constants";
import { useMutationBatcher, getMergeStrategyUniqueBy } from "./useMutationBatcher";

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

const getTestArguments = (productId: string, quantity: number = 1) => ({
  command: { cartItems: [{ productId, quantity: quantity }] },
});

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
    add(getTestArguments("product_id_1"));
    vi.advanceTimersByTime(INITIAL_DELAY_MS);
    expect(mutation).toBeCalledWith(
      {
        command: {
          cartItems: [
            { productId: "product_id_1", quantity: 1 },
            { productId: "product_id_1", quantity: 1 },
          ],
        },
      },
      MUTATION_OVERRIDE_OPTIONS,
    );
  });

  it("should apply custom merge strategy", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation, {
      merge: (a, b) => {
        const itemA = a?.command?.cartItems?.[0];
        const itemB = b?.command?.cartItems?.[0];
        const sum = itemA?.productId === itemB.productId ? itemA.quantity + itemB.quantity : itemB.quantity;
        return { command: { cartItems: [{ productId: itemB.productId, quantity: sum }] } };
      },
    });
    add(getTestArguments("product_id_1"));
    add(getTestArguments("product_id_1"));
    add(getTestArguments("product_id_1"));
    vi.advanceTimersByTime(INITIAL_DELAY_MS);
    expect(mutation).toBeCalledWith(
      {
        command: {
          cartItems: [{ productId: "product_id_1", quantity: 3 }],
        },
      },
      MUTATION_OVERRIDE_OPTIONS,
    );
  });

  it("should handle instances independently", () => {
    const mutation1 = vi.fn().mockImplementation(mutationMock);
    const mutation2 = vi.fn().mockImplementation(mutationMock);
    const { add: add1, overflowed: overflowed1 } = useMutationBatcher(mutation1, {
      maxLength: 1,
    });
    const { add: add2, overflowed: overflowed2 } = useMutationBatcher(mutation2);
    add1(getTestArguments("product_id_1"));
    add1(getTestArguments("product_id_1"));
    expect(overflowed1.value).toBe(true);
    expect(overflowed2.value).toBe(false);
    vi.advanceTimersByTime(INITIAL_DELAY_MS);
    expect(mutation1).toBeCalled();
    expect(mutation2).not.toBeCalled();
    add2(getTestArguments("product_id_2"));
    vi.advanceTimersByTime(INITIAL_DELAY_MS);
    expect(mutation2).toBeCalled();
  });
});

describe("getMergeStrategyUniqueBy", () => {
  it("should merge items with the same productId", () => {
    const a = getTestArguments("product_id_1", 1);
    const b = getTestArguments("product_id_1", 2);
    const c = getTestArguments("product_id_2", 3);
    const mergeStrategy = getMergeStrategyUniqueBy("productId");
    const result = mergeStrategy(a, b);
    expect(result).toEqual({ command: { cartItems: [{ productId: "product_id_1", quantity: 2 }] } });
    const result2 = mergeStrategy(result, c);
    expect(result2).toEqual({
      command: {
        cartItems: [
          { productId: "product_id_1", quantity: 2 },
          { productId: "product_id_2", quantity: 3 },
        ],
      },
    });
  });
});
