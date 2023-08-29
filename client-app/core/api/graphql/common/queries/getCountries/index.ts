import { graphqlClient } from "../../../client";
import getCountriesQuery from "./getCountries.graphql";
import type { CountryType, Query } from "@/core/api/graphql/types";

export async function getCountries(): Promise<CountryType[]> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "countries">>>({
    query: getCountriesQuery,
  });

  return data.countries;
}
