import type { Component, ComponentObjectPropsOptions } from "vue";
import type { RouteLocationRaw } from "vue-router";

export type CloseNotificationHandleType = () => void;

export type NotificationCustomButtonType = {
  text?: string;
  html?: string;
  color?: "primary" | "secondary" | "success" | "info" | "neutral" | "warning" | "danger" | "accent";
  variant?: "solid" | "outline" | "no-border" | "no-background";
  to?: RouteLocationRaw;
  clickHandler?: (notificationId: string, event: Event) => void;
};

export interface INotification {
  id?: string;
  text?: string;
  html?: string;
  classes?: string;
  group?: string;
  button?: NotificationCustomButtonType;
  buttons?: NotificationCustomButtonType[];
  component?: Component;
  props?: ComponentObjectPropsOptions;

  /**
   * @default md
   */
  size?: "sm" | "md";

  /**
   * @default solid
   */
  variant?: "solid" | "solid-light" | "outline" | "outline-dark";

  /**
   * in milliseconds
   */
  duration?: number;

  /**
   * @default true
   */
  closeButton?: boolean;

  /**
   * If this is true, then all previous notifications will be hidden.
   * @default false
   */
  single?: boolean;

  /**
   * If this is true, then all notifications in other groups will be hidden.
   * Including those that don't have a group. If the group is not specified,
   * then the action is similar to the "single" option.
   * @default false
   */
  singleGroup?: boolean;

  /**
   * If this is true, then all notifications in group will be hidden.
   * If the group is not specified, then the action is similar to the "single" option.
   * @default false
   */
  singleInGroup?: boolean;
}

export interface INotificationExtended extends INotification {
  /**
   * @default info
   */
  type?: "info" | "success" | "warning" | "danger";

  autoCloseTimeout?: number;
}
