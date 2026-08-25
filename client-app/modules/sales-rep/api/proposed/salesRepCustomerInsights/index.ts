// Hand-typed against the PROPOSED `salesRepCustomerInsights` contract (§5 of
// specs/VCST-5337-customer-insights/2026-08-20-customer-insights-design.md). The backend does not
// expose the field yet, so codegen cannot produce these types. The documents live outside
// `api/graphql` on purpose: `yarn generate:graphql-types` validates everything under that path
// against the live schema, and an unknown root field would fail the whole module's generation.
// Once the backend ships, move the documents into `api/graphql/queries/` and replace this file
// with the generated types (the optionality below mirrors codegen's `Maybe<T> = T` mapping).
import browsedProductsDocument from "./salesRepCustomerBrowsedProductsQuery.graphql";
import searchTermsDocument from "./salesRepCustomerSearchTermsQuery.graphql";
import type { TypedDocumentNode } from "@apollo/client/core";

export type SalesRepCustomerInsightsQueryVariablesType = {
  organizationId: string;
  storeId?: string;
  cultureName?: string;
  periodFrom?: string;
  periodTo?: string;
  take?: number;
  // "count" ranks by occurrences (top), "date" by the latest hour bucket (recent).
  sort?: string;
};

export type SalesRepCustomerSearchTermsQueryType = {
  // Null when no insights provider is configured for the store — an expected state, not an error.
  salesRepCustomerInsights?: {
    dataAsOf?: string;
    searchTerms: {
      term: string;
      count: number;
      lastSearchedDate?: string;
    }[];
  };
};

export type SalesRepCustomerBrowsedProductsQueryType = {
  salesRepCustomerInsights?: {
    dataAsOf?: string;
    browsedProducts: {
      productId: string;
      name?: string;
      sku?: string;
      imageUrl?: string;
      slug?: string;
      viewCount: number;
      lastViewedDate?: string;
    }[];
  };
};

export const SalesRepCustomerSearchTermsDocument = searchTermsDocument as TypedDocumentNode<
  SalesRepCustomerSearchTermsQueryType,
  SalesRepCustomerInsightsQueryVariablesType
>;

export const SalesRepCustomerBrowsedProductsDocument = browsedProductsDocument as TypedDocumentNode<
  SalesRepCustomerBrowsedProductsQueryType,
  SalesRepCustomerInsightsQueryVariablesType
>;
