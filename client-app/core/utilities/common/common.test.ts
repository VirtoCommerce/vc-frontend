import { describe, it, expect } from "vitest";
import { replaceXFromBeginning, extractHostname, getLinkAttr } from "./index";

describe("getLinkAttr", () => {
  it("should return an empty object if no link is provided", () => {
    expect(getLinkAttr()).toEqual({});
  });

  it('should return an object with "to" property if the link starts with "/"', () => {
    const link = "/internal-link";
    expect(getLinkAttr(link)).toEqual({ to: link });
  });

  it('should return an object with "externalLink" property if the link does not start with "/"', () => {
    const link = "https://external-link.com";
    expect(getLinkAttr(link)).toEqual({ externalLink: link });
  });

  it('should return an object with "externalLink" property for a full URL with http', () => {
    const link = "http://external-link.com";
    expect(getLinkAttr(link)).toEqual({ externalLink: link });
  });

  it('should return an object with "externalLink" property for a full URL with https', () => {
    const link = "https://external-link.com";
    expect(getLinkAttr(link)).toEqual({ externalLink: link });
  });
});

describe("extractHostname function", () => {
  it("should extract hostname from a simple URL", () => {
    const url = "https://www.example.com/path/to/page";
    expect(extractHostname(url)).toBe("www.example.com");
  });

  it("should extract hostname from a URL with subdomains", () => {
    const url = "https://subdomain.example.com/path/to/page";
    expect(extractHostname(url)).toBe("subdomain.example.com");
  });

  it("should extract hostname from a URL with port number", () => {
    const url = "https://example.com:8080/path/to/page";
    expect(extractHostname(url)).toBe("example.com");
  });

  it("should extract hostname from a URL with query parameters", () => {
    const url = "https://example.com/path/to/page?param1=value1&param2=value2";
    expect(extractHostname(url)).toBe("example.com");
  });

  it("should extract hostname from a URL without protocol", () => {
    const url = "example.com/path/to/page";
    expect(extractHostname(url)).toBe("example.com");
  });
});

describe("extractHostname function", () => {
  const testCases: [string, string][] = [
    ["XXXXXXXXXXXX1234", "•••• 1234"], // "Visa"
    ["XXXXXXXXXXXX4321", "•••• 4321"], // "MasterCard",
    ["XXXXXXXXXXX5678", "•••• 5678"], // "American Express",
    ["XXXXXXXXXXXX9876", "•••• 9876"], // "Discover",
  ];

  it.each(testCases)("replaceXFromBeginning(%s) -> %s", (maskedNumber, expected) => {
    expect(replaceXFromBeginning(maskedNumber)).toBe(expected);
  });
});
