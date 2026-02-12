/**
 * Dark Preset Generator
 *
 * Reads each light preset JSON and generates a dark variant using OKLCH lightness inversion.
 * Validates WCAG AA contrast ratios (4.5:1 minimum for normal text).
 *
 * Usage: yarn generate:dark-presets
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { parse, formatHex, wcagContrast, converter } from "culori";

const toOklch = converter("oklch");

const PRESETS_DIR = resolve(import.meta.dirname, "../client-app/assets/presets");

const PALETTE_FAMILIES = ["primary", "secondary", "accent", "neutral", "warning", "danger", "success", "info"] as const;
const SHADE_LEVELS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

// Shade mirror mapping: 50↔950, 100↔900, 200↔800, etc.
const SHADE_MIRROR: Record<number, number> = {
  50: 950,
  100: 900,
  200: 800,
  300: 700,
  400: 600,
  500: 500,
  600: 400,
  700: 300,
  800: 200,
  900: 100,
  950: 50,
};

// Critical contrast pairs to validate (key suffixes from preset)
const CONTRAST_PAIRS: Array<{ fg: string; bg: string; minRatio: number; label: string }> = [
  // Palette-based pairs
  { fg: "color_neutral_950", bg: "color_neutral_50", minRatio: 4.5, label: "body text on surface" },
  { fg: "color_neutral_900", bg: "color_neutral_50", minRatio: 4.5, label: "secondary text on surface" },
  { fg: "color_neutral_950", bg: "color_additional_50", minRatio: 4.5, label: "text on card bg" },
  { fg: "color_primary_500", bg: "color_additional_50", minRatio: 3.0, label: "primary on card (large text)" },
  { fg: "color_danger_500", bg: "color_additional_50", minRatio: 4.5, label: "danger on dark surface" },
  { fg: "color_danger_600", bg: "color_additional_50", minRatio: 4.5, label: "danger-600 on dark surface" },
  { fg: "color_success_500", bg: "color_additional_50", minRatio: 4.5, label: "success on dark surface" },
  { fg: "color_success_600", bg: "color_additional_50", minRatio: 4.5, label: "success-600 on dark surface" },
];

// Semantic contrast pairs (only checked if both keys exist in preset)
const SEMANTIC_PAIRS: Array<{ fg: string; bg: string; minRatio: number; label: string }> = [
  { fg: "color_body_text", bg: "color_body_bg", minRatio: 4.5, label: "body text/bg" },
  { fg: "color_header_top_text", bg: "color_header_top_bg", minRatio: 4.5, label: "header top text/bg" },
  { fg: "color_header_top_link", bg: "color_header_top_bg", minRatio: 4.5, label: "header top link/bg" },
  { fg: "color_header_bottom_text", bg: "color_header_bottom_bg", minRatio: 4.5, label: "header bottom text/bg" },
  { fg: "color_header_bottom_link", bg: "color_header_bottom_bg", minRatio: 4.5, label: "header bottom link/bg" },
  { fg: "color_footer_top_text", bg: "color_footer_top_bg", minRatio: 4.5, label: "footer top text/bg" },
  { fg: "color_footer_top_link", bg: "color_footer_top_bg", minRatio: 4.5, label: "footer top link/bg" },
  { fg: "color_footer_bottom_text", bg: "color_footer_bottom_bg", minRatio: 4.5, label: "footer bottom text/bg" },
  { fg: "color_footer_bottom_link", bg: "color_footer_bottom_bg", minRatio: 4.5, label: "footer bottom link/bg" },
  { fg: "color_link", bg: "color_body_bg", minRatio: 4.5, label: "link on body bg" },
];

interface IPreset {
  [key: string]: string;
}

/**
 * Invert a hex color's lightness in OKLCH space, optionally reducing chroma.
 */
function invertLightness(hex: string, chromaReduction: number = 0.9): string {
  const color = toOklch(parse(hex));
  if (!color) {
    return hex;
  }

  color.l = 1 - color.l;
  color.c = (color.c ?? 0) * chromaReduction;

  const result = formatHex(color);
  return result ?? hex;
}

/**
 * For palette shades: swap lightness between mirror shades.
 * shade 50 gets the OKLCH lightness of shade 950, preserving its own chroma and hue.
 */
function invertPaletteShade(shadeHex: string, mirrorShadeHex: string, chromaReduction: number = 0.9): string {
  const shadeOklch = toOklch(parse(shadeHex));
  const mirrorOklch = toOklch(parse(mirrorShadeHex));

  if (!shadeOklch || !mirrorOklch) {
    return shadeHex;
  }

  // Take lightness from the mirror shade, keep original chroma (reduced) and hue
  shadeOklch.l = mirrorOklch.l;
  shadeOklch.c = (shadeOklch.c ?? 0) * chromaReduction;

  const result = formatHex(shadeOklch);
  return result ?? shadeHex;
}

/**
 * Ensure a foreground color meets minimum contrast against a background.
 * Adjusts the foreground's OKLCH lightness until the ratio is met.
 */
function ensureContrast(fgHex: string, bgHex: string, minRatio: number): string {
  const fgParsed = parse(fgHex);
  const bgParsed = parse(bgHex);

  if (!fgParsed || !bgParsed) {
    return fgHex;
  }

  let ratio = wcagContrast(fgParsed, bgParsed);
  if (ratio >= minRatio) {
    return fgHex;
  }

  const fgOklch = toOklch(fgParsed);
  const bgOklch = toOklch(bgParsed);
  if (!fgOklch || !bgOklch) {
    return fgHex;
  }

  const bgIsLight = bgOklch.l > 0.5;
  let iterations = 0;

  while (ratio < minRatio && iterations < 100) {
    if (bgIsLight) {
      fgOklch.l = Math.max(0, fgOklch.l - 0.01);
    } else {
      fgOklch.l = Math.min(1, fgOklch.l + 0.01);
    }
    const adjusted = formatHex(fgOklch);
    if (!adjusted) {
      break;
    }
    ratio = wcagContrast(parse(adjusted)!, bgParsed);
    iterations++;
  }

  return formatHex(fgOklch) ?? fgHex;
}

/**
 * Detect if a key is a palette shade key (e.g., "color_primary_50").
 */
function parsePaletteKey(key: string): { family: string; shade: number } | null {
  for (const family of PALETTE_FAMILIES) {
    const prefix = `color_${family}_`;
    if (key.startsWith(prefix)) {
      const shade = parseInt(key.slice(prefix.length), 10);
      if (SHADE_LEVELS.includes(shade as (typeof SHADE_LEVELS)[number])) {
        return { family, shade };
      }
    }
  }
  return null;
}

/**
 * Invert a semantic color based on its role (bg, text, link, icon, etc.).
 */
function invertSemanticColor(key: string, hex: string): string {
  const oklch = toOklch(parse(hex));
  if (!oklch) {
    return hex;
  }

  if (key.includes("_bg")) {
    // Backgrounds should become dark
    oklch.l = Math.max(0.05, Math.min(0.2, 1 - oklch.l));
    oklch.c = (oklch.c ?? 0) * 0.8;
  } else if (key.includes("_text")) {
    // Text should become light
    oklch.l = Math.max(0.85, Math.min(0.98, 1 - oklch.l));
    oklch.c = (oklch.c ?? 0) * 0.7;
  } else if (key.includes("_link")) {
    // Links need good contrast on dark backgrounds
    oklch.l = Math.max(0.55, Math.min(0.85, 1 - oklch.l));
    oklch.c = (oklch.c ?? 0) * 0.95;
  } else if (key.includes("_price")) {
    // Price — light on dark bg
    oklch.l = Math.max(0.8, 1 - oklch.l);
  } else {
    // Generic: simple lightness inversion
    oklch.l = 1 - oklch.l;
    oklch.c = (oklch.c ?? 0) * 0.9;
  }

  return formatHex(oklch) ?? hex;
}

/**
 * Invert all colors in a light preset to produce dark palette values.
 */
function invertPresetColors(lightPreset: IPreset): IPreset {
  const dark: IPreset = {};

  for (const [key, value] of Object.entries(lightPreset)) {
    const paletteInfo = parsePaletteKey(key);

    if (paletteInfo) {
      const mirrorShade = SHADE_MIRROR[paletteInfo.shade];
      const mirrorKey = `color_${paletteInfo.family}_${mirrorShade}`;
      const mirrorHex = lightPreset[mirrorKey];
      dark[key] = mirrorHex ? invertPaletteShade(value, mirrorHex) : invertLightness(value);
    } else if (key === "color_additional_50") {
      dark[key] = "#1a1a1e";
    } else if (key === "color_additional_950") {
      dark[key] = "#000000";
    } else if (key.startsWith("color_")) {
      dark[key] = invertSemanticColor(key, value);
    } else {
      dark[key] = value;
    }
  }

  return dark;
}

/**
 * Validate and fix contrast ratios for a set of color pairs in a preset.
 * Returns true if any pairs could not be fixed.
 */
function validateContrastPairs(
  preset: IPreset,
  pairs: Array<{ fg: string; bg: string; minRatio: number; label: string }>,
): boolean {
  let hasWarnings = false;

  for (const pair of pairs) {
    if (!preset[pair.fg] || !preset[pair.bg]) {
      continue;
    }

    const before = preset[pair.fg];
    preset[pair.fg] = ensureContrast(preset[pair.fg], preset[pair.bg], pair.minRatio);
    const ratio = wcagContrast(parse(preset[pair.fg])!, parse(preset[pair.bg])!);

    if (before !== preset[pair.fg]) {
      console.log(`  [adjusted] ${pair.label}: ${before} -> ${preset[pair.fg]} (ratio: ${ratio.toFixed(2)})`);
    }

    if (ratio < pair.minRatio) {
      console.warn(`  [WARN] ${pair.label}: ratio ${ratio.toFixed(2)} < ${pair.minRatio} — could not fix`);
      hasWarnings = true;
    }
  }

  return hasWarnings;
}

/**
 * Generate a dark preset from a light preset.
 */
function generateDarkPreset(lightPreset: IPreset): IPreset {
  const dark = invertPresetColors(lightPreset);

  const hasWarnings = validateContrastPairs(dark, CONTRAST_PAIRS) || validateContrastPairs(dark, SEMANTIC_PAIRS);

  if (hasWarnings) {
    console.warn("  Some contrast pairs could not be automatically fixed. Manual review needed.");
  }

  return dark;
}

/**
 * Main: read all preset JSONs, generate dark variants, write them.
 */
function main() {
  const files = readdirSync(PRESETS_DIR).filter((f) => f.endsWith(".json") && !f.endsWith(".dark.json"));

  console.log(`Found ${files.length} light presets:\n`);

  for (const file of files) {
    const filePath = join(PRESETS_DIR, file);
    const lightPreset: IPreset = JSON.parse(readFileSync(filePath, "utf-8"));
    const darkFile = file.replace(".json", ".dark.json");
    const darkPath = join(PRESETS_DIR, darkFile);

    console.log(`Generating ${darkFile} from ${file}...`);

    const darkPreset = generateDarkPreset(lightPreset);

    writeFileSync(darkPath, JSON.stringify(darkPreset, null, 2) + "\n", "utf-8");
    console.log(`  Written: ${darkPath}\n`);
  }

  console.log("Done! All dark presets generated.");
}

main();
