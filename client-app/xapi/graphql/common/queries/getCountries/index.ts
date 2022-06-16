import { CountryType, Query } from "@/xapi/graphql/types";
import getCountriesQuery from "./getCountries.graphql";

export default async function getCountries(): Promise<CountryType[]> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "countries">>>({
    query: getCountriesQuery,
  });

  return data.countries;
}
