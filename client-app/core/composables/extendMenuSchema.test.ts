import { describe, expect, it } from "vitest";
import { extendMenuSchema } from "@/core/composables/extendMenuSchema";
import { useNavigations } from "@/core/composables/useNavigations";

describe("extendMenuSchema", () => {
  it("appends a child to the desktop corporate section (via the live useNavigations singleton)", () => {
    extendMenuSchema({
      header: { desktop: { corporate: { children: [{ id: "spec-link", route: { name: "SpecRoute" } }] } } },
    });

    const corporate = useNavigations().desktopCorporateMenuItems.value;
    expect(corporate?.children?.some((c) => c.id === "spec-link")).toBe(true);
  });
});
