import { gql } from "@apollo/client/core";
import { describe, expect, it } from "vitest";
import { cache } from "./cache";
import { registerCacheTypePolicies } from "./registerCacheTypePolicies";

const query = gql`
  query TestPluginWidget {
    testPluginWidget {
      id
      name
    }
  }
`;

const data = { testPluginWidget: { __typename: "TestPluginWidget", id: "shared-id", name: "first" } };

describe("registerCacheTypePolicies", () => {
  it("applies a plugin's keyFields policy so repeated ids are not normalized into one entity", () => {
    registerCacheTypePolicies({ TestPluginWidget: { keyFields: false } });

    cache.writeQuery({ query, data });

    // keyFields: false stores the object inline under ROOT_QUERY instead of as its own entity.
    expect(Object.keys(cache.extract())).not.toContain("TestPluginWidget:shared-id");
    expect(cache.readQuery({ query })).toEqual(data);
  });
});
