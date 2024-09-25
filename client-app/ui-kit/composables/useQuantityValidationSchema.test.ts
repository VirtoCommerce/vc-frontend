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
      isInStock: ref(true),
    });

    expect(quantitySchema.value.isValidSync(1)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(LINE_ITEM_QUANTITY_LIMIT + 1)).toBeFalsy();
  });

  it("available quantity only", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      isInStock: ref(true),
      availableQuantity: ref(5),
    });

    expect(quantitySchema.value.isValidSync(5)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });

  it("available quantity >= minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      isInStock: ref(true),
      availableQuantity: ref(5),
      minQuantity: ref(2),
    });

    expect(quantitySchema.value.isValidSync(3)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(1)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });

  it("available quantity < minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      isInStock: ref(true),
      availableQuantity: ref(5),
      minQuantity: ref(6),
    });

    expect(quantitySchema.value.isValidSync(0)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(4)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });

  it("available quantity >= maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      isInStock: ref(true),
      availableQuantity: ref(5),
      maxQuantity: ref(4),
    });

    expect(quantitySchema.value.isValidSync(4)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(5)).toBeFalsy();
  });

  it("available quantity < maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      isInStock: ref(true),
      availableQuantity: ref(5),
      maxQuantity: ref(6),
    });

    expect(quantitySchema.value.isValidSync(5)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });

  it("minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      isInStock: ref(true),
      minQuantity: ref(2),
    });

    expect(quantitySchema.value.isValidSync(2)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(1)).toBeFalsy();
  });

  it("maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      isInStock: ref(true),
      maxQuantity: ref(2),
    });

    expect(quantitySchema.value.isValidSync(1)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(3)).toBeFalsy();
  });

  it("minimum and maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      isInStock: ref(true),
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
      isInStock: ref(true),
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
      isInStock: ref(true),
      availableQuantity: ref(5),
      minQuantity: ref(4),
      maxQuantity: ref(6),
    });

    expect(quantitySchema.value.isValidSync(1)).toBeFalsy();
    expect(quantitySchema.value.isValidSync(4)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(5)).toBeTruthy();
    expect(quantitySchema.value.isValidSync(6)).toBeFalsy();
  });
});
