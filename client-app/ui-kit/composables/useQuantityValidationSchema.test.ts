import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { mockI18n } from "../test-mocks";
import { useQuantityValidationSchema } from ".";

type ErrorType = { type: string };

describe("use-quantity-validation-schema", () => {
  mockI18n();

  it("quantity is positive", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(() => quantitySchema.value.validateSync(1)).not.toThrow();

    try {
      quantitySchema.value.validateSync(0);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("min");
    }

    try {
      quantitySchema.value.validateSync(-1);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("min");
    }
  });

  it("quantity is integer", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(() => quantitySchema.value.validateSync(1)).not.toThrow();

    try {
      quantitySchema.value.validateSync(1.5);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("integer");
    }
  });

  it("quantity is less than system limit", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      maxQuantity: ref(Number.MAX_SAFE_INTEGER),
    });

    expect(() => quantitySchema.value.validateSync(1)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(LINE_ITEM_QUANTITY_LIMIT)).not.toThrow();

    try {
      quantitySchema.value.validateSync(LINE_ITEM_QUANTITY_LIMIT + 1);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("max");
    }

    try {
      quantitySchema.value.validateSync(Number.MAX_SAFE_INTEGER);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("max");
    }
  });

  it("available quantity only", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
    });

    expect(() => quantitySchema.value.validateSync(5)).not.toThrow();

    try {
      quantitySchema.value.validateSync(6);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("maxValue");
    }
  });

  it("available quantity >= minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      minQuantity: ref(2),
    });

    expect(() => quantitySchema.value.validateSync(3)).not.toThrow();

    try {
      quantitySchema.value.validateSync(1);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("minMaxValue");
    }

    try {
      quantitySchema.value.validateSync(6);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("minMaxValue");
    }
  });

  it("available quantity < minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      minQuantity: ref(6),
    });

    try {
      quantitySchema.value.validateSync(0);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("min");
    }

    try {
      quantitySchema.value.validateSync(4);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("incorrectMinValue");
    }

    try {
      quantitySchema.value.validateSync(6);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("incorrectMinValue");
    }
  });

  it("available quantity < minimum quantity and has maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(1),
      minQuantity: ref(2),
      maxQuantity: ref(110),
    });

    try {
      quantitySchema.value.validateSync(0);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("min");
    }

    try {
      quantitySchema.value.validateSync(4);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("incorrectMinValue");
    }

    try {
      quantitySchema.value.validateSync(6);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("incorrectMinValue");
    }
  });

  it("available quantity >= maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      maxQuantity: ref(4),
    });

    expect(() => quantitySchema.value.validateSync(4)).not.toThrow();

    try {
      quantitySchema.value.validateSync(5);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("maxValue");
    }
  });

  it("available quantity < maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      maxQuantity: ref(6),
    });

    expect(() => quantitySchema.value.validateSync(5)).not.toThrow();

    try {
      quantitySchema.value.validateSync(6);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("maxValue");
    }
  });

  it("minimum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      minQuantity: ref(2),
    });

    expect(() => quantitySchema.value.validateSync(2)).not.toThrow();

    try {
      quantitySchema.value.validateSync(1);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("minValue");
    }
  });

  it("maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      maxQuantity: ref(2),
    });

    expect(() => quantitySchema.value.validateSync(1)).not.toThrow();

    try {
      quantitySchema.value.validateSync(3);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("maxValue");
    }
  });

  it("minimum and maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      minQuantity: ref(2),
      maxQuantity: ref(3),
    });

    expect(() => quantitySchema.value.validateSync(2)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(3)).not.toThrow();

    try {
      quantitySchema.value.validateSync(1);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("minMaxValue");
    }

    try {
      quantitySchema.value.validateSync(4);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("minMaxValue");
    }
  });

  it("available quantity, minimum quantity, maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      minQuantity: ref(2),
      maxQuantity: ref(3),
    });

    expect(() => quantitySchema.value.validateSync(2)).not.toThrow();

    try {
      quantitySchema.value.validateSync(1);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("minMaxValue");
    }

    try {
      quantitySchema.value.validateSync(4);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("minMaxValue");
    }
  });

  it("minimum quantity < available quantity < maximum quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(5),
      minQuantity: ref(4),
      maxQuantity: ref(6),
    });

    expect(() => quantitySchema.value.validateSync(4)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(5)).not.toThrow();

    try {
      quantitySchema.value.validateSync(1);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("minMaxValue");
    }

    try {
      quantitySchema.value.validateSync(6);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("minMaxValue");
    }
  });

  it("zero available quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      availableQuantity: ref(0),
    });

    expect(() => quantitySchema.value.validateSync(7)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(1)).not.toThrow();

    try {
      quantitySchema.value.validateSync(0);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("min");
    }
  });

  it("non-numeric input", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    try {
      quantitySchema.value.validateSync("a");
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("typeError");
    }

    try {
      quantitySchema.value.validateSync(null);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("nullable");
    }
  });

  it("exact match of min and max", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      minQuantity: ref(3),
      maxQuantity: ref(3),
    });

    expect(() => quantitySchema.value.validateSync(3)).not.toThrow();

    try {
      quantitySchema.value.validateSync(2);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("minMaxValue");
    }

    try {
      quantitySchema.value.validateSync(4);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("minMaxValue");
    }
  });

  it("floating point edge cases", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    try {
      quantitySchema.value.validateSync(1.999999);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("integer");
    }

    try {
      quantitySchema.value.validateSync(2.000001);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("integer");
    }
  });

  it("quantity is a multiple of pack size", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      packSize: ref(3),
    });

    expect(() => quantitySchema.value.validateSync(3)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(6)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(9)).not.toThrow();

    try {
      quantitySchema.value.validateSync(4);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("divisible-by-packSize");
    }

    try {
      quantitySchema.value.validateSync(5);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("divisible-by-packSize");
    }
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

    try {
      quantitySchema.value.validateSync(12);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("minMaxValue");
    }

    try {
      quantitySchema.value.validateSync(2);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("divisible-by-packSize");
    }
  });

  it("quantity is a multiple of pack size with available quantity", () => {
    const { quantitySchema } = useQuantityValidationSchema({
      packSize: ref(3),
      availableQuantity: ref(9),
    });

    expect(() => quantitySchema.value.validateSync(3)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(6)).not.toThrow();
    expect(() => quantitySchema.value.validateSync(9)).not.toThrow();

    try {
      quantitySchema.value.validateSync(12);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("maxValue");
    }

    try {
      quantitySchema.value.validateSync(1);
    } catch (err) {
      const error = err as ErrorType;
      expect(error.type).toBe("divisible-by-packSize");
    }
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
