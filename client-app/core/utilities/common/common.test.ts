import { describe, it, expect } from "vitest";
import { replaceXFromBeginning, extractHostname, getLinkAttr, isSafeLinkUrl } from "./index";

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
    // eslint-disable-next-line sonarjs/no-clear-text-protocols
    const link = "http://external-link.com";
    expect(getLinkAttr(link)).toEqual({ externalLink: link });
  });

  it('should return an object with "externalLink" property for a full URL with https', () => {
    const link = "https://external-link.com";
    expect(getLinkAttr(link)).toEqual({ externalLink: link });
  });

  it.each(["mailto:sales@example.com", "tel:+15550100", "whatsapp://send?phone=15550100", "contact-us", "#section"])(
    'returns "externalLink" for the allowed link %s',
    (link) => {
      expect(getLinkAttr(link)).toEqual({ externalLink: link });
    },
  );

  it.each([
    "javascript:alert(1)",
    " JavaScript:alert(1)",
    "java\tscript:alert(1)",
    "vbscript:msgbox(1)",
    "data:text/html,<p>x</p>",
  ])("returns an empty object for the link %j", (link) => {
    expect(getLinkAttr(link)).toEqual({});
  });
});

describe("isSafeLinkUrl", () => {
  it.each([
    "/catalog",
    "https://example.com",
    "http://example.com",
    "mailto:a@b.c",
    "tel:123",
    "sms:+15550100",
    "skype:user?call",
    "page",
  ])("accepts %s", (url) => {
    expect(isSafeLinkUrl(url)).toBe(true);
  });

  it.each([
    "javascript:void(0)",
    "JAVASCRIPT:void(0)",
    "\njavascript:void(0)",
    "vbscript:msgbox(1)",
    "data:image/svg+xml,<svg/>",
  ])("rejects %j", (url) => {
    expect(isSafeLinkUrl(url)).toBe(false);
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
