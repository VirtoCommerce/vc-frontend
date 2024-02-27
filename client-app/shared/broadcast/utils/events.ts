import type { InjectionEvent, ProductInWishlistEventDataType } from "../types";

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
export const cacheReloadEvent = "cache_reload" as InjectionEvent<void>;
export const userReloadEvent = "user_reload" as InjectionEvent<void>;
export const userLockedEvent = "user_locked" as InjectionEvent<void>;
export const cartChangedEvent = "cart_changed" as InjectionEvent<void>;
export const productsInWishlistEvent = "products_in_wishlist" as InjectionEvent<ProductInWishlistEventDataType[]>;
export const unauthorizedErrorEvent = "unauthorized_error" as InjectionEvent<void>;
export const unhandledErrorEvent = "unhandled_error" as InjectionEvent<void>;
export const openReturnUrl = "open_return_url" as InjectionEvent<void>;
export const forbiddenEvent = "forbidden" as InjectionEvent<void>;
export const passwordExpiredEvent = "password_expired" as InjectionEvent<void>;
