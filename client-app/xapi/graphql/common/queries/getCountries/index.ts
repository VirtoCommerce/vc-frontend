import getCountriesQuery from "./getCountries.graphql";
import type { CountryType, Query } from "@/xapi/types";

export default async function getCountries(): Promise<CountryType[]> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "countries">>>({
    query: getCountriesQuery,
  });

  return data.countries;
}
