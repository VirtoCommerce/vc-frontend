import { useI18n } from "vue-i18n";

export function useReturnStatusLabel() {
  const { t, te } = useI18n();

  // The server resolves Return.Status through the platform's localization store, which is empty
  // until an operator fills it and then answers with the raw code. These keys carry the module's
  // own statuses in the meantime, and step aside as soon as a translation is entered.
  function statusLabel(code?: string, displayValue?: string): string {
    if (displayValue && displayValue !== code) {
      return displayValue;
    }

    const key = `returns.statuses.${code}`;

    return code && te(key) ? t(key) : (displayValue ?? code ?? "");
  }

  return { statusLabel };
}
