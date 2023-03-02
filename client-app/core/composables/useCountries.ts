import { computed, readonly, ref, shallowRef } from "vue";
import { getCountries } from "@/xapi/graphql/common";
import type { CountryType } from "@/xapi/types";
import { Logger } from "../utilities";

const loading = ref(false);
const countries = shallowRef<CountryType[]>([]);

async function loadCountries() {
  loading.value = true;

  try {
    countries.value = await getCountries();
  } catch (e) {
    Logger.error(loadCountries.name, e);
  } finally {
    loading.value = false;
  }
}

export function useCountries() {
  return {
    loadCountries,
    loading: readonly(loading),
    countries: computed(() => countries.value),
  };
}
