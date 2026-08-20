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

const lateQuery = gql`
  query TestPluginLate {
    testPluginLate {
      id
      name
    }
  }
`;

describe("registerCacheTypePolicies", () => {
  it("applies a plugin's keyFields policy so repeated ids are not normalized into one entity", () => {
    registerCacheTypePolicies({ TestPluginWidget: { keyFields: false } });

    cache.writeQuery({ query, data });

    // keyFields: false stores the object inline under ROOT_QUERY instead of as its own entity.
    expect(Object.keys(cache.extract())).not.toContain("TestPluginWidget:shared-id");
    expect(cache.readQuery({ query })).toEqual(data);
  });

  it("warns when the typename is already normalized in the cache", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    cache.writeQuery({
      query: lateQuery,
      data: { testPluginLate: { __typename: "TestPluginLate", id: "1", name: "cached before the policy" } },
    });

    registerCacheTypePolicies({ TestPluginLate: { keyFields: false } });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("TestPluginLate"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("already normalized"));

    warn.mockRestore();
  });

  it("refuses a second owner for the same typename and keeps the policy in place", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    registerCacheTypePolicies({ TestPluginConflict: { keyFields: false } }, { owner: "first-plugin" });
    registerCacheTypePolicies({ TestPluginConflict: { keyFields: ["code"] } }, { owner: "second-plugin" });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("second-plugin"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("first-plugin"));
    expect(window.modulesCacheDebug.owners.get("TestPluginConflict")).toEqual({
      owner: "first-plugin",
      priority: 0,
    });
    expect(window.modulesCacheDebug.rejected).toContainEqual({
      typename: "TestPluginConflict",
      owner: "second-plugin",
      priority: 0,
      heldBy: { owner: "first-plugin", priority: 0 },
    });

    warn.mockRestore();
  });

  it("refuses a plugin's policy for a typename the host owns", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    registerCacheTypePolicies({ Product: { keyFields: false } }, { owner: "greedy-plugin" });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("host"));
    expect(window.modulesCacheDebug.owners.get("Product")).toEqual({ owner: "host", priority: 100 });

    warn.mockRestore();
  });

  it("lets a deliberately higher priority take a typename over from another plugin", () => {
    vi.spyOn(Logger, "warn").mockImplementation(() => {});

    registerCacheTypePolicies({ TestPluginPriority: { keyFields: false } }, { owner: "first-plugin" });
    registerCacheTypePolicies({ TestPluginPriority: { keyFields: ["code"] } }, { owner: "louder-plugin", priority: 1 });

    expect(window.modulesCacheDebug.owners.get("TestPluginPriority")).toEqual({
      owner: "louder-plugin",
      priority: 1,
    });

    vi.mocked(Logger.warn).mockRestore();
  });
});
