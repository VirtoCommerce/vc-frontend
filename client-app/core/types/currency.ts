export interface ICurrency {
  code: string;
  symbol: string;
  cultureName: string;
  englishName: string;
  exchangeRate: unknown;
  customFormatting?: string;
}
