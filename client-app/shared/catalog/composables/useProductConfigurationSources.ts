import { computed, shallowRef, toValue, watch } from "vue";
import { useRoute } from "vue-router";
import { Logger } from "@/core/utilities";
import type { ConfigurationSectionInput } from "@/core/api/graphql/types";
import type { LocalConfigurationItemType } from "@/shared/catalog/types";
import type { MaybeRefOrGetter } from "vue";

/**
 * Answers the value of a URL parameter with the configuration the product page preselects for that product.
 * `undefined` leaves the page's defaults.
 */
export type ProductConfigurationSourceType = (
  value: string,
  productId: string,
) => Promise<ConfigurationSectionInput[] | undefined>;

const sources = shallowRef(new Map<string, ProductConfigurationSourceType>());

/**
 * Lets a plugin preselect the product page's configuration from a URL parameter it owns: a page opened with
 * `?<param>=<value>` calls `resolve(value, productId)` and preselects what comes back. A second call for the same
 * parameter replaces the first. A page that opened before the call still applies it, and the page asks again for
 * every product it loads.
 */
export function registerProductConfigurationSource(param: string, resolve: ProductConfigurationSourceType): void {
  sources.value = new Map(sources.value).set(param, resolve);
}

/** Specs only. */
export function resetProductConfigurationSources(): void {
  sources.value = new Map();
}

function toLocalConfiguration(sections: ConfigurationSectionInput[]): LocalConfigurationItemType[] {
  return sections.map((section) => ({ ...section, ...section.option, id: section.sectionId }));
}

/** What the first registered source found in the URL preselects for the product; `undefined` keeps the defaults. */
export function useProductConfigurationSources(productId: MaybeRefOrGetter<string>) {
  const route = useRoute();
  const resolved = shallowRef<LocalConfigurationItemType[]>();

  const claimed = computed(() => {
    const param = [...sources.value.keys()].find((key) => getQueryValue(key) !== undefined);
    return param ? { param, value: getQueryValue(param), resolve: sources.value.get(param) } : undefined;
  });

  // Field by field, so another query parameter changing (lineItemId after an add to cart) does not re-run a source
  // and overwrite the buyer's selection.
  watch(
    [() => toValue(productId), () => claimed.value?.param, () => claimed.value?.value, () => claimed.value?.resolve],
    async ([id, param, value, resolve], _previous, onCleanup) => {
      let isCurrent = true;
      onCleanup(() => {
        isCurrent = false;
      });

      resolved.value = undefined;
      if (!id || !value || !resolve) {
        return;
      }

      try {
        const sections = await resolve(value, id);
        if (isCurrent && sections) {
          resolved.value = toLocalConfiguration(sections);
        }
      } catch (error) {
        Logger.error(`${useProductConfigurationSources.name}: the "${param}" configuration source failed`, error);
      }
    },
    { immediate: true },
  );

  function getQueryValue(param: string): string | undefined {
    const value = route.query[param];
    return typeof value === "string" && value ? value : undefined;
  }

  return {
    initialConfiguration: computed(() => resolved.value),
  };
}
