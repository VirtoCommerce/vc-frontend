import { computed } from "vue";
import { ROUTES } from "@/router/routes/constants";
import { useLoyaltySettings } from "@/shared/loyalty/composables/useLoyaltySettings";
import { useCatalogBasePath } from "./useCatalogBasePath";

/**
 * Returns the loyalty currency code when the current route is under the loyalty-catalog
 * namespace (e.g. `/loyalty-catalog/<slug>`); otherwise resolves to `undefined`.
 *
 * Consumers thread the resulting value into product/catalog GraphQL queries as a
 * `currencyCodeOverride` so prices are fetched in the configured loyalty currency.
 */
export function useLoyaltyCatalogCurrency() {
  const basePath = useCatalogBasePath();
  const { loyaltyCurrencyCode } = useLoyaltySettings();

  return computed(() => (basePath.value === ROUTES.LOYALTY_CATALOG.PATH ? loyaltyCurrencyCode.value : undefined));
}
