import { describe, it, expect, vi } from "vitest";
import {
  getConfigurationSectionElementId,
  useConfigurationSectionNavigation,
} from "./useConfigurationSectionNavigation";

describe("useConfigurationSectionNavigation", () => {
  it("delivers the requested section id to listeners", () => {
    const listener = vi.fn();
    const { onNavigateToSection } = useConfigurationSectionNavigation();
    const { navigateToSection } = useConfigurationSectionNavigation();

    const off = onNavigateToSection(listener);
    navigateToSection("section-1");
    off();
    navigateToSection("section-2");

    expect(listener.mock.calls.map(([sectionId]) => sectionId)).toEqual(["section-1"]);
  });

  it("builds a stable element id for a section", () => {
    expect(getConfigurationSectionElementId("abc")).toBe("product-configuration-section-abc");
  });
});
