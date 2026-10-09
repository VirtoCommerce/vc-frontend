import { gql } from "@apollo/client/core";
import { describe, expect, it, vi } from "vitest";
import { Logger } from "@/core/utilities/logger";
import { cache } from "./cache";
import { registerCacheTypePolicies } from "./registerCacheTypePolicies";
import type { TypePolicies } from "@apollo/client/core";

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

  it("refuses a caller that names itself the host, so the host's own rank cannot be downgraded", () => {
    const error = vi.spyOn(Logger, "error").mockImplementation(() => {});
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    // "host" === "host" makes blockedBy()'s same-owner exemption fire before any priority is
    // compared, so without the guard this lands at the default priority AND rewrites the host's
    // record to that priority, leaving the typename open to the next ordinary plugin.
    registerCacheTypePolicies({ CouponType: { keyFields: ["id"] } }, { owner: "host" });
    registerCacheTypePolicies({ CouponType: { keyFields: ["id"] } }, { owner: "opportunist", priority: 1 });

    expect(error).toHaveBeenCalledWith(expect.stringContaining("must not be"));
    expect(cacheDebug().owners.get("CouponType")).toEqual({ owner: "host", priority: 100 });
    expect(cache.policies.identify({ __typename: "CouponType", id: "X", code: "C" })[0]).toBe(
      'CouponType:{"code":"C"}',
    );

    error.mockRestore();
    warn.mockRestore();
  });

  it("refuses a missing owner instead of making every anonymous plugin the same one", () => {
    const error = vi.spyOn(Logger, "error").mockImplementation(() => {});

    const anonymous = {} as { owner: string; priority?: number };
    registerCacheTypePolicies({ TestPluginAnonymous: { keyFields: ["a"] } }, anonymous);
    registerCacheTypePolicies({ TestPluginAnonymous: { keyFields: ["b"] } }, anonymous);

    expect(error).toHaveBeenCalledTimes(2);
    expect(cacheDebug().owners.has("TestPluginAnonymous")).toBe(false);

    error.mockRestore();
  });

  it("reports a missing options object instead of throwing on the destructuring", () => {
    const error = vi.spyOn(Logger, "error").mockImplementation(() => {});

    expect(() =>
      (registerCacheTypePolicies as unknown as (policies: TypePolicies) => void)({
        TestPluginNoOptions: { keyFields: ["a"] },
      }),
    ).not.toThrow();
    expect(cacheDebug().owners.has("TestPluginNoOptions")).toBe(false);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("is required"));

    error.mockRestore();
  });

  it("keeps an owner's rank when a later registration omits the priority", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    // The blessed re-registration path: HMR and a second init() both land here, usually without
    // repeating the priority. Reading the omission as "back to the default" would drop the rank to
    // 0 and hand the claim to any plugin sitting between the two.
    registerCacheTypePolicies({ TestPluginRank: { keyFields: ["a"] } }, { owner: "ranked-plugin", priority: 40 });
    registerCacheTypePolicies({ TestPluginRank: { keyFields: ["a"] } }, { owner: "ranked-plugin" });

    expect(cacheDebug().owners.get("TestPluginRank")).toEqual({ owner: "ranked-plugin", priority: 40 });

    registerCacheTypePolicies({ TestPluginRank: { keyFields: ["b"] } }, { owner: "midfield-plugin", priority: 20 });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("midfield-plugin"));
    expect(cacheDebug().owners.get("TestPluginRank")).toEqual({ owner: "ranked-plugin", priority: 40 });

    warn.mockRestore();
  });

  it("keeps a rank declared on a registration that was refused outright", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    // A plugin declares its rank once at init, and its first registration collides with the host —
    // so it holds nothing at all. Reading the rank back off the claims it holds would find none and
    // silently drop it to the default on the very next call.
    registerCacheTypePolicies({ MoneyType: { keyFields: ["amount"] } }, { owner: "unlucky-plugin", priority: 80 });
    registerCacheTypePolicies({ TestPluginUnlucky: { keyFields: ["a"] } }, { owner: "unlucky-plugin" });

    expect(cacheDebug().owners.get("MoneyType")).toEqual({ owner: "host", priority: 100 });
    expect(cacheDebug().owners.get("TestPluginUnlucky")).toEqual({ owner: "unlucky-plugin", priority: 80 });

    warn.mockRestore();
  });

  it("treats a non-finite priority as no priority at all rather than an explicit zero", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    registerCacheTypePolicies({ TestPluginNaN: { keyFields: ["a"] } }, { owner: "nan-rank-plugin", priority: 70 });
    registerCacheTypePolicies({ TestPluginNaN: { keyFields: ["a"] } }, { owner: "nan-rank-plugin", priority: NaN });

    // Reading NaN as a deliberate 0 would demote every claim the owner holds, and announce it.
    expect(cacheDebug().owners.get("TestPluginNaN")).toEqual({ owner: "nan-rank-plugin", priority: 70 });
    expect(warn).not.toHaveBeenCalled();

    warn.mockRestore();
  });

  it("moves every claim an owner holds when it re-declares a different priority", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    registerCacheTypePolicies(
      { TestPluginMoveA: { keyFields: ["a"] }, TestPluginMoveB: { keyFields: ["b"] } },
      { owner: "mover-plugin", priority: 30 },
    );
    registerCacheTypePolicies({ TestPluginMoveA: { keyFields: ["a"] } }, { owner: "mover-plugin", priority: 60 });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("re-declared its priority as 60"));
    // The claim NOT named in the second call moves too: a rank belongs to the owner, and half its
    // claims sitting at the old number is the split state this avoids.
    expect(cacheDebug().owners.get("TestPluginMoveA")).toEqual({ owner: "mover-plugin", priority: 60 });
    expect(cacheDebug().owners.get("TestPluginMoveB")).toEqual({ owner: "mover-plugin", priority: 60 });

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
