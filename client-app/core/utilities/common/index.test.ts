import { describe, it, expect, afterEach, vi } from "vitest";
import {
  getBaseUrl,
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
} from "./index";

describe("getBaseUrl", () => {
  const originalLocation = window.location;

  afterEach(() => {
    // Restore the original location after each test
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("should return base URL with locale when locale is in pathname", () => {
    const supportedLocales = ["en", "fr", "de"];

    // Mock location.pathname
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/en/some/path",
      },
    });

    const result = getBaseUrl(supportedLocales);
    expect(result).toBe("/en/");
  });

  it("should return empty string when locale is not in pathname", () => {
    const supportedLocales = ["en", "fr", "de"];

    // Mock location.pathname
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/some/path",
      },
    });

    const result = getBaseUrl(supportedLocales);
    expect(result).toBe("");
  });
});

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
  it("should extract hostname from URL with protocol", () => {
    const url = "http://www.example.com/path?query=string";
    const result = extractHostname(url);
    expect(result).toBe("www.example.com");
  });

  it("should extract hostname from URL without protocol", () => {
    const url = "www.example.com/path?query=string";
    const result = extractHostname(url);
    expect(result).toBe("www.example.com");
  });

  it("should extract hostname from URL with port", () => {
    const url = "https://example.com:8080/path";
    const result = extractHostname(url);
    expect(result).toBe("example.com");
  });

  it("should extract hostname from URL with subdomain", () => {
    const url = "https://subdomain.example.com";
    const result = extractHostname(url);
    expect(result).toBe("subdomain.example.com");
  });

  it("should extract hostname from URL with query and hash", () => {
    const url = "http://example.com/path?query=string#hash";
    const result = extractHostname(url);
    expect(result).toBe("example.com");
  });

  it("should return the input string if it does not contain slashes", () => {
    const url = "localhost:3000";
    const result = extractHostname(url);
    expect(result).toBe("localhost");
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
  it("should append suffix to filename before extension", () => {
    const filename = "document.pdf";
    const suffix = "_v2";
    const result = appendSuffixToFilename(filename, suffix);
    expect(result).toBe("document_v2.pdf");
  });

  it("should append suffix to filename without extension", () => {
    const filename = "document";
    const suffix = "_v2";
    const result = appendSuffixToFilename(filename, suffix);
    expect(result).toBe("document_v2");
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

  it("should handle filenames with multiple dots", () => {
    const filename = "archive.tar.gz";
    const suffix = "_backup";
    const result = appendSuffixToFilename(filename, suffix);
    expect(result).toBe("archive.tar_backup.gz");
  });

  it("should return the original filename if filename is empty", () => {
    const filename = "";
    const suffix = "_v2";
    const result = appendSuffixToFilename(filename, suffix);
    expect(result).toBe("");
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
  it("should extract the first number from string", () => {
    const str = "abc123def456";
    const result = extractNumberFromString(str);
    expect(result).toBe(123);
  });

  it("should return 0 if no number is found", () => {
    const str = "abcdef";
    const result = extractNumberFromString(str);
    expect(result).toBe(0);
  });

  it("should extract number at the start of string", () => {
    const str = "123abc";
    const result = extractNumberFromString(str);
    expect(result).toBe(123);
  });

  it("should extract number at the end of string", () => {
    const str = "abc456";
    const result = extractNumberFromString(str);
    expect(result).toBe(456);
  });
});

describe("replaceXFromBeginning", () => {
  it("should replace leading Xs with default replacement", () => {
    const input = "XXXX1234";
    const result = replaceXFromBeginning(input);
    expect(result).toBe("•••• 1234");
  });

  it("should replace leading Xs with custom replacement", () => {
    const input = "XX-XX-1234";
    const result = replaceXFromBeginning(input, "**");
    expect(result).toBe("**-XX-1234");
  });

  it("should not replace non-leading Xs", () => {
    const input = "12XX34";
    const result = replaceXFromBeginning(input);
    expect(result).toBe("12XX34");
  });

  it("should return original string if no leading Xs", () => {
    const input = "1234";
    const result = replaceXFromBeginning(input);
    expect(result).toBe("1234");
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
});
