import { describe, it, expect } from "vitest";
import { buildOrganizationNode } from "./useOrganizationSchema";

describe("buildOrganizationNode", () => {
  const facts = {
    id: "https://store.example.com/#organization",
    name: "Acme Industrial Supply",
    url: "https://store.example.com/",
    logoUrl: "https://store.example.com/logo.svg",
  };

  it("builds an OnlineStore node from complete facts", () => {
    expect(buildOrganizationNode(facts)).toEqual({
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      "@id": "https://store.example.com/#organization",
      name: "Acme Industrial Supply",
      url: "https://store.example.com/",
      logo: "https://store.example.com/logo.svg",
    });
  });

  it("returns null when the name is missing, since a nameless organization is not identifiable", () => {
    expect(buildOrganizationNode({ ...facts, name: undefined })).toBeNull();
  });

  it("returns null when the name is blank", () => {
    expect(buildOrganizationNode({ ...facts, name: "   " })).toBeNull();
  });

  it("omits the logo key rather than emitting an empty value", () => {
    const node = buildOrganizationNode({ ...facts, logoUrl: "" });
    expect(node).not.toHaveProperty("logo");
  });

  it("omits the url key when the url is unresolved", () => {
    const node = buildOrganizationNode({ ...facts, url: undefined });
    expect(node).not.toHaveProperty("url");
  });

  it("omits the @id key when it is unresolved", () => {
    const node = buildOrganizationNode({ ...facts, id: undefined });
    expect(node).not.toHaveProperty("@id");
  });

  it("still emits a node when only the name resolves", () => {
    expect(buildOrganizationNode({ name: "Acme" })).toEqual({
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      name: "Acme",
    });
  });

  it("trims surrounding whitespace from the name", () => {
    expect(buildOrganizationNode({ name: "  Acme  " })).toMatchObject({ name: "Acme" });
  });
});
