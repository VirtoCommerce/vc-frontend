import { gql } from "graphql-tag";
import { globals } from "@/core/globals";
import { graphqlClient } from "../../client";
import type { Query, QueryWhiteLabelingSettingsArgs } from "@/core/api/graphql/types";
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
        themePresetName
        isOrganizationLogoUploaded
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

export async function getGetWhiteLabelingSettings() {
  const { storeId, userId, organizationId, cultureName } = globals;

  const { data } = await graphqlClient.query<
    Required<Pick<Query, "whiteLabelingSettings">>,
    QueryWhiteLabelingSettingsArgs
  >({
    query: getQueryDocument(FOOTER_LINKS_DEPTH),
    variables: {
      storeId,
      userId,
      organizationId,
      cultureName,
    },
  });

  return data.whiteLabelingSettings;
}
