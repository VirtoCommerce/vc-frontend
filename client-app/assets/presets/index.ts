import blackGold from './black-gold.json'
import coffeeDark from './coffee.dark.json'
import coffee from './coffee.json'
import defaultDark from './default.dark.json'
import defaultPreset from './default.json'
import mercuryDark from './mercury.dark.json'
import mercury from './mercury.json'
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
};

export const darkPresets: Record<string, IThemeConfigPreset> = {
  default: defaultDark,
  coffee: coffeeDark,
  mercury: mercuryDark,
  watermelon: watermelonDark,
};
