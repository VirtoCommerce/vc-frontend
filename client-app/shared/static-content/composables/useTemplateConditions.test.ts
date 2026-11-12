import { describe, expect, it } from "vitest";
import { useTemplateConditions } from "./useTemplateConditions";

describe("getTemplateConditionDescriptors", () => {
  it("declares category ids as a list of strings: a list without element", () => {
    const inCategory = useTemplateConditions()
      .getTemplateConditionDescriptors()
      .find((descriptor) => descriptor.name === "inCategory");

    expect(inCategory?.value).toMatchObject({ type: "list" });
    expect(inCategory?.value).not.toHaveProperty("element");
  });

  it("describes the fields of an object value under element, as schema fields do", () => {
    const descriptors = useTemplateConditions().getTemplateConditionDescriptors();

    for (const name of ["property", "setting"]) {
      const { value } = descriptors.find((descriptor) => descriptor.name === name) ?? { value: {} };

      expect(value).toMatchObject({ type: "object", element: [{ id: "name" }, { id: "equals" }] });
      expect(value).not.toHaveProperty("settings");
    }
  });
});
