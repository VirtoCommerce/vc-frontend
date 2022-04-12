import { Language } from "./language";
import { Currency } from "./currency";

export interface IThemeContext {
  baseUrl?: string;
  storeId?: string;
  storeName?: string;
  defaultLanguage?: Language;
  availLanguages?: Language[];
  catalogId?: string;
  defaultCurrency?: Currency;
  availCurrencies?: Currency[];
  userId?: string;
  userName?: string;
  settings?: { key: string; value: unknown }[];
}
