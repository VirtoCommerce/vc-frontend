import { describe, it, expect } from "vitest";
import { extractHostname } from "./index";

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
