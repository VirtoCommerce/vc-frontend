import { describe, it, expect, test } from "vitest";
import { calculateStepper, checkIfOperationIsAllowed } from "./quantity-stepper";

describe("calculateStepper", () => {
  test.each([
    // Basic operations
    [3, 1, 1, 5, true, "increment", 4, "basic"],
    [3, 1, 1, 5, true, "decrement", 2, "basic"],
    [3, 2, 0, 10, true, "increment", 5, "step 2"],
    [3, 2, 0, 10, true, "decrement", 1, "step 2"],

    // Values below minimum
    [1, 2, 3, 10, true, "increment", 4, "below min"],
    [1, 2, 3, 10, true, "decrement", 0, "below min"],
    [2, 1, 2, 10, true, "decrement", 0, "at min"],

    // Values above maximum
    [12, 2, 1, 9, true, "increment", 8, "above max"],
    [12, 2, 1, 9, true, "decrement", 8, "above max"],

    // Boundary conditions
    [10, 5, 0, 10, true, "increment", 10, "at max"],
    [0, 5, 0, 10, true, "decrement", 0, "at min"],

    // Non-integer steps and bounds
    [5, 2.5, 3.2, 12.7, true, "increment", 7, "float step"],
    [5, 2.5, 3.2, 12.7, true, "decrement", 0, "float step"],

    // Negative boundaries
    [-3, 2, -10, 10, true, "increment", 0, "negative"],
    [-3, 2, -10, 10, true, "decrement", 0, "negative"],
    [0, 1, 2, 3, true, "increment", 2, "zero to min"],

    // Edge cases
    [5, 0, 0, 10, true, "increment", 5, "zero step"],
    [5, -2, 0, 10, true, "increment", 5, "negative step"],
    [5, 1, 10, 2, true, "increment", 5, "min > max"],
    [5, 1, 3, 3, true, "increment", 3, "min = max"],

    // Max=0 (no upper limit)
    [100, 10, 0, 0, true, "increment", 110, "no max"],
    [10, 5, 0, 0, true, "decrement", 5, "no max"],
    [-5, 3, 2, 0, true, "increment", 0, "negative no max"],
    [-5, 3, 2, 0, true, "decrement", 0, "negative no max"],

    // AllowZero=false scenarios
    [undefined, 1, 0, 10, false, "increment", 2, "undefined"],
    [-5, 2, 3, 10, false, "increment", 4, "negative"],
    [0, 1, 2, 10, false, "decrement", 2, "zero"],
    [3, 2, 4, 10, false, "decrement", 4, "normal"],
    [5, 2, 2, 10, false, "decrement", 3, "above min"],

    // Undefined value handling
    [undefined, 1, 0, 10, true, "increment", 1, "undefined"],
    [undefined, 1, 0, 10, false, "increment", 2, "undefined"],
    [undefined, 1, 0, 10, true, "decrement", 0, "undefined"],

    // Floating point truncation
    [5.7, 2.3, 1.8, 10.9, true, "increment", 7, "float"],
    [-2.7, 1.9, 0.5, 5.8, true, "increment", 0, "negative float"],

    // Complex scenarios
    [7, 3, 2, 20, true, "increment", 10, "alignment"],
    [7, 3, 2, 20, true, "decrement", 4, "alignment"],
    [2, 10, 1, 5, true, "increment", 2, "large step"],
  ] as const)(
    "$5: $0 with step $1 = $6 | [$2 - $3] allowZero $4 | $7",
    (value, step, min, max, allowZero, direction, expected, description) => {
      const result = calculateStepper(value, step, min, max, allowZero, direction);
      expect(result, description).toBe(expected);
    },
  );

  it("treats undefined allowZero as true", () => {
    const value = 1;
    const step = 2;
    const min = 0;
    const max = 10;
    // @ts-expect-error Testing undefined allowZero parameter
    const result = calculateStepper(value, step, min, max, undefined, "decrement");
    expect(result).toBe(0);
  });
});

describe("checkIfOperationIsAllowed", () => {
  test.each([
    // Basic operations
    [3, 1, 1, 5, true, "increment", true, "allowed"],
    [5, 1, 1, 5, true, "increment", false, "at max"],
    [3, 1, 1, 5, true, "decrement", true, "allowed"],
    [1, 1, 1, 5, true, "decrement", true, "at min"],

    // Boundary conditions
    [3, 2, 1, 7, true, "increment", true, "unaligned"],
    [6, 2, 1, 7, true, "increment", false, "near max"],

    // Max=0 (no upper limit)
    [100, 10, 0, 0, true, "increment", true, "no max"],
    [10, 5, 0, 0, true, "decrement", true, "no max"],
    [0, 5, 0, 0, true, "decrement", false, "at zero"],

    // Error conditions
    [3, 0, 1, 5, true, "increment", false, "zero step"],
    [3, -1, 1, 5, true, "increment", false, "negative step"],
    [3, 0, 1, 5, true, "decrement", false, "zero step"],
    [3, -1, 1, 5, true, "decrement", false, "negative step"],
    [3, 1, 10, 2, true, "increment", false, "min > max"],
    [3, 1, 10, 2, true, "decrement", false, "min > max"],
    [undefined, 1, 0, 10, true, "increment", false, "undefined"],
    [undefined, 1, 0, 10, true, "decrement", false, "undefined"],

    // AllowZero=false scenarios
    [5, 2, 2, 10, false, "decrement", true, "allowed"],
    [2, 2, 2, 10, false, "decrement", false, "to zero"],
    [1, 2, 2, 10, false, "decrement", false, "below min"],

    // Increment boundary edge cases
    [8, 2, 0, 10, true, "increment", true, "within"],
    [10, 2, 0, 10, true, "increment", false, "at max"],
    [12, 2, 0, 10, true, "increment", false, "above max"],

    // Special edge cases
    [3, 2.5, 0, 10, true, "increment", true, "float step"],
    [5, 1, 10, 0, true, "increment", true, "special"],
  ] as const)(
    "$5: $0 with step $1 = $6 | [$2 - $3] allowZero $4 | $7",
    (value, step, min, max, allowZero, direction, expected, description) => {
      const result = checkIfOperationIsAllowed(value, step, min, max, allowZero, direction);
      expect(result, description).toBe(expected);
    },
  );
});
