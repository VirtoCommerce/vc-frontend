import settingsData from "@/config/settings_data.json";
import { DESIGNS } from "@/core/constants/design";
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

/**
 * Classic ships with the app; any other design's styles are a lazy chunk it alone downloads.
 * Never rejects: a missing chunk leaves the app booting with what did load.
 */
export async function loadDesignStyles(design: DesignType): Promise<void> {
  if (design !== DESIGNS.soft) {
    return;
  }

  await Promise.all([
    import("@/ui-kit/styles/soft/index.scss").catch(reportStylesFailure),
    import("@/assets/styles/soft/index.scss").catch(reportStylesFailure),
  ]);
}
