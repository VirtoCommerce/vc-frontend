import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { mockI18n } from "../test-mocks";
import { useQuantityValidationSchema } from ".";

describe("use-quantity-validation-schema", () => {
  mockI18n();

  it("quantity is positive", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(() => quantitySchema.value.validateSync(1)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(0)).toThrowError(expect.objectContaining({ type: "min" }) as Error);
    expect(() => quantitySchema.value.validateSync(-1)).toThrowError(expect.objectContaining({ type: "min" }) as Error);
  });

  it("quantity is integer", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(() => quantitySchema.value.validateSync(1)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(1.5)).toThrowError(
      expect.objectContaining({ type: "integer" }) as Error,
    );
  });

  it("quantity is less than system limit", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      maxQuantity: ref(Number.MAX_SAFE_INTEGER),
    });

    expect(() => quantitySchema.value.validateSync(1)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(LINE_ITEM_QUANTITY_LIMIT)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(LINE_ITEM_QUANTITY_LIMIT + 1)).toThrowError(
      expect.objectContaining({ type: "max" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(Number.MAX_SAFE_INTEGER)).toThrowError(
      expect.objectContaining({ type: "max" }) as Error,
    );
  });

  it("available quantity only", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
    });

    expect(() => quantitySchema.value.validateSync(5)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(6)).toThrowError(
      expect.objectContaining({ type: "maxValue" }) as Error,
    );
  });

  it("available quantity >= minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      minQuantity: ref(2),
    });

    expect(() => quantitySchema.value.validateSync(3)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(1)).toThrowError(
      expect.objectContaining({ type: "minMaxValue" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(6)).toThrowError(
      expect.objectContaining({ type: "minMaxValue" }) as Error,
    );
  });

  it("available quantity equals minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(3),
      minQuantity: ref(3),
      maxQuantity: ref(0),
    });

    expect(() => quantitySchema.value.validateSync(3)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(2)).toThrowError(
      expect.objectContaining({ type: "exactQtyValue" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(4)).toThrowError(
      expect.objectContaining({ type: "exactQtyValue" }) as Error,
    );
  });

  it("available quantity < minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      minQuantity: ref(6),
    });

    expect(() => quantitySchema.value.validateSync(0)).toThrowError(expect.objectContaining({ type: "min" }) as Error);
    expect(() => quantitySchema.value.validateSync(4)).toThrowError(
      expect.objectContaining({ type: "incorrectMinValue" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(6)).toThrowError(
      expect.objectContaining({ type: "incorrectMinValue" }) as Error,
    );
  });

  it("available quantity < minimum quantity and has maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(1),
      minQuantity: ref(2),
      maxQuantity: ref(110),
    });

    expect(() => quantitySchema.value.validateSync(0)).toThrowError(expect.objectContaining({ type: "min" }) as Error);
    expect(() => quantitySchema.value.validateSync(4)).toThrowError(
      expect.objectContaining({ type: "incorrectMinValue" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(6)).toThrowError(
      expect.objectContaining({ type: "incorrectMinValue" }) as Error,
    );
  });

  it("available quantity >= maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      maxQuantity: ref(4),
    });

    expect(() => quantitySchema.value.validateSync(4)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(5)).toThrowError(
      expect.objectContaining({ type: "maxValue" }) as Error,
    );
  });

  it("available quantity < maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      maxQuantity: ref(6),
    });

    expect(() => quantitySchema.value.validateSync(5)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(6)).toThrowError(
      expect.objectContaining({ type: "maxValue" }) as Error,
    );
  });

  it("minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      minQuantity: ref(2),
    });

    expect(() => quantitySchema.value.validateSync(2)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(1)).toThrowError(
      expect.objectContaining({ type: "minValue" }) as Error,
    );
  });

  it("maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      maxQuantity: ref(2),
    });

    expect(() => quantitySchema.value.validateSync(1)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(3)).toThrowError(
      expect.objectContaining({ type: "maxValue" }) as Error,
    );
  });

  it("minimum and maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      minQuantity: ref(2),
      maxQuantity: ref(3),
    });

    expect(() => quantitySchema.value.validateSync(2)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(3)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(1)).toThrowError(
      expect.objectContaining({ type: "minMaxValue" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(4)).toThrowError(
      expect.objectContaining({ type: "minMaxValue" }) as Error,
    );
  });

  it("available quantity, minimum quantity, maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      minQuantity: ref(2),
      maxQuantity: ref(3),
    });

    expect(() => quantitySchema.value.validateSync(2)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(1)).toThrowError(
      expect.objectContaining({ type: "minMaxValue" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(4)).toThrowError(
      expect.objectContaining({ type: "minMaxValue" }) as Error,
    );
  });

  it("minimum quantity < available quantity < maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      minQuantity: ref(4),
      maxQuantity: ref(6),
    });

    expect(() => quantitySchema.value.validateSync(4)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(5)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(1)).toThrowError(
      expect.objectContaining({ type: "minMaxValue" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(6)).toThrowError(
      expect.objectContaining({ type: "minMaxValue" }) as Error,
    );
  });

  it("zero available quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(0),
    });

    expect(() => quantitySchema.value.validateSync(7)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(1)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(0)).toThrowError(expect.objectContaining({ type: "min" }) as Error);
  });

  it("non-numeric input", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(() => quantitySchema.value.validateSync("a")).toThrowError(
      expect.objectContaining({ type: "typeError" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(null)).toThrowError(
      expect.objectContaining({ type: "nullable" }) as Error,
    );
  });

  it("exact match of min and max", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      minQuantity: ref(3),
      maxQuantity: ref(3),
    });

    expect(() => quantitySchema.value.validateSync(3)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(2)).toThrowError(
      expect.objectContaining({ type: "minMaxValue" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(4)).toThrowError(
      expect.objectContaining({ type: "minMaxValue" }) as Error,
    );
  });

  it("floating point edge cases", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(() => quantitySchema.value.validateSync(1.999999)).toThrowError(
      expect.objectContaining({ type: "integer" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(2.000001)).toThrowError(
      expect.objectContaining({ type: "integer" }) as Error,
    );
  });

  it("quantity is a multiple of pack size", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      packSize: ref(3),
    });

    expect(() => quantitySchema.value.validateSync(3)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(6)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(9)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(4)).toThrowError(
      expect.objectContaining({ type: "divisible-by-packSize" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(5)).toThrowError(
      expect.objectContaining({ type: "divisible-by-packSize" }) as Error,
    );
  });

  it("quantity is a multiple of pack size with min and max", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      packSize: ref(3),
      minQuantity: ref(2),
      maxQuantity: ref(9),
    });

    expect(() => quantitySchema.value.validateSync(3)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(6)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(9)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(12)).toThrowError(
      expect.objectContaining({ type: "minMaxValue" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(2)).toThrowError(
      expect.objectContaining({ type: "divisible-by-packSize" }) as Error,
    );
  });

  it("quantity is a multiple of pack size with available quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      packSize: ref(3),
      availableQuantity: ref(9),
    });

    expect(() => quantitySchema.value.validateSync(3)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(6)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(9)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(12)).toThrowError(
      expect.objectContaining({ type: "maxValue" }) as Error,
    );
    expect(() => quantitySchema.value.validateSync(1)).toThrowError(
      expect.objectContaining({ type: "divisible-by-packSize" }) as Error,
    );
  });

  it("pack size of 1 (any quantity is valid)", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      packSize: ref(1),
    });

    expect(() => quantitySchema.value.validateSync(1)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(2)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(3)).not.toThrow();
  });

  it("pack size of 0 (invalid configuration)", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      packSize: ref(0),
    });

    expect(() => quantitySchema.value.validateSync(1)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(2)).not.toThrow();
  });
});
