import { useLazyQuery } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { globals } from "@/core/globals";
import type { DocumentNode } from "graphql";

const FOOTER_LINKS_DEPTH = 1;

function getFooterLinksTreeString(level: number): string {
  return level > 0
    ? `
      childItems {
        title
        url
        priority
        ${getFooterLinksTreeString(level - 1)}
      }
    `
    : "";
}

function getQueryDocument(maxLevelFooterLinks: number): DocumentNode {
  return gql`
    query WhiteLabelingSettings($storeId: String, $userId: String, $cultureName: String, $organizationId: String) {
      whiteLabelingSettings(
        storeId: $storeId
        userId: $userId
        cultureName: $cultureName
        organizationId: $organizationId
      ) {
        logoUrl
        secondaryLogoUrl
        favicons {
          rel
          type
          sizes
          href
        }
        footerLinks {
          title
          url
          priority
          ${getFooterLinksTreeString(maxLevelFooterLinks)}
        }
      }
    }
  `;
}

export function useGetWhiteLabelingSettings(organizationId: string) {
  const { storeId, userId, cultureName } = globals;

  return useLazyQuery(
    getQueryDocument(FOOTER_LINKS_DEPTH),
    { organizationId, storeId, userId, cultureName },
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );
}
