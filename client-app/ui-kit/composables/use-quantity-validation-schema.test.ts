import { describe, expect, it, vi } from "vitest";
import { useQuantityValidationSchema } from ".";

vi.mock("vue-i18n", async () => {
  const actualI18n = await vi.importActual("vue-i18n");

  return {
    ...{ actualI18n },

    useI18n: vi.fn().mockReturnValue({
      t: (key: string) => key,
    }),
  };
});

describe("use-quantity-validation-schema", () => {
  it("quantity is positive", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(quantitySchema.value.isValidSync(1)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(-1)).toBeFalsy();
  });

  it("quantity is integer", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(quantitySchema.value.isValidSync(1)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(0)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(1.5)).toBeFalsy();
  });

  it("quantity is less than system linmit", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(quantitySchema.value.isValidSync(1)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(999999999)).toBeFalsy();
  });

  it("available quantity only", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: 5,
    });

    expect(quantitySchema.value.isValidSync(5)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });

  it("available quantity and correct mininimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: 5,
      minQuantity: 2,
    });

    expect(quantitySchema.value.isValidSync(3)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(1)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });

  it("available quantity and incorrect minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: 5,
      minQuantity: 6,
    });

    expect(quantitySchema.value.isValidSync(4)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });

  it("available quantity and maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: 5,
      maxQuantity: 4,
    });

    expect(quantitySchema.value.isValidSync(4)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(5)).toBeFalsy();
  });

  it("minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      minQuantity: 2,
    });

    expect(quantitySchema.value.isValidSync(2)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(1)).toBeFalsy();
  });

  it("maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      maxQuantity: 2,
    });

    expect(quantitySchema.value.isValidSync(1)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(3)).toBeFalsy();
  });

  it("minimum and maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      minQuantity: 2,
      maxQuantity: 3,
    });

    expect(quantitySchema.value.isValidSync(2)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(3)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(1)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(4)).toBeFalsy();
  });
});
