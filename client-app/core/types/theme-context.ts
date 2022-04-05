import { CurrencyType } from "./../api/graphql/types";
import { Language } from "./language";

export interface IThemeContext {
  baseUrl?: string;
  storeId?: string;
  storeName?: string;
  language?: Language;
  availLanguages?: Language[];
  catalogId?: string;
  currency?: CurrencyType;
  availCurrencies?: CurrencyType[];
  userId?: string;
  userName?: string;
  settings?: { key: string; value: unknown }[];
}
