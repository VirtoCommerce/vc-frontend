import { Observable, gql } from "@apollo/client/core";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AbortReason } from "@/core/api/common/enums";
import { useQueuedMutations } from "@/core/composables/useQueuedMutations";
import { createQueuedMutationsLink, createQueueTarget, DEFAULT_DEBOUNCE_MS } from "./queued-mutations";
import type { IQueueTargetConfig } from "./types";
import type { Operation, NextLink, ApolloLink } from "@apollo/client/core";

const MUTATION_QUERY = gql`
  mutation TestMutation($input: String!) {
    testMutation(input: $input) {
      success
    }
  }
`;

const NON_MUTATION_QUERY = gql`
  query TestQuery {
    test {
      id
    }
  }
`;

function createOperation(operationName: string, variables: Record<string, unknown> = {}): Operation {
  const _context: Record<string, unknown> = {};
  return {
    query: MUTATION_QUERY,
    operationName,
    variables,
    extensions: {},
    setContext: vi.fn((updater: (prev: Record<string, unknown>) => Record<string, unknown>) => {
      Object.assign(_context, updater(_context));
    }),
    getContext: vi.fn(() => _context),
  } as unknown as Operation;
}

function createForward(resolveImmediately = true): NextLink {
  return vi.fn(
    () =>
      new Observable((observer) => {
        if (resolveImmediately) {
          setTimeout(() => {
            observer.next({ data: { success: true } });
            observer.complete();
          }, 0);
        }
      }),
  ) as unknown as NextLink;
}

function subscribe(observable: Observable<unknown>) {
  const next = vi.fn();
  const error = vi.fn();
  const complete = vi.fn();
  const subscription = observable.subscribe({ next, error, complete });
  return { next, error, complete, subscription };
}

function enqueue(link: ApolloLink, forward: NextLink, operationName: string, variables: Record<string, unknown>) {
  const op = createOperation(operationName, variables);
  const obs = link.request(op, forward)!;
  return { operation: op, ...subscribe(obs) };
}

/** Advance past debounce + resolve the setTimeout(0) inside createForward */
async function flushAndResolve(debounceMs = DEFAULT_DEBOUNCE_MS) {
  await vi.advanceTimersByTimeAsync(debounceMs);
  await vi.advanceTimersByTimeAsync(1);
}

describe("createQueuedMutationsLink", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const { setQueuedTotal } = useQueuedMutations();
    setQueuedTotal(0);
  });

  afterEach(() => {
    // #8: defensive reset of global state
    const { setQueuedTotal } = useQueuedMutations();
    setQueuedTotal(0);
    vi.restoreAllMocks();
  });

  describe("passthrough", () => {
    it("should forward non-mutation operations unchanged", () => {
      const link = createQueuedMutationsLink({
        targets: [{ name: "TestMutation" }],
      });

      const operation = createOperation("TestQuery");
      // Override query to be a non-mutation
      (operation as unknown as { query: unknown }).query = NON_MUTATION_QUERY;

      const forward = vi.fn(() => Observable.of({ data: { test: true } })) as unknown as NextLink;
      link.request(operation, forward);

      expect(forward).toHaveBeenCalled();
    });

    it("should forward mutations not in targets list", () => {
      const link = createQueuedMutationsLink({
        targets: [{ name: "SomeOtherMutation" }],
      });

      const forward = vi.fn(() => Observable.of({ data: {} })) as unknown as NextLink;
      const op = createOperation("UnknownMutation", { a: 1 });
      link.request(op, forward);

      expect(forward).toHaveBeenCalled();
    });
  });

  describe("debouncing", () => {
    it("should not forward mutation immediately", () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = createForward();
      enqueue(link, forward, "TestMutation", { a: 1 });

      expect(forward).not.toHaveBeenCalled();
    });

    it("should forward mutation after debounce expires", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = createForward();
      enqueue(link, forward, "TestMutation", { a: 1 });

      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);

      expect(forward).toHaveBeenCalledTimes(1);
    });

    it("should use custom debounceMs", async () => {
      const link = createQueuedMutationsLink({
        targets: [{ name: "TestMutation", config: { debounceMs: 500 } }],
      });
      const forward = createForward();
      enqueue(link, forward, "TestMutation", { a: 1 });

      await vi.advanceTimersByTimeAsync(400);
      expect(forward).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(100);
      expect(forward).toHaveBeenCalledTimes(1);
    });

    it("should reset debounce timer on new enqueue", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = createForward();

      enqueue(link, forward, "TestMutation", { a: 1 });
      await vi.advanceTimersByTimeAsync(800);
      expect(forward).not.toHaveBeenCalled();

      enqueue(link, forward, "TestMutation", { a: 2 });
      await vi.advanceTimersByTimeAsync(800);
      expect(forward).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(200);
      expect(forward).toHaveBeenCalledTimes(1);
    });
  });

  describe("merging", () => {
    it("should merge variables with default strategy (spread)", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = createForward();

      enqueue(link, forward, "TestMutation", { a: 1, b: 2 });
      enqueue(link, forward, "TestMutation", { b: 3, c: 4 });

      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);

      expect(forward).toHaveBeenCalledTimes(1);
      expect((forward as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0].variables).toEqual({ a: 1, b: 3, c: 4 });
    });

    it("should accumulate correctly across 3+ calls with overlapping keys", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = createForward();

      enqueue(link, forward, "TestMutation", { a: 1 });
      enqueue(link, forward, "TestMutation", { a: 2 });
      enqueue(link, forward, "TestMutation", { a: 3 });

      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);

      expect((forward as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0].variables).toEqual({ a: 3 });
    });

    it("should use custom mergeQueued function", async () => {
      type Vars = { items: string[] };
      const config: IQueueTargetConfig<Vars> = {
        mergeQueued: (a, b) => ({ items: [...a.items, ...b.items] }),
      };

      const link = createQueuedMutationsLink({
        targets: [createQueueTarget("TestMutation", config)],
      });
      const forward = createForward();

      enqueue(link, forward, "TestMutation", { items: ["a"] });
      enqueue(link, forward, "TestMutation", { items: ["b", "c"] });

      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);

      expect((forward as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0].variables).toEqual({
        items: ["a", "b", "c"],
      });
    });

    it("should merge many calls into one request", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = createForward();

      for (let i = 0; i < 5; i++) {
        enqueue(link, forward, "TestMutation", { [`key${i}`]: i });
      }

      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);

      expect(forward).toHaveBeenCalledTimes(1);
      expect((forward as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0].variables).toEqual({
        key0: 0,
        key1: 1,
        key2: 2,
        key3: 3,
        key4: 4,
      });
    });
  });

  describe("observer notification", () => {
    it("should notify all queued observers on success", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = createForward();

      const sub1 = enqueue(link, forward, "TestMutation", { a: 1 });
      const sub2 = enqueue(link, forward, "TestMutation", { a: 2 });

      await flushAndResolve();

      expect(sub1.next).toHaveBeenCalledWith({ data: { success: true } });
      expect(sub1.complete).toHaveBeenCalled();
      expect(sub2.next).toHaveBeenCalledWith({ data: { success: true } });
      expect(sub2.complete).toHaveBeenCalled();
    });

    it("should notify all queued observers on error", async () => {
      const networkError = new Error("Network failure");
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = vi.fn(
        () =>
          new Observable((observer) => {
            setTimeout(() => observer.error(networkError), 0);
          }),
      ) as unknown as NextLink;

      const sub1 = enqueue(link, forward, "TestMutation", { a: 1 });
      const sub2 = enqueue(link, forward, "TestMutation", { a: 2 });

      await flushAndResolve();

      expect(sub1.error).toHaveBeenCalledWith(networkError);
      expect(sub2.error).toHaveBeenCalledWith(networkError);
    });

    // #12: complete is NOT called on error (Observable contract)
    it("should not call complete on error path", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = vi.fn(
        () =>
          new Observable((observer) => {
            setTimeout(() => observer.error(new Error("fail")), 0);
          }),
      ) as unknown as NextLink;

      const sub = enqueue(link, forward, "TestMutation", { a: 1 });

      await flushAndResolve();

      expect(sub.error).toHaveBeenCalled();
      expect(sub.complete).not.toHaveBeenCalled();
    });
  });

  describe("in-flight behavior", () => {
    it("should queue new mutations while one is in flight and flush after it completes", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });

      let resolveFirst!: () => void;
      const forward = vi.fn(
        () =>
          new Observable((observer) => {
            resolveFirst = () => {
              observer.next({ data: {} });
              observer.complete();
            };
          }),
      ) as unknown as NextLink;

      // First batch
      enqueue(link, forward, "TestMutation", { batch: 1 });
      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);
      expect(forward).toHaveBeenCalledTimes(1);

      // Enqueue while in flight
      enqueue(link, forward, "TestMutation", { batch: 2 });

      // Resolve first request — triggers scheduleNextFlush for queued batch
      resolveFirst();

      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);
      expect(forward).toHaveBeenCalledTimes(2);
      expect((forward as unknown as ReturnType<typeof vi.fn>).mock.calls[1][0].variables).toEqual({ batch: 2 });
    });

    it("should not flush while request is in flight", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = vi.fn(() => new Observable(() => {})) as unknown as NextLink; // never resolves

      enqueue(link, forward, "TestMutation", { a: 1 });
      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);
      expect(forward).toHaveBeenCalledTimes(1);

      // Enqueue while in flight
      enqueue(link, forward, "TestMutation", { a: 2 });
      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);

      // Should not send second request while first is in flight
      expect(forward).toHaveBeenCalledTimes(1);
    });

    // #5: queue works again after an error flush
    it("should continue processing after error", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });

      let callCount = 0;
      const forward = vi.fn(
        () =>
          new Observable((observer) => {
            callCount++;
            setTimeout(() => {
              if (callCount === 1) {
                observer.error(new Error("first fails"));
              } else {
                observer.next({ data: { recovered: true } });
                observer.complete();
              }
            }, 0);
          }),
      ) as unknown as NextLink;

      // First batch — will error
      const sub1 = enqueue(link, forward, "TestMutation", { a: 1 });
      await flushAndResolve();
      expect(sub1.error).toHaveBeenCalled();

      // Second batch after error — should work
      const sub2 = enqueue(link, forward, "TestMutation", { a: 2 });
      await flushAndResolve();
      expect(sub2.next).toHaveBeenCalledWith({ data: { recovered: true } });
      expect(sub2.complete).toHaveBeenCalled();
    });
  });

  describe("cleanup & cancellation", () => {
    it("should clear timer on unsubscribe", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = createForward();

      const { subscription } = enqueue(link, forward, "TestMutation", { a: 1 });
      subscription.unsubscribe();

      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);
      expect(forward).not.toHaveBeenCalled();
    });

    // #3: assert AbortReason.Explicit
    it("should abort in-flight request with AbortReason.Explicit on unsubscribe", async () => {
      const abortSpy = vi.spyOn(AbortController.prototype, "abort");

      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = vi.fn(() => new Observable(() => {})) as unknown as NextLink; // never resolves

      const { subscription } = enqueue(link, forward, "TestMutation", { a: 1 });

      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);
      expect(forward).toHaveBeenCalled();

      subscription.unsubscribe();
      expect(abortSpy).toHaveBeenCalledWith(AbortReason.Explicit);
    });

    // #6: abort signal is wired into operation context
    it("should inject abort signal into operation fetchOptions via setContext", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = vi.fn(() => new Observable(() => {})) as unknown as NextLink; // never resolves

      const { operation } = enqueue(link, forward, "TestMutation", { a: 1 });

      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);

      expect(operation.setContext).toHaveBeenCalled();
      const context = operation.getContext();
      expect(context.fetchOptions).toBeDefined();
      expect(context.fetchOptions.signal).toBeInstanceOf(AbortSignal);
    });

    // #11: unsubscribe one of many observers
    it("should clear timer for entire operation when any observer unsubscribes", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = createForward();

      enqueue(link, forward, "TestMutation", { a: 1 });
      const { subscription: sub2 } = enqueue(link, forward, "TestMutation", { a: 2 });

      // Unsubscribe the second observer — clears the timer for the whole operation
      sub2.unsubscribe();

      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);
      // Timer was cleared, so flush never fires
      expect(forward).not.toHaveBeenCalled();
    });
  });

  describe("queuedTotal integration", () => {
    it("should increment queuedTotal when enqueuing", () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = createForward();
      const { queuedTotal } = useQueuedMutations();

      expect(queuedTotal.value).toBe(0);

      enqueue(link, forward, "TestMutation", { a: 1 });
      expect(queuedTotal.value).toBe(1);

      enqueue(link, forward, "TestMutation", { a: 2 });
      expect(queuedTotal.value).toBe(2);
    });

    it("should reset queuedTotal to 0 after flush completes", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = createForward();
      const { queuedTotal } = useQueuedMutations();

      enqueue(link, forward, "TestMutation", { a: 1 });
      enqueue(link, forward, "TestMutation", { a: 2 });
      expect(queuedTotal.value).toBe(2);

      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);
      expect(queuedTotal.value).toBe(0);
    });

    it("should reflect hasQueuedMutations correctly", async () => {
      const link = createQueuedMutationsLink({ targets: [{ name: "TestMutation" }] });
      const forward = createForward();
      const { hasQueuedMutations } = useQueuedMutations();

      expect(hasQueuedMutations.value).toBe(false);

      enqueue(link, forward, "TestMutation", { a: 1 });
      expect(hasQueuedMutations.value).toBe(true);

      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);
      expect(hasQueuedMutations.value).toBe(false);
    });

    // #7: queuedTotal across multiple operation names
    it("should sum queuedTotal across different operation names", () => {
      const link = createQueuedMutationsLink({
        targets: [{ name: "MutationA" }, { name: "MutationB" }],
      });
      const forward = createForward();
      const { queuedTotal } = useQueuedMutations();

      enqueue(link, forward, "MutationA", { a: 1 });
      expect(queuedTotal.value).toBe(1);

      enqueue(link, forward, "MutationB", { b: 1 });
      expect(queuedTotal.value).toBe(2);

      enqueue(link, forward, "MutationA", { a: 2 });
      expect(queuedTotal.value).toBe(3);
    });
  });

  describe("independent operation queues", () => {
    it("should maintain separate queues per operation name", async () => {
      const link = createQueuedMutationsLink({
        targets: [
          { name: "MutationA", config: { debounceMs: 500 } },
          { name: "MutationB", config: { debounceMs: 1500 } },
        ],
      });
      const forward = createForward();

      enqueue(link, forward, "MutationA", { type: "A" });
      enqueue(link, forward, "MutationB", { type: "B" });

      await vi.advanceTimersByTimeAsync(500);
      expect(forward).toHaveBeenCalledTimes(1);
      expect((forward as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0].variables).toEqual({ type: "A" });

      await vi.advanceTimersByTimeAsync(1000);
      expect(forward).toHaveBeenCalledTimes(2);
      expect((forward as unknown as ReturnType<typeof vi.fn>).mock.calls[1][0].variables).toEqual({ type: "B" });
    });

    it("should merge independently per operation name", async () => {
      const link = createQueuedMutationsLink({
        targets: [{ name: "MutationA" }, { name: "MutationB" }],
      });
      const forward = createForward();

      enqueue(link, forward, "MutationA", { a: 1 });
      enqueue(link, forward, "MutationA", { a: 2 });
      enqueue(link, forward, "MutationB", { b: 10 });
      enqueue(link, forward, "MutationB", { b: 20 });

      await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_MS);

      expect(forward).toHaveBeenCalledTimes(2);
      const fwd = forward as unknown as ReturnType<typeof vi.fn>;
      const vars = fwd.mock.calls.map((c: unknown[]) => (c[0] as { variables: unknown }).variables);
      expect(vars).toContainEqual({ a: 2 });
      expect(vars).toContainEqual({ b: 20 });
    });
  });

  // #2: use createQueueTarget helper in tests
  describe("createQueueTarget", () => {
    it("should produce a valid target accepted by createQueuedMutationsLink", async () => {
      type Vars = { count: number };
      const config: IQueueTargetConfig<Vars> = {
        debounceMs: 200,
        mergeQueued: (a, b) => ({ count: a.count + b.count }),
      };

      const target = createQueueTarget("CountMutation", config);
      expect(target.name).toBe("CountMutation");
      expect(target.config).toBeDefined();

      // Verify it works end-to-end through the link
      const link = createQueuedMutationsLink({ targets: [target] });
      const forward = createForward();

      enqueue(link, forward, "CountMutation", { count: 1 });
      enqueue(link, forward, "CountMutation", { count: 2 });

      await vi.advanceTimersByTimeAsync(200);

      expect(forward).toHaveBeenCalledTimes(1);
      expect((forward as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0].variables).toEqual({ count: 3 });
    });
  });

  describe("heterogeneous targets", () => {
    it("should support targets with different variable types and custom merge per target", async () => {
      type VarsA = { items: string[] };
      type VarsB = { sections: number[] };

      const link = createQueuedMutationsLink({
        targets: [
          createQueueTarget<VarsA>("MutationA", {
            mergeQueued: (a, b) => ({ items: [...a.items, ...b.items] }),
          }),
          createQueueTarget<VarsB>("MutationB", {
            mergeQueued: (a, b) => ({ sections: [...a.sections, ...b.sections] }),
          }),
        ],
      });
      const forward = createForward();

      enqueue(link, forward, "MutationA", { items: ["x"] });
      enqueue(link, forward, "MutationA", { items: ["y"] });
      enqueue(link, forward, "MutationB", { sections: [1] });
      enqueue(link, forward, "MutationB", { sections: [2] });

      // #13: consistent flushAndResolve usage
      await flushAndResolve();

      expect(forward).toHaveBeenCalledTimes(2);
      const fwd = forward as unknown as ReturnType<typeof vi.fn>;
      const vars = fwd.mock.calls.map((c: unknown[]) => (c[0] as { variables: unknown }).variables);
      expect(vars).toContainEqual({ items: ["x", "y"] });
      expect(vars).toContainEqual({ sections: [1, 2] });
    });
  });
});
