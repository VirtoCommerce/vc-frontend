import blackGold from './black-gold.json'
import coffee from './coffee.json'
import defaultPreset from './default.json'
import jensen from './jensen.json'
import mercury from './mercury.json'
import purplePink from './purple-pink.json'
import watermelon from './watermelon.json'
import type { IThemeConfigPreset } from "@/core/types";

export const presets: Record<string, IThemeConfigPreset> = {
  ['black-gold']: blackGold,
  default: defaultPreset,
  mercury: mercury,
  ['purple-pink']: purplePink,
  watermelon: watermelon,
  coffee: coffee,
  jensen: jensen,
} as const;
