export const COLORS = {
  primary: "primary",
  secondary: "secondary",
  neutral: "neutral",
  accent: "accent",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
  additional: "additional",
} as const;

export const MAIN_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.neutral,
  COLORS.accent,
  COLORS.info,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
] as const;
