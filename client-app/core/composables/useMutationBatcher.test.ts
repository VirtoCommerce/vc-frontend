import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DEFAULT_DEBOUNCE_IN_MS } from "@/shared/cart/constants";
import { useMutationBatcher, getMergeStrategyUniqueBy } from "./useMutationBatcher";

const DUMMY_TEXT_ARGUMENTS = { data: "test" };
const INITIAL_DELAY_MS = DEFAULT_DEBOUNCE_IN_MS;
const SHORT_INITIAL_DELAY_MS = DEFAULT_DEBOUNCE_IN_MS / 2;
const SIMULATED_REQUEST_DURATION_MS = DEFAULT_DEBOUNCE_IN_MS;
const TOTAL_PROCESSING_DELAY_MS = INITIAL_DELAY_MS + SIMULATED_REQUEST_DURATION_MS;
const MUTATION_OVERRIDE_OPTIONS = {
  context: { fetchOptions: { signal: expect.any(AbortSignal) } },
};

const mutationMock = (value: unknown) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, SIMULATED_REQUEST_DURATION_MS);
  });

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

  it("should generate a unique id for each instance", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { id: id1 } = useMutationBatcher(mutation);
    const { id: id2 } = useMutationBatcher(mutation);

    expect(id1).not.toEqual(id2);
    expect(typeof id1).toBe("string");
    expect(typeof id2).toBe("string");
  });

  it("should call one mutation after delay", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation);
    void add(DUMMY_TEXT_ARGUMENTS);
    expect(mutation).not.toBeCalled();
    vi.advanceTimersByTime(INITIAL_DELAY_MS);
    expect(mutation).toBeCalledWith(DUMMY_TEXT_ARGUMENTS, MUTATION_OVERRIDE_OPTIONS);
  });

  it("should return value from mutation", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation);
    const promise = add(DUMMY_TEXT_ARGUMENTS);
    vi.advanceTimersByTime(TOTAL_PROCESSING_DELAY_MS);
    void expect(promise).resolves.toEqual(DUMMY_TEXT_ARGUMENTS);
  });

  it("should apply debounce option correctly", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation, { debounce: SHORT_INITIAL_DELAY_MS });
    void add(DUMMY_TEXT_ARGUMENTS);
    expect(mutation).not.toBeCalled();
    vi.advanceTimersByTime(SHORT_INITIAL_DELAY_MS);
    expect(mutation).toBeCalled();
  });

  it("should abort previous pending mutation when add new", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation);
    void add(DUMMY_TEXT_ARGUMENTS);
    await vi.advanceTimersByTimeAsync(INITIAL_DELAY_MS);
    void add(DUMMY_TEXT_ARGUMENTS);
    await vi.advanceTimersByTimeAsync(INITIAL_DELAY_MS);
    void add(DUMMY_TEXT_ARGUMENTS);
    expect(abortSpy).toBeCalledTimes(2);
  });

  it("should abort previous mutation if batch is overflowed", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add, overflowed } = useMutationBatcher(mutation, { maxLength: 1 });
    void add(DUMMY_TEXT_ARGUMENTS);
    await vi.advanceTimersByTimeAsync(INITIAL_DELAY_MS);
    void add(DUMMY_TEXT_ARGUMENTS);
    expect(overflowed.value).toBe(true);
    expect(abortSpy).toBeCalled();
  });

  it("should set correct overflowed state", async () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add, overflowed } = useMutationBatcher(mutation, { maxLength: 1 });
    expect(overflowed.value).toBe(false);
    void add(getTestArguments("product_id_1"));
    expect(overflowed.value).toBe(true);
    await vi.advanceTimersByTimeAsync(TOTAL_PROCESSING_DELAY_MS);
    expect(overflowed.value).toBe(false);
  });

  it("should call mutation with batched arguments", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add } = useMutationBatcher(mutation);
    void add(getTestArguments("product_id_1"));
    void add(getTestArguments("product_id_1"));
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
      mergeStrategy: (a, b) => {
        const itemA = a?.command?.cartItems?.[0];
        const itemB = b?.command?.cartItems?.[0];
        const sum = itemA?.productId === itemB.productId ? itemA.quantity + itemB.quantity : itemB.quantity;
        return { command: { cartItems: [{ productId: itemB.productId, quantity: sum }] } };
      },
    });
    void add(getTestArguments("product_id_1"));
    void add(getTestArguments("product_id_1"));
    void add(getTestArguments("product_id_1"));
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
    void add1(getTestArguments("product_id_1"));
    void add1(getTestArguments("product_id_1"));
    expect(overflowed1.value).toBe(true);
    expect(overflowed2.value).toBe(false);
    vi.advanceTimersByTime(INITIAL_DELAY_MS);
    expect(mutation1).toBeCalled();
    expect(mutation2).not.toBeCalled();
    void add2(getTestArguments("product_id_2"));
    vi.advanceTimersByTime(INITIAL_DELAY_MS);
    expect(mutation2).toBeCalled();
  });

  it("should set loading to true when mutation starts and to false after mutation is done", async () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add, loading } = useMutationBatcher(mutation);

    expect(loading.value).toBe(false);

    const promise = add(DUMMY_TEXT_ARGUMENTS);
    vi.advanceTimersByTime(DEFAULT_DEBOUNCE_IN_MS);

    expect(loading.value).toBe(true);

    vi.advanceTimersByTime(INITIAL_DELAY_MS);
    await promise;

    expect(loading.value).toBe(false);
  });

  it("should set loading to false if mutation throws an error", async () => {
    const mutation = vi.fn().mockRejectedValue(new Error("Test Error"));
    const { add, loading } = useMutationBatcher(mutation);

    expect(loading.value).toBe(false);

    const promise = add(DUMMY_TEXT_ARGUMENTS);

    vi.advanceTimersByTime(DEFAULT_DEBOUNCE_IN_MS);
    expect(loading.value).toBe(true);

    vi.advanceTimersByTime(INITIAL_DELAY_MS);

    await expect(promise).rejects.toThrow("Test Error");

    expect(loading.value).toBe(false);
  });

  it("should handle multiple instances with independent loading states", async () => {
    const mutation1 = vi.fn().mockImplementation(mutationMock);
    const mutation2 = vi.fn().mockImplementation(mutationMock);

    const { add: add1, loading: loading1 } = useMutationBatcher(mutation1, { debounce: SHORT_INITIAL_DELAY_MS });
    const { add: add2, loading: loading2 } = useMutationBatcher(mutation2, { debounce: SHORT_INITIAL_DELAY_MS });

    expect(loading1.value).toBe(false);
    expect(loading2.value).toBe(false);

    add1(DUMMY_TEXT_ARGUMENTS);
    add2(DUMMY_TEXT_ARGUMENTS);

    vi.advanceTimersByTime(DEFAULT_DEBOUNCE_IN_MS);
    vi.advanceTimersByTime(DEFAULT_DEBOUNCE_IN_MS);

    expect(loading1.value).toBe(true);
    expect(loading2.value).toBe(true);

    vi.advanceTimersByTime(SHORT_INITIAL_DELAY_MS);

    await vi.runAllTimersAsync();

    expect(loading1.value).toBe(false);
    expect(loading2.value).toBe(false);
  });

  it("should abort the mutation when abort is called", () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add, abort } = useMutationBatcher(mutation);

    void add(DUMMY_TEXT_ARGUMENTS);
    vi.advanceTimersByTime(SIMULATED_REQUEST_DURATION_MS);

    abort();

    expect(abortSpy).toBeCalled();
  });

  it("should reset count when abort is called with resetCount option and not reset count otherwise", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add, abort, overflowed } = useMutationBatcher(mutation, { maxLength: 2 });

    void add(DUMMY_TEXT_ARGUMENTS);
    void add(DUMMY_TEXT_ARGUMENTS);
    expect(overflowed.value).toBe(true);

    abort();
    void add(DUMMY_TEXT_ARGUMENTS);
    expect(overflowed.value).toBe(false);

    abort();

    void add(DUMMY_TEXT_ARGUMENTS);
    void add(DUMMY_TEXT_ARGUMENTS);
    expect(overflowed.value).toBe(true);

    abort({ resetCount: false });
    void add(DUMMY_TEXT_ARGUMENTS);
    expect(overflowed.value).toBe(true);
  });

  it("should update the arguments ref after adding a mutation", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const { add, arguments: batchArguments } = useMutationBatcher(mutation);

    const testArgs = getTestArguments("product_id_1");
    void add(testArgs);

    expect(batchArguments.value).toEqual(testArgs);
  });

  it("should call the onAddHandler when a new mutation is added", () => {
    const mutation = vi.fn().mockImplementation(mutationMock);
    const onAddHandlerMock = vi.fn();
    const { add, registerOnAddHandler } = useMutationBatcher(mutation);

    registerOnAddHandler(onAddHandlerMock);

    const testArgs = getTestArguments("product_id_1");
    void add(testArgs);

    expect(onAddHandlerMock).toBeCalledWith(expect.any(String), testArgs);
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
