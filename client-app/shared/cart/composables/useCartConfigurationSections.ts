import { ref, toValue, watch } from "vue";
import { getProductConfiguration } from "@/core/api/graphql";
import { Logger } from "@/core/utilities";
import type { MaybeRefOrGetter } from "vue";

// Cart-only: the section name isn't on the cart item, so resolve sectionId → name from the live product configuration.
export function useCartConfigurationSections(productId: MaybeRefOrGetter<string | undefined>) {
  const sectionNamesById = ref<Record<string, string>>({});

  async function fetchSectionNames(id: string): Promise<void> {
    try {
      const configuration = await getProductConfiguration(id);
      const sections = configuration?.configurationSections ?? [];
      sectionNamesById.value = sections.reduce<Record<string, string>>((acc, section) => {
        if (section?.id && section.name) {
          acc[section.id] = section.name;
        }
        return acc;
      }, {});
    } catch (e) {
      Logger.error(`${useCartConfigurationSections.name}.${fetchSectionNames.name}`, e);
    }
  }

  watch(
    () => toValue(productId),
    (id) => {
      if (!id) {
        sectionNamesById.value = {};
        return;
      }
      void fetchSectionNames(id);
    },
    { immediate: true },
  );

  return { sectionNamesById };
}
