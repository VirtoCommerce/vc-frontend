import graphqlClient from "@core/api/graphql/graphql-client";
import { CountryType, Query } from "@core/api/graphql/types";
import getCountriesQuery from "./getCountries.graphql";

export default async function getCountries(): Promise<CountryType[]> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "countries">>>({
    query: getCountriesQuery,
  });

  return data.countries;
}
