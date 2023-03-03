import type { ICurrency } from "./currency";
import type { ILanguage } from "./language";
import type { IThemeConfigPreset } from "./theme-config";

export interface IThemeContext {
  baseUrl: string;
  storeId: string;
  storeName: string;
  catalogId: string;
  userId: string;
  userName: string;
  defaultLanguage: ILanguage;
  defaultCurrency: ICurrency;
  availLanguages: ILanguage[];
  availCurrencies: ICurrency[];
  settings: IThemeConfigPreset;
}
