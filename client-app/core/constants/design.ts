export const DESIGNS = {
  classic: "classic",
  soft: "soft",
} as const;

export type DesignType = keyof typeof DESIGNS;

/** Classic has none: Lato comes from `index.html`. */
export const DESIGN_FONTS: Partial<Record<DesignType, string[]>> = {
  soft: [
    "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400..900;1,400..900&family=Geologica:wght@400..900&display=swap",
  ],
};
