import type { ICurrency } from "./currency";
import type { ILanguage } from "./language";
import type { IThemeConfigPreset } from "./theme-config";

export interface IThemeContext {
  storeId: string;
  storeName: string;
  catalogId: string;
  userId: string;
  userName: string;
  defaultLanguage: ILanguage;
  defaultCurrency: ICurrency;
  availableLanguages: ILanguage[];
  availableCurrencies: ICurrency[];
  settings: IThemeConfigPreset;
}
