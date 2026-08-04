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

  describe("brand profile fields", () => {
    const brandFacts = {
      ...facts,
      description: "Fasteners and fixings for trade buyers.",
      sameAs: ["https://x.com/acme", "https://linkedin.com/company/acme"],
      tagline: "Industrial supply, next day",
      contactPhone: "+1-800-000-0000",
      foundingDate: "1998-04-01",
    };

    it("builds the full node the ticket specifies", () => {
      expect(buildOrganizationNode(brandFacts)).toEqual({
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        "@id": "https://store.example.com/#organization",
        name: "Acme Industrial Supply",
        url: "https://store.example.com/",
        logo: "https://store.example.com/logo.svg",
        description: "Fasteners and fixings for trade buyers.",
        slogan: "Industrial supply, next day",
        sameAs: ["https://x.com/acme", "https://linkedin.com/company/acme"],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+1-800-000-0000",
          contactType: "Customer Service",
        },
        foundingDate: "1998-04-01",
      });
    });

    // An empty sameAs array asserts "this brand has no other presence", which is not the same
    // as "not configured".
    it("omits sameAs when no profile url survived validation", () => {
      expect(buildOrganizationNode({ ...brandFacts, sameAs: [] })).not.toHaveProperty("sameAs");
    });

    it("omits sameAs when the array holds only blanks", () => {
      expect(buildOrganizationNode({ ...brandFacts, sameAs: ["", "   "] })).not.toHaveProperty("sameAs");
    });

    it("drops a blank entry but keeps the rest", () => {
      expect(buildOrganizationNode({ ...brandFacts, sameAs: ["", "https://x.com/acme"] })).toMatchObject({
        sameAs: ["https://x.com/acme"],
      });
    });

    // contactPoint exists only to carry the phone; without one it is an empty shell.
    it("omits contactPoint entirely when the phone is unset", () => {
      expect(buildOrganizationNode({ ...brandFacts, contactPhone: undefined })).not.toHaveProperty("contactPoint");
    });

    it("omits the description when it is unset", () => {
      expect(buildOrganizationNode({ ...brandFacts, description: undefined })).not.toHaveProperty("description");
    });

    it("omits the slogan when the tagline is unset", () => {
      expect(buildOrganizationNode({ ...brandFacts, tagline: undefined })).not.toHaveProperty("slogan");
    });

    it("omits foundingDate when it is unset", () => {
      expect(buildOrganizationNode({ ...brandFacts, foundingDate: undefined })).not.toHaveProperty("foundingDate");
    });

    it("still emits the Phase 1 node when no brand profile is configured", () => {
      expect(buildOrganizationNode(facts)).toEqual({
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        "@id": "https://store.example.com/#organization",
        name: "Acme Industrial Supply",
        url: "https://store.example.com/",
        logo: "https://store.example.com/logo.svg",
      });
    });
  });
});
