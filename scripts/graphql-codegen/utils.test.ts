import { describe, it, expect, vi } from "vitest";
import {
  addExtension,
  collectErrorMessages,
  describeErrorDetails,
  groupByStatus,
  isSchemaEndpointAbsent,
  normalizeBackendUrl,
  stripCodegenHint,
  truncate,
} from "./utils.js";
import type { OutcomeType } from "./utils.js";

/** Verbatim shape of what `@graphql-codegen/cli` throws when a schema endpoint answers 404. */
const SCHEMA_LOAD_ERROR_MESSAGE = `Failed to load schema from https://example.govirto.com/graphql/sales-rep:
No response returned

GraphQL Code Generator supports:

- ES Modules and CommonJS exports (export as default or named export "schema")
- Introspection JSON File
- URL of GraphQL endpoint
- Multiple files with type definitions (glob expression)
- String in config file

Try to use one of above options and run codegen again.
`;

function respondWith(status: number): typeof fetch {
  return vi.fn(() => Promise.resolve(new Response("{}", { status })));
}

function outcome(name: string, status: OutcomeType["status"]): OutcomeType {
  return { name, typesPath: `client-app/modules/${name}/api/graphql/types.ts`, status };
}

describe("normalizeBackendUrl", () => {
  it("keeps a url without a trailing slash as is", () => {
    expect(normalizeBackendUrl("https://example.govirto.com")).toBe("https://example.govirto.com");
  });

  it("strips trailing slashes so the schema url does not get a double slash", () => {
    expect(normalizeBackendUrl("https://example.govirto.com/")).toBe("https://example.govirto.com");
    expect(normalizeBackendUrl("https://example.govirto.com///")).toBe("https://example.govirto.com");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeBackendUrl("  https://example.govirto.com/ ")).toBe("https://example.govirto.com");
  });

  it("returns an empty string when the variable is not set", () => {
    expect(normalizeBackendUrl(undefined)).toBe("");
    expect(normalizeBackendUrl("")).toBe("");
  });
});

describe("isSchemaEndpointAbsent", () => {
  it("treats 404 as the module not being installed", async () => {
    await expect(
      isSchemaEndpointAbsent("https://example.govirto.com/graphql/sales-rep", respondWith(404)),
    ).resolves.toBe(true);
  });

  it("treats an answering endpoint as installed", async () => {
    await expect(isSchemaEndpointAbsent("https://example.govirto.com/graphql/news", respondWith(200))).resolves.toBe(
      false,
    );
  });

  it("does not mistake a broken or protected endpoint for an uninstalled module", async () => {
    await expect(isSchemaEndpointAbsent("https://example.govirto.com/graphql", respondWith(500))).resolves.toBe(false);
    await expect(isSchemaEndpointAbsent("https://example.govirto.com/graphql", respondWith(401))).resolves.toBe(false);
    await expect(isSchemaEndpointAbsent("https://example.govirto.com/graphql", respondWith(302))).resolves.toBe(false);
  });

  it("leaves the verdict to codegen when the probe itself cannot connect", async () => {
    const failing = vi.fn(() => Promise.reject(new Error("getaddrinfo ENOTFOUND"))) as unknown as typeof fetch;

    await expect(isSchemaEndpointAbsent("https://no-such-host.invalid/graphql", failing)).resolves.toBe(false);
  });

  it("probes with a minimal GraphQL query so an endpoint that rejects GET is not read as absent", async () => {
    const fetchImpl = respondWith(200);

    await isSchemaEndpointAbsent("https://example.govirto.com/graphql/news", fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://example.govirto.com/graphql/news",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "{__typename}" }),
      }),
    );
  });
});

describe("collectErrorMessages", () => {
  it("returns the message of a plain error", () => {
    expect(collectErrorMessages(new Error("boom"))).toEqual(["boom"]);
  });

  it("reports the per-source errors of an aggregate, not the wrapper's copy of them", () => {
    // Codegen builds the wrapper message by joining the nested ones, so the wrapper adds nothing.
    const error = new AggregateError([new Error("first"), new Error("second")], "first\n\nsecond");

    expect(collectErrorMessages(error)).toEqual(["first", "second"]);
  });

  it("digs down to the leaves of nested aggregates", () => {
    const error = new AggregateError([new AggregateError([new Error("leaf")], "inner")], "outer");

    expect(collectErrorMessages(error)).toEqual(["leaf"]);
  });

  it("keeps the wrapper message when its sources have nothing to say", () => {
    expect(collectErrorMessages(new AggregateError([], "only the wrapper knows"))).toEqual(["only the wrapper knows"]);
    expect(collectErrorMessages(new AggregateError([new Error("")], "wrapper"))).toEqual(["wrapper"]);
  });

  it("survives a self-referential error chain instead of overflowing the stack", () => {
    const error: Error & { errors?: unknown[] } = new Error("recursive");
    error.errors = [error];

    expect(collectErrorMessages(error)).toEqual(["recursive"]);
  });

  it("ignores values that are not errors", () => {
    expect(collectErrorMessages(undefined)).toEqual([]);
    expect(collectErrorMessages(null)).toEqual([]);
    expect(collectErrorMessages("just a string")).toEqual([]);
    expect(collectErrorMessages(new Error(""))).toEqual([]);
  });
});

describe("stripCodegenHint", () => {
  it("drops the cheat sheet and collapses the message into one line", () => {
    expect(stripCodegenHint(SCHEMA_LOAD_ERROR_MESSAGE)).toBe(
      "Failed to load schema from https://example.govirto.com/graphql/sales-rep: No response returned",
    );
  });

  it("keeps a message that has no cheat sheet", () => {
    expect(stripCodegenHint("Unknown type Foo")).toBe("Unknown type Foo");
  });
});

describe("truncate", () => {
  it("leaves text within the limit untouched", () => {
    expect(truncate("short", 10)).toBe("short");
  });

  it("marks text it had to cut", () => {
    expect(truncate("0123456789", 4)).toBe("0123…");
  });
});

describe("describeErrorDetails", () => {
  it("reports one line per failing schema source", () => {
    const error = new AggregateError(
      [new Error("first source failed"), new Error("second source failed")],
      "aggregate",
    );

    expect(describeErrorDetails(error)).toBe("first source failed\n  second source failed");
  });

  it("does not repeat the sources inside the message codegen joins them into", () => {
    const error = new AggregateError(
      [new Error("cannot load schema A"), new Error("cannot load schema B")],
      "cannot load schema A\n\ncannot load schema B",
    );

    expect(describeErrorDetails(error)).toBe("cannot load schema A\n  cannot load schema B");
  });

  it("does not repeat the message an aggregate error copied from its only source", () => {
    expect(describeErrorDetails(new AggregateError([new Error("boom")], "boom"))).toBe("boom");
  });

  it("keeps a document validation error listing several fields readable", () => {
    const validation = new Error(
      'GraphQL Document Validation failed with 2 errors;\nError 0: Cannot query field "newsArticle" on type "Query".\nError 1: Cannot query field "newsArticles" on type "Query".',
    );

    expect(describeErrorDetails(validation)).toBe(
      'GraphQL Document Validation failed with 2 errors; Error 0: Cannot query field "newsArticle" on type "Query". Error 1: Cannot query field "newsArticles" on type "Query".',
    );
  });

  it("truncates an endpoint that quoted its whole non-schema response body", () => {
    const html = `<!DOCTYPE html>\n<html>${"<div>filler</div>".repeat(500)}</html>`;
    const details = describeErrorDetails(new Error(`Unexpected response: "${html}"`));

    expect(details.length).toBeLessThanOrEqual(2001);
    expect(details).toMatch(/^Unexpected response: "<!DOCTYPE html>/);
    expect(details.endsWith("…")).toBe(true);
  });

  it("falls back to the value itself when there is no message", () => {
    expect(describeErrorDetails(undefined)).toBe("unknown error");
    expect(describeErrorDetails(null)).toBe("unknown error");
    expect(describeErrorDetails("plain rejection")).toBe("plain rejection");
    expect(describeErrorDetails(404)).toBe("404");
    expect(describeErrorDetails(false)).toBe("false");
    expect(describeErrorDetails(Symbol("nope"))).toBe("Symbol(nope)");
  });

  it("names a rejection that cannot be serialized at all", () => {
    expect(describeErrorDetails(() => "thrown function")).toBe("[object Function]");
  });

  it("serializes an object rejection instead of reporting [object Object]", () => {
    expect(describeErrorDetails({ code: 500, endpoint: "/graphql/news" })).toBe(
      '{"code":500,"endpoint":"/graphql/news"}',
    );
  });

  it("names an error that carries no message", () => {
    expect(describeErrorDetails(new Error(""))).toBe("Error");
    expect(describeErrorDetails(new AggregateError([], ""))).toBe("AggregateError");
  });

  it("survives an object that cannot be serialized", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(describeErrorDetails(circular)).toBe("unserializable error object");
  });
});

describe("groupByStatus", () => {
  it("splits outcomes per status and preserves their order", () => {
    const outcomes = [
      outcome("Core", "generated"),
      outcome("SalesRep", "skipped"),
      outcome("Quotes", "generated"),
      outcome("News", "failed"),
    ];

    expect(groupByStatus(outcomes)).toEqual({
      generated: [outcomes[0], outcomes[2]],
      skipped: [outcomes[1]],
      failed: [outcomes[3]],
    });
  });

  it("returns empty groups for an empty run", () => {
    expect(groupByStatus([])).toEqual({ generated: [], skipped: [], failed: [] });
  });
});

describe("addExtension", () => {
  it("builds a recursive glob for both document extensions", () => {
    expect(addExtension("client-app/modules/news/api/graphql")).toBe(
      "client-app/modules/news/api/graphql/**/*.(graphql|gql)",
    );
  });
});
