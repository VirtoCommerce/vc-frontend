export const DESIGNS = {
  classic: "classic",
  soft: "soft",
} as const;

export type DesignType = keyof typeof DESIGNS;

/** Font stylesheets per design that brings its own families; classic has none (Lato comes from `index.html`). */
export const DESIGN_FONTS: Partial<Record<DesignType, string[]>> = {
  soft: [
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geologica:wght@500;600;700;800;900&display=swap",
  ],
};
