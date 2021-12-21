export type ThemeContext = {
  baseUrl?: string;
  storeId?: string;
  storeName?: string;
  language?: string;
  availLanguages?: string[];
  catalogId?: string;
  currency?: string;
  availCurrencies?: string[];
  userId?: string;
  userName?: string;
  settings?: { key: string; value: unknown }[];
};
