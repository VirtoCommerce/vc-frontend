import _ from "lodash";
import { computed, shallowRef, triggerRef } from "vue";
import type { CloseNotificationHandle, INotification, INotificationExtended } from "@/shared/notification";

const stack = shallowRef<INotificationExtended[]>([]);

/**
 * @private
 */
function open(options: INotificationExtended): CloseNotificationHandle {
  const id = _.uniqueId();
  const notification: INotificationExtended = {
    id,
    closeButton: true,
    type: "info",
    ...options,
  };

  if (notification.single) {
    clear();
  }

  if (notification.singleGroup) {
    clear(notification.group, true);
  }

  if (notification.singleInGroup) {
    clear(notification.group);
  }

  if (notification.duration) {
    notification.autoCloseTimeout = window.setTimeout(() => close(id), notification.duration);
  }

  stack.value.push(notification);
  triggerRef(stack);

  return () => close(id);
}

function close(id: string) {
  const index = stack.value.findIndex((item) => item.id === id);

  if (index === -1) {
    return;
  }

  const { autoCloseTimeout } = stack.value[index];

  clearTimeout(autoCloseTimeout);

  stack.value.splice(index, 1);
  triggerRef(stack);
}

function clear(group?: string, exclude?: boolean) {
  stack.value = group
    ? stack.value.filter((item: INotificationExtended) => (exclude ? item.group === group : item.group !== group))
    : [];
}

function info(options: INotification) {
  return open(options);
}

function success(options: INotification) {
  return open({
    ...options,
    type: "success",
  });
}

function warning(options: INotification) {
  return open({
    ...options,
    type: "warning",
  });
}

function error(options: INotification) {
  return open({
    ...options,
    type: "danger",
  });
}

export function useNotifications() {
  return {
    info,
    success,
    warning,
    error,
    close,
    clear,
    stack: computed(() => stack.value),
  };
}
