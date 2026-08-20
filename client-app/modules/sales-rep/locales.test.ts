import { describe, expect, it } from "vitest";
import { createI18n } from "@/i18n";
import ptMessages from "./locales/pt.json";

// `pt.json` serves pt-PT as well as pt-BR, and module messages are registered under the
// two-letter code, so every Portuguese store takes the leading slot at zero. European
// Portuguese files zero under CLDR `other`, so that slot carries the plural.
const PT_ZERO_FORMS: [string, string][] = [
  ["sales_rep.my_customers.table.orders_count", "0 pedidos"],
  ["sales_rep.hub.dashboard.stats.ordered_this_month", "0 compraram este mês"],
  ["sales_rep.hub.dashboard.stats.new_customers", "0 novos clientes"],
  ["sales_rep.hub.dashboard.stats.of_recent_orders", "de 0 criados nos últimos 7 dias"],
  ["sales_rep.hub.dashboard.stats.items_this_week", "0 itens esta semana"],
];

describe("pt plural forms", () => {
  it.each(["pt", "pt-PT", "pt-BR"])("renders the plural at zero on a %s store", (locale) => {
    const i18n = createI18n(locale, "USD", { locale: "en", message: {} }, [locale, "pt"]);
    i18n.global.setLocaleMessage("pt", ptMessages);
    i18n.global.locale.value = locale;

    for (const [key, expected] of PT_ZERO_FORMS) {
      expect(i18n.global.t(key, { count: 0 }, 0)).toBe(expected);
    }
  });
});
