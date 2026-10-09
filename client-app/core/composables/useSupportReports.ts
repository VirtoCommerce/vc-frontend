import { useAppInsights } from "vue3-application-insights";

export function useSupportReports() {
  const SUPPORT_REPORT_IDENTIFIER = "SUPPORT_REPORT";
  const appInsights = useAppInsights();

  function report(reportData: Record<string, unknown>) {
    appInsights.trackEvent({
      name: SUPPORT_REPORT_IDENTIFIER,
      properties: {
        reportId: crypto.randomUUID(),
        ...reportData,
      },
    });
  }

  return {
    report,
  };
}
