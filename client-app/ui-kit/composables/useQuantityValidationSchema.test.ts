import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { mockI18n } from "../test-mocks";
import { useQuantityValidationSchema } from ".";

describe("use-quantity-validation-schema", () => {
  mockI18n();

  it("quantity is positive", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(quantitySchema.value.isValidSync(1)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(0)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(-1)).toBeFalsy();
  });

  it("quantity is integer", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(quantitySchema.value.isValidSync(1)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(1.5)).toBeFalsy();
  });

  it("quantity is less than system limit", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      maxQuantity: ref(Number.MAX_SAFE_INTEGER),
    });

    expect(quantitySchema.value.isValidSync(1)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(LINE_ITEM_QUANTITY_LIMIT)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(LINE_ITEM_QUANTITY_LIMIT + 1)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(Number.MAX_SAFE_INTEGER)).toBeFalsy();
  });

  it("available quantity only", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
    });

    expect(quantitySchema.value.isValidSync(5)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });

  it("available quantity >= minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      minQuantity: ref(2),
    });

    expect(quantitySchema.value.isValidSync(3)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(1)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });

  it("available quantity < minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      minQuantity: ref(6),
    });

    expect(quantitySchema.value.isValidSync(0)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(4)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });

  it("available quantity < minimum quantity and has maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(1),
      minQuantity: ref(2),
      maxQuantity: ref(110),
    });

    expect(quantitySchema.value.isValidSync(0)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(4)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });

  it("available quantity >= maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      maxQuantity: ref(4),
    });

    expect(quantitySchema.value.isValidSync(4)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(5)).toBeFalsy();
  });

  it("available quantity < maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      maxQuantity: ref(6),
    });

    expect(quantitySchema.value.isValidSync(5)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });

  it("minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      minQuantity: ref(2),
    });

    expect(quantitySchema.value.isValidSync(2)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(1)).toBeFalsy();
  });

  it("maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      maxQuantity: ref(2),
    });

    expect(quantitySchema.value.isValidSync(1)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(3)).toBeFalsy();
  });

  it("minimum and maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      minQuantity: ref(2),
      maxQuantity: ref(3),
    });

    expect(quantitySchema.value.isValidSync(2)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(3)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(1)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(4)).toBeFalsy();
  });

  it("available quantity, minimum quantity, maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      minQuantity: ref(2),
      maxQuantity: ref(3),
    });

    expect(quantitySchema.value.isValidSync(1)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(2)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(4)).toBeFalsy();
  });

  it("minimum quantity < available quantity < maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      minQuantity: ref(4),
      maxQuantity: ref(6),
    });

    expect(quantitySchema.value.isValidSync(1)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(4)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(5)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });

  it("zero available quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(0),
    });

    // availableQuantity is ignored. The case is handled by blocking input and don't invoke error
    expect(quantitySchema.value.isValidSync(7)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(1)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(0)).toBeFalsy();
  });

  it("non-numeric input", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(quantitySchema.value.isValidSync("a")).toBeFalsy();
    expect(quantitySchema.value.isValidSync(null)).toBeFalsy();
  });

  it("exact match of min and max", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      minQuantity: ref(3),
      maxQuantity: ref(3),
    });

    expect(quantitySchema.value.isValidSync(3)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(2)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(4)).toBeFalsy();
  });

  it("floating point edge cases", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(quantitySchema.value.isValidSync(1.999999)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(2.000001)).toBeFalsy();
  });

  it("quantity is a multiple of pack size", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      packSize: ref(3),
    });

    expect(quantitySchema.value.isValidSync(3)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(6)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(9)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(4)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(5)).toBeFalsy();
  });

  it("quantity is a multiple of pack size with min and max", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      packSize: ref(3),
      minQuantity: ref(3),
      maxQuantity: ref(9),
    });

    expect(quantitySchema.value.isValidSync(3)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(6)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(9)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(12)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(2)).toBeFalsy();
  });

  it("quantity is a multiple of pack size with available quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      packSize: ref(3),
      availableQuantity: ref(9),
    });

    expect(quantitySchema.value.isValidSync(3)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(6)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(9)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(12)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(1)).toBeFalsy();
  });

  it("pack size of 1 (any quantity is valid)", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      packSize: ref(1),
    });

    expect(quantitySchema.value.isValidSync(1)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(2)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(3)).toBeTruthy();
  });

  it("pack size of 0 (invalid configuration)", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      packSize: ref(0),
    });

    // Assuming the schema should handle this gracefully, possibly by ignoring the pack size
    expect(quantitySchema.value.isValidSync(1)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(2)).toBeTruthy();
  });
});
