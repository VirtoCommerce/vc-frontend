import { gql } from "graphql-tag";
import { graphqlClient } from "../../client";
import type { Query, QueryWhiteLabelingSettingsArgs } from "@/core/api/graphql/types";
import type { DocumentNode } from "graphql";

function getQueryDocument(): DocumentNode {
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
      }
    }
  `;
}

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

export async function getGetWhiteLabelingSettings(domain: string) {
  const { data } = await graphqlClient.query<
    Required<Pick<Query, "whiteLabelingSettings">>,
    QueryWhiteLabelingSettingsArgs
  >({
    query: getQueryDocument(),
    variables: {
      domain
    },
  });

  return data.whiteLabelingSettings;
}

function getFooterLinksDocument(maxLevelFooterLinks: number): DocumentNode {
  return gql`
    query WhiteLabelingSettings($domain: String, $cultureName: String) {
      whiteLabelingSettings(
        domain: $domain,
        cultureName: $cultureName
      ) {
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

export async function getFooterLinks(domain: string, cultureName: string) {
  const { data } = await graphqlClient.query<
    Required<Pick<Query, "whiteLabelingSettings">>,
    QueryWhiteLabelingSettingsArgs
  >({
    query: getFooterLinksDocument(FOOTER_LINKS_DEPTH),
    variables: {
      domain,
      cultureName
    },
  });

  return data.whiteLabelingSettings;
}
