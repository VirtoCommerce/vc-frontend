export const roles = [
  "none",
  "button",
  "navigation",
  "group",
  "menu",
  "menuitem",
  "menubar",
  "option",
  "dialog",
  "alertdialog",
] as const;

export type AriaRole = (typeof roles)[number];
