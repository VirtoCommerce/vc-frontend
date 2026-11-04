import settingsData from "@/config/settings_data.json";
import { IS_DEVELOPMENT } from "@/core/constants/environment";
import { Logger } from "@/core/utilities/logger";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import { customFonts } from "@/designs/custom-fonts";
import type { IDesignConfig, IThemeConfig } from "@/core/types";

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

const DESIGN_CONFIGS: Record<string, IDesignConfig> = byDesignName(
  import.meta.glob<IDesignConfig>("@/designs/*/design.ts", { eager: true, import: "design" }),
);

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
      `Unknown design "${value}": no folder in client-app/designs/ with an index.scss has exactly this name, so the storefront uses classic.`,
    );
  }

  return design;
}

export function setDesignAttribute(design: string): void {
  document.documentElement.dataset.design = design;
}

function ownValue<T>(record: Record<string, T>, key: string): T | undefined {
  return Object.hasOwn(record, key) ? record[key] : undefined;
}

/** A fork's list in `client-app/designs/custom-fonts.ts` replaces the design's own `design.ts` list. */
export function getDesignFonts(
  design: string,
  configs: Record<string, IDesignConfig> = DESIGN_CONFIGS,
  custom: Record<string, string[]> = customFonts,
): string[] {
  return ownValue(custom, design) ?? ownValue(configs, design)?.fonts ?? [];
}

/** Fire and forget: the mount never waits for a design's fonts. Replaces the previous design's links. */
export function loadDesignFonts(design: string, fonts: string[] = getDesignFonts(design)): void {
  document.head.querySelectorAll("link[data-design-fonts]").forEach((link) => link.remove());

  for (const href of fonts) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.designFonts = "";
    link.addEventListener("error", () => Logger.warn("Failed to load the design fonts.", href), { once: true });
    document.head.append(link);
  }
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
  loadDesignFonts(design);

  if (design === CLASSIC_DESIGN || !Object.hasOwn(styles, design)) {
    return;
  }

  try {
    await styles[design]();
  } catch (error) {
    reportStylesFailure(error);
  }
}
