import { readonly, shallowRef, triggerRef } from "vue";
import _ from "lodash";
import { INotification, INotificationExtended } from "@/shared/notification";

const stack = shallowRef<INotificationExtended[]>([]);

async function show(options: INotification) {
  const id = _.uniqueId();
  const notification: INotificationExtended = {
    id,
    closeButton: true,
    type: "alert",
    ...options,
  };

  await notification.beforeOpen?.(id);

  if (notification.duration) {
    notification.autoCloseTimeout = window.setTimeout(() => close(id), notification.duration);
  }

  stack.value.push(notification);
  triggerRef(stack);
}

async function close(id: string) {
  const index = stack.value.findIndex((item) => item.id === id);

  if (index === -1) return;

  const { autoCloseTimeout, beforeClose, onClose } = stack.value[index];

  clearTimeout(autoCloseTimeout);

  await beforeClose?.();

  stack.value.splice(index, 1);
  triggerRef(stack);

  await onClose?.();
}

function clear(group?: string) {
  stack.value = group ? stack.value.filter((item) => item.group !== group) : [];
}

function success(options: Omit<INotification, "type">) {
  return show({
    ...options,
    type: "success",
  });
}

function warning(options: Omit<INotification, "type">) {
  return show({
    ...options,
    type: "warning",
  });
}

function error(options: Omit<INotification, "type">) {
  return show({
    ...options,
    type: "danger",
  });
}

export default function useNotifications() {
  return {
    show,
    success,
    warning,
    error,
    close,
    clear,
    stack: readonly(stack),
  };
}
