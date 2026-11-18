import blackGoldDark from "./black-gold.dark.json";
import blackGold from "./black-gold.json";
import coffeeDark from "./coffee.dark.json";
import coffee from "./coffee.json";
import defaultDark from "./default.dark.json";
import defaultPreset from "./default.json";
import mercuryDark from "./mercury.dark.json";
import mercury from "./mercury.json";
import paprikaDark from "./paprika.dark.json";
import paprika from "./paprika.json";
import purplePinkDark from "./purple-pink.dark.json";
import purplePink from "./purple-pink.json";
import redDark from "./red.dark.json";
import red from "./red.json";
import watermelonDark from "./watermelon.dark.json";
import watermelon from "./watermelon.json";

/**
 * Stock colour presets: palette (`color_primary_500`), kit (`color_vc_*`) and app (`color_link`) keys.
 * The app turns the active one into CSS variables; a preset without a `darkPresets` entry has no dark mode.
 */
export const presets = {
  ["black-gold"]: blackGold,
  default: defaultPreset,
  mercury: mercury,
  ["purple-pink"]: purplePink,
  watermelon: watermelon,
  coffee: coffee,
  red: red,
  paprika: paprika,
} satisfies Record<string, Record<string, string>>;

export const darkPresets = {
  ["black-gold"]: blackGoldDark,
  default: defaultDark,
  coffee: coffeeDark,
  mercury: mercuryDark,
  watermelon: watermelonDark,
  ["purple-pink"]: purplePinkDark,
  red: redDark,
  paprika: paprikaDark,
} satisfies Record<string, Record<string, string>>;

/** A preset's optional stylesheet, `<name>.scss` next to its JSON, loaded while the preset is active. */
export const presetStyles = import.meta.glob("./*.scss");
