import { Logger } from "@core/utilities";
import { computed, readonly, ref, shallowRef } from "vue";
import { CountryType } from "@core/api/graphql/types";
import { getCountries } from "@core/api/graphql/common";

const loading = ref(false);
const countries = shallowRef<CountryType[]>([]);

async function loadCountries() {
  loading.value = true;

  try {
    countries.value = await getCountries();
  } catch (e) {
    Logger.error(`useCountries.${loadCountries.name}`, e);
  } finally {
    loading.value = false;
  }
}

export default () => {
  return {
    loadCountries,
    loading: readonly(loading),
    countries: computed(() => countries.value),
  };
};
