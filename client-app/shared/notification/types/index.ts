import { Component } from "vue";
import { ComponentObjectPropsOptions } from "@vue/runtime-core";
import { RouteLocationRaw } from "vue-router";

export type NotificationCustomButton = {
  text?: string;
  html?: string;
  classes?: string;
  to?: RouteLocationRaw;
  clickHandler?: (notificationId: string, event: Event) => void;
};

export interface INotification {
  id?: string;
  text?: string;
  html?: string;
  classes?: string;
  group?: string;

  /**
   * @default alert
   */
  type?: "primary" | "secondary" | "alert" | "success" | "warning" | "danger";

  /**
   * in milliseconds
   */
  duration?: number;

  /**
   * @default true
   */
  closeButton?: boolean;

  component?: Component;
  props?: ComponentObjectPropsOptions;
  button?: NotificationCustomButton;
  beforeOpen?: (notificationId: string) => void | Promise<void>;
  beforeClose?: () => void | Promise<void>;
  onClose?: () => void | Promise<void>;
}

export interface INotificationExtended extends INotification {
  /**
   * @private
   */
  autoCloseTimeout?: number;
}
