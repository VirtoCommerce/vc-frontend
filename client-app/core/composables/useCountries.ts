import { computed, readonly, ref, shallowRef } from "vue";
import { Logger } from "@/core/utilities";
import { getCountries } from "@/xapi/graphql/common";
import { CountryType } from "@/xapi/types";

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
