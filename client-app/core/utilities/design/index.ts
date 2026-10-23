import settingsData from "@/config/settings_data.json";
import { DESIGN_FONTS, DESIGNS } from "@/core/constants/design";
import { Logger } from "@/core/utilities/logger";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import type { DesignType } from "@/core/constants/design";
import type { IThemeConfig } from "@/core/types";

export function resolveDesign(value: unknown): DesignType {
  return value === DESIGNS.soft ? DESIGNS.soft : DESIGNS.classic;
}

/** Read from the bundled settings, so the design is known before any request. */
export function getDesign(): DesignType {
  return resolveDesign((settingsData as IThemeConfig).settings.design);
}

export function setDesignAttribute(design: DesignType): void {
  document.documentElement.dataset.design = design;
}

export function setPresetAttribute(presetName: string): void {
  document.documentElement.dataset.preset = presetName;
}

function reportStylesFailure(error: unknown): void {
  ignoreChunkLoadFailure(error);
  Logger.error("Failed to load the design styles.", error);
}

/** Not awaited: fonts swap in when they arrive (`display=swap`), so they never hold back the mount. */
export function loadDesignFonts(design: DesignType): void {
  DESIGN_FONTS[design]?.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.designFonts = "";
    link.addEventListener("error", () => Logger.warn("Failed to load the design fonts.", href), { once: true });
    document.head.append(link);
  });
}

/**
 * Classic ships with the app; any other design's styles are a lazy chunk it alone downloads.
 * Never rejects: a missing chunk leaves the app booting with what did load.
 */
export async function loadDesignStyles(design: DesignType): Promise<void> {
  if (design !== DESIGNS.soft) {
    return;
  }

  loadDesignFonts(design);

  await Promise.all([
    import("@/ui-kit/styles/soft/index.scss").catch(reportStylesFailure),
    import("@/assets/styles/soft/index.scss").catch(reportStylesFailure),
  ]);
}
