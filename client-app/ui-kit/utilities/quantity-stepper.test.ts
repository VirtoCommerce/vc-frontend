import { describe, it, expect, test } from "vitest";
import { calculateStepper, checkIfOperationIsAllowed } from "./quantity-stepper";

describe("calculateStepper", () => {
  test.each([
    // Basic operations
    [3, 1, 1, 5, true, "increment", 4, "basic increment within bounds"],
    [3, 1, 1, 5, true, "decrement", 2, "basic decrement within bounds"],
    [3, 2, 0, 10, true, "increment", 5, "increment with step 2"],
    [3, 2, 0, 10, true, "decrement", 1, "decrement with step 2"],

    // Values below minimum
    [1, 2, 3, 10, true, "increment", 4, "increment value below min"],
    [1, 2, 3, 10, true, "decrement", 0, "decrement value below min"],
    [2, 1, 2, 10, true, "decrement", 0, "decrement at min boundary"],

    // Values above maximum
    [12, 2, 1, 9, true, "increment", 8, "increment value above max"],
    [12, 2, 1, 9, true, "decrement", 8, "decrement value above max"],

    // Boundary conditions
    [10, 5, 0, 10, true, "increment", 10, "increment at max boundary"],
    [0, 5, 0, 10, true, "decrement", 0, "decrement at min boundary"],

    // Non-integer steps and bounds
    [5, 2.5, 3.2, 12.7, true, "increment", 7, "increment with float step"],
    [5, 2.5, 3.2, 12.7, true, "decrement", 0, "decrement with float step"],

    // Negative boundaries
    [-3, 2, -10, 10, true, "increment", 0, "increment negative value"],
    [-3, 2, -10, 10, true, "decrement", 0, "decrement negative value"],
    [0, 1, 2, 3, true, "increment", 2, "increment zero to min"],

    // Edge cases
    [5, 0, 0, 10, true, "increment", 5, "increment with zero step"],
    [5, -2, 0, 10, true, "increment", 5, "increment with negative step"],
    [5, 1, 10, 2, true, "increment", 5, "min greater than max"],
    [5, 1, 3, 3, true, "increment", 3, "min equals max"],

    // Max=0 (no upper limit)
    [100, 10, 0, 0, true, "increment", 110, "increment with no max limit"],
    [10, 5, 0, 0, true, "decrement", 5, "decrement with no max limit"],
    [-5, 3, 2, 0, true, "increment", 0, "increment negative with no max"],
    [-5, 3, 2, 0, true, "decrement", 0, "decrement negative with no max"],

    // AllowZero=false scenarios
    [undefined, 1, 0, 10, false, "increment", 2, "increment undefined with allowZero=false"],
    [-5, 2, 3, 10, false, "increment", 4, "increment negative with allowZero=false"],
    [0, 1, 2, 10, false, "decrement", 2, "decrement zero with allowZero=false"],
    [3, 2, 4, 10, false, "decrement", 4, "decrement with allowZero=false"],
    [5, 2, 2, 10, false, "decrement", 3, "decrement above min with allowZero=false"],

    // Undefined value handling
    [undefined, 1, 0, 10, true, "increment", 1, "increment undefined value"],
    [undefined, 1, 0, 10, false, "increment", 2, "increment undefined with allowZero=false"],
    [undefined, 1, 0, 10, true, "decrement", 0, "decrement undefined value"],

    // Floating point truncation
    [5.7, 2.3, 1.8, 10.9, true, "increment", 7, "increment with float truncation"],
    [-2.7, 1.9, 0.5, 5.8, true, "increment", 0, "increment negative float"],

    // Complex scenarios
    [7, 3, 2, 20, true, "increment", 10, "complex increment with alignment"],
    [7, 3, 2, 20, true, "decrement", 4, "complex decrement with alignment"],
    [2, 10, 1, 5, true, "increment", 2, "large step smaller than range"],
  ] as const)("$7", (value, step, min, max, allowZero, direction, expected, description) => {
    const result = calculateStepper(value, step, min, max, allowZero, direction);
    expect(result, description).toBe(expected);
  });

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
    [3, 1, 1, 5, true, "increment", true, "allow basic increment"],
    [5, 1, 1, 5, true, "increment", false, "disallow increment at max"],
    [3, 1, 1, 5, true, "decrement", true, "allow basic decrement"],
    [1, 1, 1, 5, true, "decrement", true, "allow decrement at min"],

    // Boundary conditions
    [3, 2, 1, 7, true, "increment", true, "allow increment unaligned"],
    [6, 2, 1, 7, true, "increment", false, "disallow increment near max"],

    // Max=0 (no upper limit)
    [100, 10, 0, 0, true, "increment", true, "allow increment with no max"],
    [10, 5, 0, 0, true, "decrement", true, "allow decrement with no max"],
    [0, 5, 0, 0, true, "decrement", false, "disallow decrement at zero"],

    // Error conditions
    [3, 0, 1, 5, true, "increment", false, "disallow zero step increment"],
    [3, -1, 1, 5, true, "increment", false, "disallow negative step increment"],
    [3, 0, 1, 5, true, "decrement", false, "disallow zero step decrement"],
    [3, -1, 1, 5, true, "decrement", false, "disallow negative step decrement"],
    [3, 1, 10, 2, true, "increment", false, "disallow when min > max increment"],
    [3, 1, 10, 2, true, "decrement", false, "disallow when min > max decrement"],
    [undefined, 1, 0, 10, true, "increment", false, "disallow undefined increment"],
    [undefined, 1, 0, 10, true, "decrement", false, "disallow undefined decrement"],

    // AllowZero=false scenarios
    [5, 2, 2, 10, false, "decrement", true, "allow decrement with allowZero=false"],
    [2, 2, 2, 10, false, "decrement", false, "disallow decrement to zero with allowZero=false"],
    [1, 2, 2, 10, false, "decrement", false, "disallow decrement below min with allowZero=false"],

    // Increment boundary edge cases
    [8, 2, 0, 10, true, "increment", true, "allow increment within boundary"],
    [10, 2, 0, 10, true, "increment", false, "disallow increment at max boundary"],
    [12, 2, 0, 10, true, "increment", false, "disallow increment above max"],

    // Special edge cases
    [3, 2.5, 0, 10, true, "increment", true, "allow increment with float step"],
    [5, 1, 10, 0, true, "increment", true, "allow increment with min > max (special)"],
  ] as const)("$7", (value, step, min, max, allowZero, direction, expected, description) => {
    const result = checkIfOperationIsAllowed(value, step, min, max, allowZero, direction);
    expect(result, description).toBe(expected);
  });
});
