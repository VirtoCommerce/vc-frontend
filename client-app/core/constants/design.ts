export const DESIGNS = {
  classic: "classic",
  soft: "soft",
} as const;

export type DesignType = keyof typeof DESIGNS;
