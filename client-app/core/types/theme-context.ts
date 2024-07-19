import type { ICurrency } from "./currency";
import type { ILanguage } from "./language";
import type { IThemeConfigPreset, IThemeConfigSettings } from "./theme-config";
import type { GetStoreQuery } from "../api/graphql/types";

export interface IThemeContext {
  storeId: string;
  storeName: string;
  catalogId: string;
  defaultLanguage: ILanguage;
  defaultCurrency: ICurrency;
  availableLanguages: ILanguage[];
  availableCurrencies: ICurrency[];
  settings: IThemeConfigSettings;
  preset: IThemeConfigPreset;
  storeSettings: NonNullable<GetStoreQuery["store"]>["settings"];
}
