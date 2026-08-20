import { gql } from "@apollo/client/core";
import { describe, expect, it, vi } from "vitest";
import { Logger } from "@/core/utilities/logger";
import { cache } from "./cache";
import { registerCacheTypePolicies } from "./registerCacheTypePolicies";

// The dev-only guards are the point of this spec; the constant is false under vitest's MODE.
vi.mock("@/core/constants", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/core/constants")>()),
  IS_DEVELOPMENT: true,
}));

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

  it("warns when another caller already registered the same typename", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    registerCacheTypePolicies({ TestPluginConflict: { keyFields: false } });
    registerCacheTypePolicies({ TestPluginConflict: { keyFields: ["code"] } });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("TestPluginConflict"));

    warn.mockRestore();
  });
});
