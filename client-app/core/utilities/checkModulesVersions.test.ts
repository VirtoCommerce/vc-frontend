import { describe, expect, it } from "vitest";
import { getOutdatedModules } from "./checkModulesVersions";

describe("getOutdatedModules", () => {
  it("reports a Site Builder older than the storefront expects", () => {
    expect(getOutdatedModules([{ moduleId: "VirtoCommerce.SiteBuilder", version: "3.999.0" }])).toEqual([
      { moduleId: "VirtoCommerce.SiteBuilder", backendVersion: "3.999.0", expectedVersion: "3.1000.0" },
    ]);
  });

  it("accepts a Site Builder at the expected version", () => {
    expect(getOutdatedModules([{ moduleId: "VirtoCommerce.SiteBuilder", version: "3.1000.0" }])).toEqual([]);
  });

  it("still checks Page Builder from the backend package list", () => {
    expect(getOutdatedModules([{ moduleId: "VirtoCommerce.PageBuilderModule", version: "3.1.0" }])).toEqual([
      expect.objectContaining({ moduleId: "VirtoCommerce.PageBuilderModule", backendVersion: "3.1.0" }),
    ]);
  });

  it("ignores modules the storefront does not know", () => {
    expect(getOutdatedModules([{ moduleId: "Vendor.Unknown", version: "1.0.0" }])).toEqual([]);
  });
});
