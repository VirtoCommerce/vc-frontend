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
- Schedules the next flush if new mutations arrived during the request

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

**Per-Operation State**: Each mutation type (operation name) maintains its own independent queue, timer, and in-flight state. `UpdateShortCartItemQuantity` doesn't interfere with other mutations.

---

## Developer Details

### Configuration

```typescript
createQueuedMutationsLink({
  targets: [
    {
      name: "UpdateShortCartItemQuantity",
      config: {
        debounceMs: 1000,
        mergeQueued: (variables1, variables2) => {
          // Custom merge variables logic
        }
      }
    }
  ]
})
```

### Target Config

- **`debounceMs`**: Wait time before flushing the queue (default: 1000ms)
- **`mergeQueued`**: Function to merge variables from multiple calls

### State Management

Each operation maintains:
- `inFlight`: Boolean tracking active network request
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

1. Add target to `queuedMutationsLink` configuration
2. Implement custom `mergeQueued` function if needed
3. Define appropriate `debounceMs` for your use case

