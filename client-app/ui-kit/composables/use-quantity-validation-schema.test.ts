import { describe, expect, it } from "vitest";
import { mockI18n } from "@/core/mock-i18n";
import { useQuantityValidationSchema } from ".";

describe("use-quantity-validation-schema", () => {
  mockI18n();

  it("max limit only", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(quantitySchema.value.isValidSync(1)).toBe(true);
    expect(quantitySchema.value.isValidSync(9999999)).toBe(false);
  });

  it("available quantity only", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: 10,
    });

    expect(quantitySchema.value.isValidSync(1)).toBe(true);
    expect(quantitySchema.value.isValidSync(10)).toBe(true);
    expect(quantitySchema.value.isValidSync(11)).toBe(false);
  });

  it("available quantity and correct min restriction", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: 10,
      minQuantity: 2,
    });

    expect(quantitySchema.value.isValidSync(1)).toBe(false);
    expect(quantitySchema.value.isValidSync(2)).toBe(true);
    expect(quantitySchema.value.isValidSync(11)).toBe(false);
  });

  /*it("available quantity and incorrect min restriction", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: 10,
      minQuantity: 11,
    });

    expect(quantitySchema.value.isValidSync(1)).toBe(false);
  });

  it("available quantity and correct max restriction", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: 10,
      maxQuantity: 5,
    });

    expect(quantitySchema.value.isValidSync(4)).toBe(true);
    expect(quantitySchema.value.isValidSync(6)).toBe(false);
    expect(quantitySchema.value.isValidSync(11)).toBe(false);
  });*/
});
