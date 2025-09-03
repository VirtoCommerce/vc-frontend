export declare global {
  interface IWindow {
    dataLayer: Array<unknown>;
    gtag: Gtag;
    AnalyticsBeacon?: {
      init(config: {
        ga4MeasurementId: string;
        debug?: boolean;
        environment?: 'development' | 'staging' | 'production';
        currency?: string;
        businessType?: 'b2b' | 'b2c';
        customContentDetectors?: {
          product?: () => boolean;
          category?: () => boolean;
          searchResults?: () => boolean;
        };
        enablePolling?: boolean;
        pollingInterval?: number;
        enableInputTracking?: boolean;
        respectDnt?: boolean;
        anonymizeIp?: boolean;
      }): Promise<void>;
      start(): void;
      stop(): void;
      getStatus(): Record<string, unknown>;
    };
  }
}
