import { describe, expect, test } from "vitest";
import { calculateStepper, checkIfOperationIsAllowed } from "./quantity-stepper";

describe("calculateStepper", () => {
  test.each([
    // Basic operations
    [{ value: 3, step: 1, min: 1, max: 5, allowZero: true, direction: "increment" as const }, 4, "basic"],
    [{ value: 3, step: 1, min: 1, max: 5, allowZero: true, direction: "decrement" as const }, 2, "basic"],
    [{ value: 3, step: 2, min: 0, max: 10, allowZero: true, direction: "increment" as const }, 5, "step 2"],
    [{ value: 3, step: 2, min: 0, max: 10, allowZero: true, direction: "decrement" as const }, 1, "step 2"],

    // Values below minimum
    [{ value: 1, step: 2, min: 3, max: 10, allowZero: true, direction: "increment" as const }, 4, "below min"],
    [{ value: 1, step: 2, min: 3, max: 10, allowZero: true, direction: "decrement" as const }, 0, "below min"],
    [{ value: 2, step: 1, min: 2, max: 10, allowZero: true, direction: "decrement" as const }, 0, "at min"],

    // Values above maximum
    [{ value: 12, step: 2, min: 1, max: 9, allowZero: true, direction: "increment" as const }, 8, "above max"],
    [{ value: 12, step: 2, min: 1, max: 9, allowZero: true, direction: "decrement" as const }, 8, "above max"],

    // Boundary conditions
    [{ value: 10, step: 5, min: 0, max: 10, allowZero: true, direction: "increment" as const }, 10, "at max"],
    [{ value: 0, step: 5, min: 0, max: 10, allowZero: true, direction: "decrement" as const }, 0, "at min"],

    // Non-integer steps and bounds
    [{ value: 5, step: 2.5, min: 3.2, max: 12.7, allowZero: true, direction: "increment" as const }, 7, "float step"],
    [{ value: 5, step: 2.5, min: 3.2, max: 12.7, allowZero: true, direction: "decrement" as const }, 0, "float step"],

    // Negative boundaries
    [{ value: -3, step: 2, min: -10, max: 10, allowZero: true, direction: "increment" as const }, 0, "negative"],
    [{ value: -3, step: 2, min: -10, max: 10, allowZero: true, direction: "decrement" as const }, 0, "negative"],
    [{ value: 0, step: 1, min: 2, max: 3, allowZero: true, direction: "increment" as const }, 2, "zero to min"],

    // Edge cases
    [{ value: 5, step: 0, min: 0, max: 10, allowZero: true, direction: "increment" as const }, 5, "zero step"],
    [{ value: 5, step: -2, min: 0, max: 10, allowZero: true, direction: "increment" as const }, 5, "negative step"],
    [{ value: 5, step: 1, min: 10, max: 2, allowZero: true, direction: "increment" as const }, 5, "min > max"],
    [{ value: 5, step: 1, min: 3, max: 3, allowZero: true, direction: "increment" as const }, 3, "min = max"],

    // Max=0 (no upper limit)
    [{ value: 100, step: 10, min: 0, max: 0, allowZero: true, direction: "increment" as const }, 110, "no max"],
    [{ value: 10, step: 5, min: 0, max: 0, allowZero: true, direction: "decrement" as const }, 5, "no max"],
    [{ value: -5, step: 3, min: 2, max: 0, allowZero: true, direction: "increment" as const }, 0, "negative no max"],
    [{ value: -5, step: 3, min: 2, max: 0, allowZero: true, direction: "decrement" as const }, 0, "negative no max"],

    // AllowZero=false scenarios
    [{ value: undefined, step: 1, min: 0, max: 10, allowZero: false, direction: "increment" as const }, 2, "undefined"],
    [{ value: -5, step: 2, min: 3, max: 10, allowZero: false, direction: "increment" as const }, 4, "negative"],
    [{ value: 0, step: 1, min: 2, max: 10, allowZero: false, direction: "decrement" as const }, 2, "zero"],
    [{ value: 3, step: 2, min: 4, max: 10, allowZero: false, direction: "decrement" as const }, 4, "normal"],
    [{ value: 5, step: 2, min: 2, max: 10, allowZero: false, direction: "decrement" as const }, 3, "above min"],

    // Undefined allowZero handling
    [
      { value: 1, step: 2, min: 0, max: 10, allowZero: undefined, direction: "decrement" as const },
      0,
      "allowZero undefined",
    ],

    // Undefined value handling
    [
      { value: undefined, step: 1, min: 0, max: 10, allowZero: true, direction: "increment" as const },
      1,
      "value undefined",
    ],
    [{ value: undefined, step: 1, min: 0, max: 10, allowZero: false, direction: "increment" as const }, 2, "undefined"],
    [
      { value: undefined, step: 1, min: 0, max: 10, allowZero: true, direction: "decrement" as const },
      0,
      "value undefined",
    ],

    // Floating point truncation
    [{ value: 5.7, step: 2.3, min: 1.8, max: 10.9, allowZero: true, direction: "increment" as const }, 7, "float"],
    [
      { value: -2.7, step: 1.9, min: 0.5, max: 5.8, allowZero: true, direction: "increment" as const },
      0,
      "negative float",
    ],

    // Complex scenarios
    [{ value: 2, step: 10, min: 1, max: 5, allowZero: true, direction: "increment" as const }, 2, "large step"],
    [{ value: 7, step: 3, min: 2, max: 20, allowZero: true, direction: "increment" as const }, 10, "alignment"],
    [{ value: 7, step: 3, min: 2, max: 20, allowZero: true, direction: "decrement" as const }, 4, "alignment"],
  ] as const)(
    "$direction $value with step $step = $1 | [$min - $max] allowZero $allowZero | $2",
    (options, expected, description) => {
      const result = calculateStepper(options);
      expect(result, description).toBe(expected);
    },
  );
});

describe("checkIfOperationIsAllowed", () => {
  test.each([
    // Basic operations
    [{ value: 3, step: 1, min: 1, max: 5, allowZero: true, direction: "increment" as const }, true, "allowed"],
    [{ value: 5, step: 1, min: 1, max: 5, allowZero: true, direction: "increment" as const }, false, "at max"],
    [{ value: 3, step: 1, min: 1, max: 5, allowZero: true, direction: "decrement" as const }, true, "allowed"],
    [{ value: 1, step: 1, min: 1, max: 5, allowZero: true, direction: "decrement" as const }, true, "at min"],

    // Boundary conditions
    [{ value: 3, step: 2, min: 1, max: 7, allowZero: true, direction: "increment" as const }, true, "unaligned"],
    [{ value: 6, step: 2, min: 1, max: 7, allowZero: true, direction: "increment" as const }, false, "near max"],

    // Max=0 (no upper limit)
    [{ value: 100, step: 10, min: 0, max: 0, allowZero: true, direction: "increment" as const }, true, "no max"],
    [{ value: 10, step: 5, min: 0, max: 0, allowZero: true, direction: "decrement" as const }, true, "no max"],
    [{ value: 0, step: 5, min: 0, max: 0, allowZero: true, direction: "decrement" as const }, false, "at zero"],

    // Error conditions
    [{ value: 3, step: 0, min: 1, max: 5, allowZero: true, direction: "increment" as const }, false, "zero step"],
    [{ value: 3, step: -1, min: 1, max: 5, allowZero: true, direction: "increment" as const }, false, "negative step"],
    [{ value: 3, step: 0, min: 1, max: 5, allowZero: true, direction: "decrement" as const }, false, "zero step"],
    [{ value: 3, step: -1, min: 1, max: 5, allowZero: true, direction: "decrement" as const }, false, "negative step"],
    [{ value: 3, step: 1, min: 10, max: 2, allowZero: true, direction: "increment" as const }, false, "min > max"],
    [{ value: 3, step: 1, min: 10, max: 2, allowZero: true, direction: "decrement" as const }, false, "min > max"],
    [
      { value: undefined, step: 1, min: 0, max: 10, allowZero: true, direction: "increment" as const },
      false,
      "undefined",
    ],
    [
      { value: undefined, step: 1, min: 0, max: 10, allowZero: true, direction: "decrement" as const },
      false,
      "undefined",
    ],

    // AllowZero=false scenarios
    [{ value: 5, step: 2, min: 2, max: 10, allowZero: false, direction: "decrement" as const }, true, "allowed"],
    [{ value: 2, step: 2, min: 2, max: 10, allowZero: false, direction: "decrement" as const }, false, "to zero"],
    [{ value: 1, step: 2, min: 2, max: 10, allowZero: false, direction: "decrement" as const }, false, "below min"],

    // Increment boundary edge cases
    [{ value: 8, step: 2, min: 0, max: 10, allowZero: true, direction: "increment" as const }, true, "within"],
    [{ value: 10, step: 2, min: 0, max: 10, allowZero: true, direction: "increment" as const }, false, "at max"],
    [{ value: 12, step: 2, min: 0, max: 10, allowZero: true, direction: "increment" as const }, false, "above max"],

    // Special edge cases
    [{ value: 3, step: 2.5, min: 0, max: 10, allowZero: true, direction: "increment" as const }, true, "float step"],
    [{ value: 5, step: 1, min: 10, max: 0, allowZero: true, direction: "increment" as const }, true, "special"],
  ] as const)(
    "$direction $value with step $step = $1 | [$min - $max] allowZero $allowZero | $2",
    (options, expected, description) => {
      const result = checkIfOperationIsAllowed(options);
      expect(result, description).toBe(expected);
    },
  );
});
