import type { InjectionEvent } from "../types";

/**
 * Designed to sync the value type between `emit()` and `on()`.
 *
 * Example:
 *  const testEvent = "test_event" as InjectionEvent<boolean>;
 *
 *  broadcast.on(testEvent, (data) => {
 *    // The parameter `data` is of boolean type.
 *  });
 *
 *  broadcast.emit(testEvent, 123); // Error
 */

export const pageReloadEvent = "page_reload" as InjectionEvent<void>;
export const userReloadEvent = "user_reload" as InjectionEvent<void>;
