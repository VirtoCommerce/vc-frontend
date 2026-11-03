import type { ICurrency } from "./currency";
import type { ILanguage } from "./language";
import type { IThemeConfigPreset, IThemeConfigSettings } from "./theme-config";
import type { GetStoreQuery } from "../api/graphql/types";

export interface IThemeContext {
  storeId: string;
  storeName: string;
  /** Store's configured public url. */
  storeUrl?: string;
  catalogId: string;
  defaultLanguage: ILanguage;
  defaultCurrency: ICurrency;
  availableLanguages: ILanguage[];
  availableCurrencies: ICurrency[];
  settings: IThemeConfigSettings;
  preset?: IThemeConfigPreset;
  /** The dark variant of `preset`; without one the storefront has no dark theme. */
  darkPreset?: IThemeConfigPreset;
  defaultPresetName: string;
  activePresetName?: string;
  storeSettings: NonNullable<GetStoreQuery["store"]>["settings"];
}
