import { graphqlClient } from "../../../client";
import { GetCountriesDocument } from "./getCountries.generated";
import type { CountryType, Query } from "@/core/api/graphql/types";

export async function getCountries(): Promise<CountryType[]> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "countries">>>({
    query: GetCountriesDocument,
  });

  return data.countries;
}
