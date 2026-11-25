// Shared with the Vite config, which builds the facts under Node, so this file stays import-free.

export interface IDesignToken {
  /** The value when the active design sets none; a template writes `var(<token>, <fallback>)`. */
  fallback: string;
  description: string;
}

/** What a custom section's CSS can rely on, as the storefront's own build defines it. */
export interface IDesignFacts {
  /** Tailwind's `screens`: name → min width. */
  breakpoints: Record<string, string>;
  /** The width the built-in sections' content keeps to (`max-w-screen-xl`). */
  containerMaxWidth: string;
  tokens: Record<string, IDesignToken>;
}
