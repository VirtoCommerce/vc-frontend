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

export const dataChangedEvent = "data_changed" as string;
export const pageReloadEvent = "page_reload" as string;
export const userReloadEvent = "user_reload" as string;
export const userBeforeUnauthorizeEvent = "user_before_unauthorize" as string;
export const userLockedEvent = "user_locked" as string;
export const cartReloadEvent = "cart_reload" as string;
export const unauthorizedErrorEvent = "unauthorized_error" as string;
export const unhandledErrorEvent = "unhandled_error" as string;
export const openReturnUrl = "open_return_url" as string;
export const forbiddenEvent = "forbidden" as string;
export const passwordExpiredEvent = "password_expired" as string;
export const reloadAndOpenMainPage = "reload_and_open_main_page" as string;
export const graphqlErrorEvent = "graphql_error" as string;
