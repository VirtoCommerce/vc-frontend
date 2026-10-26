import settingsData from "@/config/settings_data.json";
import { IS_DEVELOPMENT } from "@/core/constants/environment";
import { Logger } from "@/core/utilities/logger";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import type { IThemeConfig } from "@/core/types";

export const CLASSIC_DESIGN = "classic";

export type DesignStylesType = Record<string, () => Promise<unknown>>;

/** Keys modules by the design folder they sit in: `/client-app/designs/soft/index.scss` gives `soft`. */
export function byDesignName<T>(modules: Record<string, T>): Record<string, T> {
  const named: Record<string, T> = {};

  for (const [file, module] of Object.entries(modules)) {
    const name = file.split("/").at(-2);

    if (name) {
      named[name] = module;
    }
  }

  return named;
}

const DESIGN_STYLES: DesignStylesType = byDesignName(import.meta.glob("@/designs/*/index.scss"));

/** Every folder in `client-app/designs/` with an `index.scss`. Classic has none. */
export const DESIGN_NAMES: readonly string[] = Object.keys(DESIGN_STYLES);

export function resolveDesign(value: unknown, known: readonly string[] = DESIGN_NAMES): string {
  return typeof value === "string" && known.includes(value) ? value : CLASSIC_DESIGN;
}

/** Read from the bundled settings, so the design is known before any request. */
export function getDesign(): string {
  const value = (settingsData as IThemeConfig).settings.design;
  const design = resolveDesign(value);

  if (IS_DEVELOPMENT && typeof value === "string" && value !== "" && value !== design) {
    Logger.warn(
      `Unknown design "${value}": there is no client-app/designs/${value}/index.scss, so the storefront uses classic.`,
    );
  }

  return design;
}

export function setDesignAttribute(design: string): void {
  document.documentElement.dataset.design = design;
}

function reportStylesFailure(error: unknown): void {
  ignoreChunkLoadFailure(error);
  Logger.error("Failed to load the design styles.", error);
}

/**
 * Classic ships with the app; any other design's styles are a lazy chunk it alone downloads.
 * Never rejects: if the chunk fails to load, the app boots without the design's styles.
 */
export async function loadDesignStyles(design: string, styles: DesignStylesType = DESIGN_STYLES): Promise<void> {
  if (design === CLASSIC_DESIGN || !Object.hasOwn(styles, design)) {
    return;
  }

  try {
    await styles[design]();
  } catch (error) {
    reportStylesFailure(error);
  }
}
