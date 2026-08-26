import { describe, it, expect, afterEach, vi } from "vitest";
import {
  getReturnUrlValue,
  extractHostname,
  truncate,
  appendSuffixToFilename,
  stringFormat,
  asyncForEach,
  extractNumberFromString,
  replaceXFromBeginning,
  getLinkAttr,
  uniqByLast,
  toCSV,
  areStringOrNumberEqual,
  buildRedirectUrl,
  humanizeName,
} from "./index";
import type { RouteLocationNormalized } from "vue-router";

describe("getReturnUrlValue", () => {
  const originalLocation = window.location;

  afterEach(() => {
    // Restore the original location after each test
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("should return the value of returnUrl parameter", () => {
    // Mock location.href
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://example.com?returnUrl=/home",
      },
    });

    const result = getReturnUrlValue();
    expect(result).toBe("/home");
  });

  it("reads the parameter from a given url instead of the location", () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://example.com/sign-in?returnUrl=/home",
      },
    });

    expect(getReturnUrlValue("/sign-in?returnUrl=/account/orders")).toBe("/account/orders");
  });

  it("checks the host of a given url against the location, not against itself", () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://example.com/sign-in",
      },
    });

    expect(getReturnUrlValue("https://evil.com/x?returnUrl=https://evil.com/steal")).toBeNull();
  });

  it("treats a returnUrl that does not parse as absent", () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://example.com/sign-in?returnUrl=https://[not-valid-ipv6",
      },
    });

    expect(getReturnUrlValue()).toBeNull();
  });

  it("falls through to the next key when the first value does not parse", () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://example.com/sign-in?returnUrl=https://[not-valid-ipv6&ReturnUrl=/home",
      },
    });

    expect(getReturnUrlValue()).toBe("/home");
  });

  it("falls through to the next key when the first value points to another host", () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://example.com/sign-in?returnUrl=https://evil.com/phishing&ReturnUrl=/home",
      },
    });

    expect(getReturnUrlValue()).toBe("/home");
  });

  it("returns null when the given url does not parse", () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://example.com/sign-in",
      },
    });

    expect(getReturnUrlValue("https://[not-valid-ipv6")).toBeNull();
  });

  it("should return the value of ReturnUrl parameter (case-insensitive)", () => {
    // Mock location.href
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://example.com?ReturnUrl=/dashboard",
      },
    });

    const result = getReturnUrlValue();
    expect(result).toBe("/dashboard");
  });

  it("should return null when returnUrl parameter is not present", () => {
    // Mock location.href
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://example.com",
      },
    });

    const result = getReturnUrlValue();
    expect(result).toBeNull();
  });

  it("should return null when returnUrl points to a different hostname", () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://example.com?returnUrl=http://malicious.com/home",
      },
    });

    const result = getReturnUrlValue();
    expect(result).toBeNull();
  });
});

describe("extractHostname", () => {
  it.each([
    { case: "URL with protocol", url: "http://www.example.com/path?query=string", expected: "www.example.com" },
    { case: "URL without protocol", url: "www.example.com/path?query=string", expected: "www.example.com" },
    { case: "URL with port", url: "https://example.com:8080/path", expected: "example.com" },
    { case: "URL with subdomain", url: "https://subdomain.example.com", expected: "subdomain.example.com" },
    { case: "URL with query and hash", url: "http://example.com/path?query=string#hash", expected: "example.com" },
    { case: "string without slashes", url: "localhost:3000", expected: "localhost" },
  ])("should extract hostname from $case ($url -> $expected)", ({ url, expected }) => {
    const result = extractHostname(url);
    expect(result).toBe(expected);
  });
});

describe("truncate", () => {
  it("should truncate string longer than specified length", () => {
    const str = "This is a long string";
    const result = truncate(str, 10);
    expect(result).toBe("This is a ...");
  });

  it("should not truncate string shorter than specified length", () => {
    const str = "Short";
    const result = truncate(str, 10);
    expect(result).toBe("Short");
  });

  it("should return the same string when length equals string length", () => {
    const str = "Exact length";
    const result = truncate(str, str.length);
    expect(result).toBe("Exact length");
  });
});

describe("appendSuffixToFilename", () => {
  it.each([
    { case: "filename with extension", filename: "document.pdf", suffix: "_v2", expected: "document_v2.pdf" },
    { case: "filename without extension", filename: "document", suffix: "_v2", expected: "document_v2" },
    {
      case: "filename with multiple dots",
      filename: "archive.tar.gz",
      suffix: "_backup",
      expected: "archive.tar_backup.gz",
    },
    { case: "empty filename", filename: "", suffix: "_v2", expected: "" },
  ])("should append suffix before extension for $case ($filename -> $expected)", ({ filename, suffix, expected }) => {
    const result = appendSuffixToFilename(filename, suffix);
    expect(result).toBe(expected);
  });

  it("should not append suffix if checkIfSuffixExists is true and suffix already exists", () => {
    const filename = "document_v2.pdf";
    const suffix = "_v2";
    const result = appendSuffixToFilename(filename, suffix, true);
    expect(result).toBe("document_v2.pdf");
  });

  it("should append suffix even if it already exists when checkIfSuffixExists is false", () => {
    const filename = "document_v2.pdf";
    const suffix = "_v2";
    const result = appendSuffixToFilename(filename, suffix, false);
    expect(result).toBe("document_v2_v2.pdf");
  });
});

describe("stringFormat", () => {
  it("should replace placeholders with arguments", () => {
    const template = "Hello, {0}!";
    const result = stringFormat(template, "World");
    expect(result).toBe("Hello, World!");
  });

  it("should replace multiple placeholders", () => {
    const template = "{0} + {1} = {2}";
    const result = stringFormat(template, "1", "1", "2");
    expect(result).toBe("1 + 1 = 2");
  });

  it("should leave unmatched placeholders intact", () => {
    const template = "Hello, {0}! How is {1}?";
    const result = stringFormat(template, "Alice");
    expect(result).toBe("Hello, Alice! How is {1}?");
  });

  it("should handle no placeholders", () => {
    const template = "No placeholders here.";
    const result = stringFormat(template);
    expect(result).toBe("No placeholders here.");
  });
});

describe("asyncForEach", () => {
  it("should call callback for each element in order", async () => {
    const array = [1, 2, 3];
    const callback = vi.fn(async (value: number) => {
      // Simulate async operation
      await Promise.resolve(value);
    });

    await asyncForEach(array, callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback.mock.calls[0][0]).toBe(1);
    expect(callback.mock.calls[1][0]).toBe(2);
    expect(callback.mock.calls[2][0]).toBe(3);
  });

  it("should process elements sequentially", async () => {
    const array = [1, 2, 3];
    const order: number[] = [];

    const callback = async (value: number) => {
      await Promise.resolve();
      order.push(value);
    };

    await asyncForEach(array, callback);

    expect(order).toEqual([1, 2, 3]);
  });
});

describe("extractNumberFromString", () => {
  it.each([
    { case: "the first number from string", str: "abc123def456", expected: 123 },
    { case: "0 if no number is found", str: "abcdef", expected: 0 },
    { case: "number at the start of string", str: "123abc", expected: 123 },
    { case: "number at the end of string", str: "abc456", expected: 456 },
  ])("should extract $case ($str -> $expected)", ({ str, expected }) => {
    const result = extractNumberFromString(str);
    expect(result).toBe(expected);
  });
});

describe("replaceXFromBeginning", () => {
  it.each([
    { case: "replace leading Xs", input: "XXXX1234", expected: "•••• 1234" },
    { case: "not replace non-leading Xs", input: "12XX34", expected: "12XX34" },
    { case: "return original string if no leading Xs", input: "1234", expected: "1234" },
  ])("should $case with default replacement ($input -> $expected)", ({ input, expected }) => {
    const result = replaceXFromBeginning(input);
    expect(result).toBe(expected);
  });

  it("should replace leading Xs with custom replacement", () => {
    const input = "XX-XX-1234";
    const result = replaceXFromBeginning(input, "**");
    expect(result).toBe("**-XX-1234");
  });
});

describe("getLinkAttr", () => {
  it('should return { to: link } when link is an internal route starting with "/"', () => {
    const link = "/internal/path";
    const result = getLinkAttr(link);
    expect(result).toEqual({ to: "/internal/path" });
  });

  it("should return { externalLink: link } when link is an external URL", () => {
    const link = "https://external.com";
    const result = getLinkAttr(link);
    expect(result).toEqual({ externalLink: "https://external.com" });
  });

  it("should return empty object when link is undefined", () => {
    const result = getLinkAttr();
    expect(result).toEqual({});
  });

  it("should return empty object when link is an object", () => {
    const link = { name: "home" };
    const result = getLinkAttr(link);
    expect(result).toEqual({});
  });
});

describe("uniqByLast", () => {
  it("should remove duplicates based on key, keeping the last occurrence", () => {
    const arr = [
      { id: 1, value: "a" },
      { id: 2, value: "b" },
      { id: 1, value: "c" },
    ];

    const result = uniqByLast(arr, "id");

    expect(result).toEqual([
      { id: 2, value: "b" },
      { id: 1, value: "c" },
    ]);
  });

  it("should remove duplicates based on iteratee function", () => {
    const arr = [1.1, 2.2, 1.2, 2.3];

    const result = uniqByLast(arr, Math.floor);

    expect(result).toEqual([1.2, 2.3]);
  });

  it("should return empty array when input is empty", () => {
    const arr: [] = [];
    const result = uniqByLast(arr, "id");
    expect(result).toEqual([]);
  });

  it("should handle non-duplicate array", () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = uniqByLast(arr, "id");
    expect(result).toEqual(arr);
  });
});

describe("toCSV", () => {
  it("should convert array to CSV string", () => {
    const result = toCSV(["a", "b", "c"]);
    expect(result).toBe("a, b, c");
  });

  it("should convert array to CSV string with custom delimiter", () => {
    const result = toCSV(["a", "b", "c"], "|");
    expect(result).toBe("a|b|c");
  });

  it("should handle empty array", () => {
    const result = toCSV([]);
    expect(result).toBe("");
  });

  it("should trim the result", () => {
    const result = toCSV(["  a", "b", "c  "], "|");
    expect(result).toBe("a|b|c");
  });

  it("should handle undefined", () => {
    const result = toCSV();
    expect(result).toBe("");
  });

  it("should filter undefined, null and empty string", () => {
    const result = toCSV([" ", "", undefined, "foo", null, "bar"]);
    expect(result).toBe("foo, bar");
  });
});

describe("areStringOrNumberEqual", () => {
  it("should return true when both values are null", () => {
    expect(areStringOrNumberEqual(null, null)).toBe(true);
  });

  it("should return true when both values are undefined", () => {
    expect(areStringOrNumberEqual(undefined, undefined)).toBe(true);
  });

  it("should return true when one value is null and the other is undefined", () => {
    expect(areStringOrNumberEqual(null, undefined)).toBe(true);
    expect(areStringOrNumberEqual(undefined, null)).toBe(true);
  });

  it("should return true when both values are the same string", () => {
    expect(areStringOrNumberEqual("hello", "hello")).toBe(true);
  });

  it("should return true when both values are the same number", () => {
    expect(areStringOrNumberEqual(42, 42)).toBe(true);
  });

  it("should return true when string and number have the same string representation", () => {
    expect(areStringOrNumberEqual("42", 42)).toBe(true);
    expect(areStringOrNumberEqual(42, "42")).toBe(true);
  });

  it("should return true when number and string have the same string representation", () => {
    expect(areStringOrNumberEqual(0, "0")).toBe(true);
    expect(areStringOrNumberEqual("0", 0)).toBe(true);
  });

  it("should return false when strings are different", () => {
    expect(areStringOrNumberEqual("hello", "world")).toBe(false);
  });

  it("should return false when numbers are different", () => {
    expect(areStringOrNumberEqual(42, 43)).toBe(false);
  });

  it("should return false when string and number have different string representations", () => {
    expect(areStringOrNumberEqual("42", 43)).toBe(false);
    expect(areStringOrNumberEqual(42, "43")).toBe(false);
  });

  it("should return false when one value is null/undefined and the other is not", () => {
    expect(areStringOrNumberEqual(null, "hello")).toBe(false);
    expect(areStringOrNumberEqual(undefined, 42)).toBe(false);
    expect(areStringOrNumberEqual("hello", null)).toBe(false);
    expect(areStringOrNumberEqual(42, undefined)).toBe(false);
  });

  it("should handle edge cases with empty strings and zero", () => {
    expect(areStringOrNumberEqual("", "")).toBe(true);
    expect(areStringOrNumberEqual("", 0)).toBe(false);
    expect(areStringOrNumberEqual(0, "")).toBe(false);
  });
});

describe("buildRedirectUrl", () => {
  it("should return redirect URL when route is redirectable and no return URL keys exist", () => {
    const route = {
      matched: [{ meta: { redirectable: true } }],
      query: {},
      fullPath: "/test/path",
    } as unknown as RouteLocationNormalized;

    const result = buildRedirectUrl(route);
    expect(result).toEqual({ returnUrl: "/test/path" });
  });

  it("should return null when route has redirectable: false in meta", () => {
    const route = {
      matched: [{ meta: { redirectable: false } }],
      query: {},
      fullPath: "/test/path",
    } as unknown as RouteLocationNormalized;

    const result = buildRedirectUrl(route);
    expect(result).toBeNull();
  });

  it("should return null when route has returnUrl in query", () => {
    const route = {
      matched: [{ meta: { redirectable: true } }],
      query: { returnUrl: "/some/path" },
      fullPath: "/test/path",
    } as unknown as RouteLocationNormalized;

    const result = buildRedirectUrl(route);
    expect(result).toBeNull();
  });

  it("should return null when route has ReturnUrl in query", () => {
    const route = {
      matched: [{ meta: { redirectable: true } }],
      query: { ReturnUrl: "/some/path" },
      fullPath: "/test/path",
    } as unknown as RouteLocationNormalized;

    const result = buildRedirectUrl(route);
    expect(result).toBeNull();
  });

  it("should return null when route has both returnUrl and ReturnUrl in query", () => {
    const route = {
      matched: [{ meta: { redirectable: true } }],
      query: { returnUrl: "/some/path", ReturnUrl: "/another/path" },
      fullPath: "/test/path",
    } as unknown as RouteLocationNormalized;

    const result = buildRedirectUrl(route);
    expect(result).toBeNull();
  });

  it("should return redirect URL when route has other query parameters but no return URL keys", () => {
    const route = {
      matched: [{ meta: { redirectable: true } }],
      query: { otherParam: "value", anotherParam: "value2" },
      fullPath: "/test/path?otherParam=value&anotherParam=value2",
    } as unknown as RouteLocationNormalized;

    const result = buildRedirectUrl(route);
    expect(result).toEqual({ returnUrl: "/test/path?otherParam=value&anotherParam=value2" });
  });

  it("should return redirect URL when route has no meta redirectable property", () => {
    const route = {
      matched: [{ meta: {} }],
      query: {},
      fullPath: "/test/path",
    } as unknown as RouteLocationNormalized;

    const result = buildRedirectUrl(route);
    expect(result).toEqual({ returnUrl: "/test/path" });
  });

  it("should return redirect URL when route has no meta property", () => {
    const route = {
      matched: [{}],
      query: {},
      fullPath: "/test/path",
    } as unknown as RouteLocationNormalized;

    const result = buildRedirectUrl(route);
    expect(result).toEqual({ returnUrl: "/test/path" });
  });

  it("should return null when any matched route has redirectable: false", () => {
    const route = {
      matched: [{ meta: { redirectable: true } }, { meta: { redirectable: false } }, { meta: { redirectable: true } }],
      query: {},
      fullPath: "/test/path",
    } as unknown as RouteLocationNormalized;

    const result = buildRedirectUrl(route);
    expect(result).toBeNull();
  });

  it("should handle route with complex fullPath including query and hash", () => {
    const route = {
      matched: [{ meta: { redirectable: true } }],
      query: {},
      fullPath: "/test/path?param=value#section",
    } as unknown as RouteLocationNormalized;

    const result = buildRedirectUrl(route);
    expect(result).toEqual({ returnUrl: "/test/path?param=value#section" });
  });
});

describe("humanizeName", () => {
  it("replaces underscores and hyphens with spaces", () => {
    expect(humanizeName("about_us")).toBe("About us");
    expect(humanizeName("contact-us")).toBe("Contact us");
    expect(humanizeName("my_new-page")).toBe("My new page");
  });

  it("upper-cases the first letter while preserving the rest (keeps acronyms)", () => {
    expect(humanizeName("ARAS_Security")).toBe("ARAS Security");
    expect(humanizeName("landing")).toBe("Landing");
  });

  it("collapses repeated separators and trims", () => {
    expect(humanizeName("  home__page  ")).toBe("Home page");
  });

  it("leaves an already friendly name intact", () => {
    expect(humanizeName("My Page")).toBe("My Page");
  });

  it("returns an empty string for an empty input", () => {
    expect(humanizeName("")).toBe("");
  });

  it("returns an empty string for non-string input", () => {
    expect(humanizeName(undefined)).toBe("");
    expect(humanizeName(null)).toBe("");
    expect(humanizeName({})).toBe("");
  });
});
