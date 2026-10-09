export const DESKTOP_MENU_MODES = {
  fullscreen: "fullscreen",
  horizontal: "horizontal",
} as const;

export type DesktopMenuModeType = keyof typeof DESKTOP_MENU_MODES;
