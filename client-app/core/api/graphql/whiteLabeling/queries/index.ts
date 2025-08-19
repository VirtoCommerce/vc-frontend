import { gql } from "graphql-tag";
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
    query WhiteLabelingSettings($domain: String) {
      whiteLabelingSettings(
        domain: $domain
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

export async function getGetWhiteLabelingSettings(domain: string) {
  const { data } = await graphqlClient.query<
    Required<Pick<Query, "whiteLabelingSettings">>,
    QueryWhiteLabelingSettingsArgs
  >({
    query: getQueryDocument(FOOTER_LINKS_DEPTH),
    variables: {
      domain
    },
  });

  return data.whiteLabelingSettings;
}
