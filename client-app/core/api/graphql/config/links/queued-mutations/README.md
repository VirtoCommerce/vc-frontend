# Queued Mutations Link

## What It Does

Batches multiple identical mutations into a single network request, making your app faster and more efficient.

**Example:** User adds 5 items of Product A to cart, then 3 items of Product B, then changes Product A quantity to 2. Instead of 3 separate requests, the link sends just **one merged request** with the final state.

## How It Works

### Step-by-Step Flow

#### 1. Mutation Call Initiated
When you call a mutation (e.g., `updateCartItemQuantity()`), Apollo Client passes it through the link chain. The queued mutations link intercepts operations matching its configured targets.

#### 2. Apollo Observable Created
The link returns an **Apollo Observable** - a lazy, cancellable stream that represents the eventual result. Each mutation call provides an observer object with three methods:
- `next(result)` - receives the mutation result
- `complete()` - signals successful completion
- `error(err)` - handles failures

#### 3. Observer Enqueued
Instead of immediately forwarding the mutation to the network, the link:
- Stores the observer directly in the operation's state queue
- Merges the new variables with any existing queued variables using the custom `mergeQueued` function
- Increments the global `queuedTotal` counter
- Schedules a flush after the debounce period

#### 4. Debounce Timer
A timer starts (default: 1000ms). If another mutation of the same type arrives during this period:
- The timer resets
- Variables are merged again
- The new observer is added to the queue

This continues until the timer expires without interruption.

#### 5. Flush Triggered
When the debounce timer expires and no request is in flight:
- Takes a snapshot of all queued observers
- Takes the final merged variables
- Clears the queue for the next batch
- Sets `inFlight = true`
- Creates an `AbortController` for cancellation
- Updates the global `queuedTotal` counter

#### 6. Network Request
The link:
- Updates the operation's variables with the merged values
- Injects the abort signal into the fetch options
- Calls `forward(operation)` - passing control to the next link in the chain (typically the HTTP link)

#### 7. Response Handling
When the server responds:
- Sets `inFlight = false`
- Notifies **all queued observers** with the result by calling their `next()` and `complete()` methods
- Each original caller receives the same response
- If `flushNow` was requested while the request was in flight, drains the queued batch **immediately** (no debounce); otherwise schedules the next flush on the normal debounce if new mutations arrived during the request

#### 8. Error Handling
On network errors:
- Sets `inFlight = false`
- Calls the `error()` method on all queued observers
- Each caller can handle the error independently
- Schedules the next flush for any new mutations

#### 9. Cleanup & Cancellation
If an observer unsubscribes (e.g., component unmounts):
- Clears any pending timers
- Aborts in-flight requests via `AbortController`
- Prevents orphaned network requests

### Key Concepts

**Apollo Link Chain**: Mutations flow through a chain of links (auth → retry → queued → http). Each link can inspect, modify, or intercept operations before passing them forward.

**Observable Pattern**: Apollo uses Observables for lazy execution and cancellation. Subscriptions start when you `.subscribe()`, and cleanup happens when you unsubscribe.

**Per-Operation State**: Each mutation type (operation name) maintains its own independent queue, timer, and in-flight state. `UpdateShortCartItemQuantity` doesn't interfere with other mutations. When a target declares a `getPartitionKey` (see below), state is keyed by `"opName:partition"` so each partition is independent too.

---

## Partition Keys

By default there is **one queue per operation name**, so every call to an operation shares one debounce timer and one merge buffer - even when they edit different entities (e.g. different cart line items). That means one edit can reset another's timer, and both edits are merged into a single request.

Declaring a `getPartitionKey` splits the operation into **independent queues, one per key** (own timer, own observers, own merge buffer):

```ts
createQueueTarget("UpdateCartItem", {
  getPartitionKey: (vars) => vars.command.lineItemId, // "A", "B", ...
});
```

Now `UpdateCartItem({ lineItemId: "A" })` and `UpdateCartItem({ lineItemId: "B" })` are fully independent - A is never delayed by B, and each request carries exactly one line item.

- Omit `getPartitionKey` and behavior is identical to before (one shared queue per operation name).
- Returning an **empty string** routes to the operation's **default queue** - the same one reachable via `flushNow(opName)` without a partition key. Empty and non-empty keys never collide.

## `flushNow` Escape Hatch

A queued mutation normally fires only after its debounce elapses. Sometimes you need it committed *now* - e.g. the user blurs an input or navigates away.

`createQueuedMutationsController(config)` returns the link **plus** a `flushNow`:

```ts
const { link, flushNow } = createQueuedMutationsController({ targets });

// e.g. on input blur - don't wait out the debounce:
flushNow("UpdateCartItem", lineItemId); // cancel the timer, send the merged payload now
```

Semantics:

- **No-op** if nothing is queued for that operation/partition.
- If **no request is in flight**, it cancels the debounce timer and sends the merged payload immediately.
- If a **request is already in flight** for that queue, it never sends a second request in parallel. Instead the pending batch is drained **immediately once the in-flight request settles** (with no additional debounce).
- `createQueuedMutationsLink` remains a thin wrapper over the controller's `link`, so existing imports need no changes.

---

## Developer Details

### Configuration

```typescript
const myConfig: IQueueTargetConfig<MyMutationVariables> = {
  debounceMs: 1000,
  mergeQueued: (a, b) => {
    // Custom merge logic with full type safety for MyMutationVariables
    return { ...a, ...b };
  },
};

createQueuedMutationsLink({
  targets: [
    createQueueTarget("MyMutation", myConfig),
  ],
})
```

The `createQueueTarget` helper preserves type safety for each target's `mergeQueued` function while allowing heterogeneous targets (different mutation variable types) in the same config array.

### Target Config

- **`debounceMs`**: Wait time before flushing the queue (default: 1000ms)
- **`mergeQueued`**: Function to merge variables from multiple calls
- **`getPartitionKey`**: Optional. Extracts a partition key from the variables so one operation runs several independent queues (see [Partition Keys](#partition-keys)). Returning an empty string uses the default queue.

### State Management

Each operation (or partition) maintains:
- `inFlight`: Boolean tracking active network request
- `flushRequested`: Boolean set by `flushNow` while a request is in flight, so the queued batch drains immediately on settle instead of rescheduling
- `observers`: Array of observer objects (each with `next`, `complete`, `error` methods) waiting for response
- `mergedVariables`: Accumulated variables from all queued calls
- `abortController`: Handles request cancellation

### Abort Handling

Mutations are automatically aborted when:
- Observer unsubscribes
- New mutations arrive for queued operations

### Queue Tracking

The link exposes `queuedTotal` via `useQueuedMutations()` composable for UI feedback (e.g., blocking route changes while there are queued mutations in flight).

### Adding New Mutations

1. Define a typed config: `const myConfig: IQueueTargetConfig<MyMutationVariables> = { ... }`
2. Implement custom `mergeQueued` function if needed
3. Add target using `createQueueTarget("MyMutation", myConfig)` to the `queuedMutationsLink` targets array
4. Define appropriate `debounceMs` for your use case

