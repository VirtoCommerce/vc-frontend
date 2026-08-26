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

/**
 * The debug global is optional by declaration, since only a development build assigns it. This spec
 * forces IS_DEVELOPMENT, so a missing value means the mock above stopped applying — worth failing
 * loudly on rather than reading through a `!`.
 */
function cacheDebug() {
  const debug = window.modulesCacheDebug;
  if (!debug) {
    throw new Error("window.modulesCacheDebug is unset — the IS_DEVELOPMENT mock did not apply");
  }
  return debug;
}

describe("registerCacheTypePolicies", () => {
  it("applies a plugin's keyFields policy so repeated ids are not normalized into one entity", () => {
    registerCacheTypePolicies({ TestPluginWidget: { keyFields: false } }, { owner: "widget-plugin" });

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

    registerCacheTypePolicies({ TestPluginLate: { keyFields: false } }, { owner: "late-plugin" });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("TestPluginLate"));
    // "has data" rather than "normalized": the check now also catches a typename stored inline,
    // which has no normalized key at all.
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("already has data in the cache"));

    warn.mockRestore();
  });

  it("refuses a second owner for the same typename and keeps the policy in place", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    registerCacheTypePolicies({ TestPluginConflict: { keyFields: false } }, { owner: "first-plugin" });
    registerCacheTypePolicies({ TestPluginConflict: { keyFields: ["code"] } }, { owner: "second-plugin" });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("second-plugin"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("first-plugin"));
    expect(cacheDebug().owners.get("TestPluginConflict")).toEqual({
      owner: "first-plugin",
      priority: 0,
    });
    expect(cacheDebug().rejected).toContainEqual({
      typename: "TestPluginConflict",
      owner: "second-plugin",
      priority: 0,
      heldBy: { owner: "first-plugin", priority: 0 },
    });

    warn.mockRestore();
  });

  it("refuses a plugin's keyFields for a typename the host holds only field policies on", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    // The host declares `Product: { fields: { properties: … } }` and no keyFields, so it holds
    // `Product.properties`. keyFields re-keys the whole entity, so it must still be refused - the
    // asymmetry is the point: most host policies are fields-only, and reading ownership per field
    // alone would leave the host's identity rules open to a plugin.
    registerCacheTypePolicies({ Product: { keyFields: false } }, { owner: "greedy-plugin" });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("host"));
    expect(cacheDebug().owners.get("Product.properties")).toEqual({
      owner: "host",
      priority: 100,
    });
    expect(cacheDebug().owners.has("Product")).toBe(false);

    warn.mockRestore();
  });

  it("lets two plugins hold policies for different fields of the same root type", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    // Apollo merges `fields` per field name, so there is nothing to protect here - refusing the
    // second plugin would block a registration Apollo would have accepted additively.
    registerCacheTypePolicies({ Query: { fields: { aList: { keyArgs: ["filter"] } } } }, { owner: "plugin-a" });
    registerCacheTypePolicies({ Query: { fields: { bList: { keyArgs: ["filter"] } } } }, { owner: "plugin-b" });

    expect(cacheDebug().owners.get("Query.aList")).toEqual({ owner: "plugin-a", priority: 0 });
    expect(cacheDebug().owners.get("Query.bList")).toEqual({ owner: "plugin-b", priority: 0 });
    expect(warn).not.toHaveBeenCalled();

    warn.mockRestore();
  });

  it("still refuses a type-level claim on a root type another plugin holds a field of", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    registerCacheTypePolicies({ Mutation: { fields: { doThing: { merge: false } } } }, { owner: "plugin-a" });
    registerCacheTypePolicies({ Mutation: { merge: false } }, { owner: "plugin-b" });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("plugin-a"));
    expect(cacheDebug().owners.has("Mutation")).toBe(false);

    warn.mockRestore();
  });

  it("treats the same owner re-registering its own claim as a no-op, not a collision", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    // What HMR and a second init() both look like. Reporting it as a conflict sent the reader
    // hunting for a second plugin that does not exist.
    registerCacheTypePolicies({ TestPluginIdempotent: { keyFields: false } }, { owner: "same-plugin" });
    registerCacheTypePolicies({ TestPluginIdempotent: { keyFields: false } }, { owner: "same-plugin" });

    expect(warn).not.toHaveBeenCalled();
    expect(cacheDebug().owners.get("TestPluginIdempotent")).toEqual({
      owner: "same-plugin",
      priority: 0,
    });

    warn.mockRestore();
  });

  it("warns about a late root-field policy, which has no normalized key to look for", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    const rootFieldQuery = gql`
      query TestPluginRootField {
        testPluginRootField {
          id
        }
      }
    `;
    cache.writeQuery({
      query: rootFieldQuery,
      data: { testPluginRootField: { __typename: "TestPluginRootField", id: "1" } },
    });

    // `Query` never becomes a `Query:<id>` entity - its fields live under ROOT_QUERY - so the old
    // `startsWith("Query:")` check could not see this, and a late keyArgs orphaned everything
    // already stored under the old field key with no warning at all.
    registerCacheTypePolicies(
      { Query: { fields: { testPluginRootField: { keyArgs: ["id"] } } } },
      { owner: "late-plugin" },
    );

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Query.testPluginRootField"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("already has data in the cache"));

    warn.mockRestore();
  });

  it("refuses a priority aimed above the host's, however high the caller aims", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    // CouponType is one of the host's own declared policies (see cache.ts).
    registerCacheTypePolicies({ CouponType: { keyFields: ["id"] } }, { owner: "loud-plugin", priority: 9999 });

    expect(cacheDebug().owners.get("CouponType")).toEqual({ owner: "host", priority: 100 });
    expect(cacheDebug().rejected).toContainEqual(
      expect.objectContaining({ typename: "CouponType", owner: "loud-plugin" }),
    );
    expect(cache.policies.identify({ __typename: "CouponType", id: "X", code: "C" })[0]).toBe(
      'CouponType:{"code":"C"}',
    );

    warn.mockRestore();
  });

  it("refuses a non-finite priority rather than letting it outrank everything", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    // Every `by.priority >= NaN` comparison is false, so an unsanitized NaN would refuse nothing.
    registerCacheTypePolicies({ CartAddressType: { keyFields: ["id"] } }, { owner: "nan-plugin", priority: NaN });

    expect(cacheDebug().owners.get("CartAddressType")).toEqual({ owner: "host", priority: 100 });

    warn.mockRestore();
  });

  it("lets a deliberately higher priority take a typename over from another plugin", () => {
    vi.spyOn(Logger, "warn").mockImplementation(() => {});

    registerCacheTypePolicies({ TestPluginPriority: { keyFields: false } }, { owner: "first-plugin" });
    registerCacheTypePolicies({ TestPluginPriority: { keyFields: ["code"] } }, { owner: "louder-plugin", priority: 1 });

    expect(cacheDebug().owners.get("TestPluginPriority")).toEqual({
      owner: "louder-plugin",
      priority: 1,
    });

    vi.mocked(Logger.warn).mockRestore();
  });
});
