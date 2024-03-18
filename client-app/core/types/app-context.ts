export interface IAppContext {
  /* NOTE: Uncomment this when migrating to MPA
  readonly baseUrl: string;
  readonly storeId: string;
  readonly locale: string;
  readonly locales: readonly string[];
  readonly currencyCode: number;
  readonly catalogId: string;
  readonly userId: string;
  readonly userIsAuthorized: string;
  readonly localization: Readonly<typeof import("../../../locales/en.json")>;
  readonly themeSettings: Readonly<IThemeConfigPreset>;
  */
  readonly storeSettings: {
    readonly anonymousAccessEnabled: boolean;
  };
}
