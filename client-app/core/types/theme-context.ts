import { Language } from "./language";
import { Currency } from "./currency";
import { IThemeConfigPreset } from "@core/types";

export interface IThemeContext {
  baseUrl: string;
  storeId: string;
  storeName: string;
  catalogId: string;
  userId: string;
  userName: string;
  defaultLanguage: Language;
  defaultCurrency: Currency;
  availLanguages: Language[];
  availCurrencies: Currency[];
  settings: IThemeConfigPreset;
}
