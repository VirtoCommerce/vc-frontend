import blackGoldDark from './black-gold.dark.json'
import blackGold from './black-gold.json'
import coffeeDark from './coffee.dark.json'
import coffee from './coffee.json'
import defaultDark from './default.dark.json'
import defaultPreset from './default.json'
import mercuryDark from './mercury.dark.json'
import mercury from './mercury.json'
import purplePinkDark from './purple-pink.dark.json'
import purplePink from './purple-pink.json'
import watermelonDark from './watermelon.dark.json'
import watermelon from './watermelon.json'
import type { IThemeConfigPreset } from "@/core/types";

export const presets: Record<string, IThemeConfigPreset> = {
  ['black-gold']: blackGold,
  default: defaultPreset,
  mercury: mercury,
  ['purple-pink']: purplePink,
  watermelon: watermelon,
  coffee: coffee,
} as const;

export const darkPresets: Record<string, IThemeConfigPreset> = {
  ['black-gold']: blackGoldDark,
  default: defaultDark,
  mercury: mercuryDark,
  ['purple-pink']: purplePinkDark,
  watermelon: watermelonDark,
  coffee: coffeeDark,
} as const;
