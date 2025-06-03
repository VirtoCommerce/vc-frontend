import { describe, it, expect } from "vitest";
import { calculateStepper, checkIfOperationIsAllowed } from "./quantity-stepper";

describe("calculateStepper", () => {
  describe("aligned values", () => {
    it("increments an aligned value within boundaries", () => {
      const value = 3;
      const step = 1;
      const min = 1;
      const max = 5;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(4);
    });

    it("decrements an aligned value within boundaries", () => {
      const value = 3;
      const step = 1;
      const min = 1;
      const max = 5;
      const result = calculateStepper(value, step, min, max, true, "decrement");
      expect(result).toBe(2);
    });
  });

  describe("unaligned initial values", () => {
    it("increments an unaligned value within boundaries", () => {
      const value = 3;
      const step = 2;
      const min = 0;
      const max = 10;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(5);
    });

    it("decrements an unaligned value within boundaries", () => {
      const value = 3;
      const step = 2;
      const min = 0;
      const max = 10;
      const result = calculateStepper(value, step, min, max, true, "decrement");
      expect(result).toBe(1);
    });
  });

  describe("values below minimum", () => {
    it("clamps to minAligned then increments", () => {
      const value = 1;
      const step = 2;
      const min = 3;
      const max = 10;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(4);
    });

    it("clamps to minAligned then decrements", () => {
      const value = 1;
      const step = 2;
      const min = 3;
      const max = 10;
      const result = calculateStepper(value, step, min, max, true, "decrement");
      expect(result).toBe(0);
    });

    it("clamps to minAligned then decrements", () => {
      const value = 2;
      const step = 1;
      const min = 2;
      const max = 10;
      const result = calculateStepper(value, step, min, max, true, "decrement");
      expect(result).toBe(0);
    });
  });

  describe("values above maximum", () => {
    it("clamps to maxAligned then increments", () => {
      const value = 12;
      const step = 2;
      const min = 1;
      const max = 9;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(8);
    });

    it("clamps to maxAligned then decrements", () => {
      const value = 12;
      const step = 2;
      const min = 1;
      const max = 9;
      const result = calculateStepper(value, step, min, max, true, "decrement");
      expect(result).toBe(8);
    });
  });

  describe("boundary conditions", () => {
    it("does not exceed max on increment at maxAligned", () => {
      const value = 10;
      const step = 5;
      const min = 0;
      const max = 10;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(10);
    });

    it("does not go below min on decrement at minAligned", () => {
      const value = 0;
      const step = 5;
      const min = 0;
      const max = 10;
      const result = calculateStepper(value, step, min, max, true, "decrement");
      expect(result).toBe(0);
    });
  });

  describe("non-integer steps and bounds", () => {
    it("aligns non-integer min and max then increments", () => {
      const value = 5;
      const step = 2.5;
      const min = 3.2;
      const max = 12.7;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(7);
    });

    it("aligns non-integer min and max then decrements", () => {
      const value = 5;
      const step = 2.5;
      const min = 3.2;
      const max = 12.7;
      const result = calculateStepper(value, step, min, max, true, "decrement");
      expect(result).toBe(0);
    });
  });

  describe("step larger than range", () => {
    it("returns consistent result when step > (max - min)", () => {
      const value = 0;
      const step = 3;
      const min = 1;
      const max = 2;
      const inc = calculateStepper(value, step, min, max, true, "increment");
      const dec = calculateStepper(value, step, min, max, true, "decrement");
      expect(inc).toBe(0);
      expect(dec).toBe(0);
    });
  });

  describe("negative boundaries", () => {
    it("handles negative min and max, increment and decrement from negative value", () => {
      const value = -3;
      const step = 2;
      const min = -10;
      const max = 10;
      const inc = calculateStepper(value, step, min, max, true, "increment");
      const dec = calculateStepper(value, step, min, max, true, "decrement");
      expect(inc).toBe(0);
      expect(dec).toBe(0);
    });

    it("clamps to min when min > value and min > 0", () => {
      const value = 0;
      const step = 1;
      const min = 2;
      const max = 3;
      const inc = calculateStepper(value, step, min, max, true, "increment");
      expect(inc).toBe(2);
    });
  });

  describe("edge cases", () => {
    it("returns value if step is 0", () => {
      const value = 5;
      const step = 0;
      const min = 0;
      const max = 10;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(value);
    });

    it("returns value if step is negative", () => {
      const value = 5;
      const step = -2;
      const min = 0;
      const max = 10;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(value);
    });

    it("returns value if min > max", () => {
      const value = 5;
      const step = 1;
      const min = 10;
      const max = 2;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(value);
    });

    it("clamps to min when min = max", () => {
      const value = 5;
      const step = 1;
      const min = 3;
      const max = 3;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(3);
    });
  });

  describe("max=0 (no upper limit)", () => {
    it("increments without upper bound", () => {
      const value = 100;
      const step = 10;
      const min = 0;
      const max = 0;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(110);
    });

    it("decrements with lower bound only", () => {
      const value = 10;
      const step = 5;
      const min = 0;
      const max = 0;
      const result = calculateStepper(value, step, min, max, true, "decrement");
      expect(result).toBe(5);
    });

    it("does not go below minAligned on increment", () => {
      const value = -5;
      const step = 3;
      const min = 2;
      const max = 0;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(0);
    });

    it("does not go below 0 on decrement", () => {
      const value = -5;
      const step = 3;
      const min = 2;
      const max = 0;
      const result = calculateStepper(value, step, min, max, true, "decrement");
      expect(result).toBe(0);
    });
  });

  describe("allowZero=false scenarios", () => {
    it("defaults to 1 when value is undefined and allowZero=false", () => {
      const result = calculateStepper(undefined, 1, 0, 10, false, "increment");
      expect(result).toBe(2);
    });

    it("returns minAligned when incrementing negative value with allowZero=false", () => {
      const value = -5;
      const step = 2;
      const min = 3;
      const max = 10;
      const result = calculateStepper(value, step, min, max, false, "increment");
      expect(result).toBe(4);
    });

    it("returns minAligned when decrementing from zero with allowZero=false", () => {
      const value = 0;
      const step = 1;
      const min = 2;
      const max = 10;
      const result = calculateStepper(value, step, min, max, false, "decrement");
      expect(result).toBe(2);
    });

    it("returns minAligned when decrementing below minAligned with allowZero=false", () => {
      const value = 3;
      const step = 2;
      const min = 4;
      const max = 10;
      const result = calculateStepper(value, step, min, max, false, "decrement");
      expect(result).toBe(4);
    });

    it("handles decrement from positive value with allowZero=false", () => {
      const value = 5;
      const step = 2;
      const min = 2;
      const max = 10;
      const result = calculateStepper(value, step, min, max, false, "decrement");
      expect(result).toBe(3);
    });
  });

  describe("undefined value handling", () => {
    it("defaults to 0 when value is undefined and allowZero=true", () => {
      const result = calculateStepper(undefined, 1, 0, 10, true, "increment");
      expect(result).toBe(1);
    });

    it("defaults to 1 when value is undefined and allowZero=false", () => {
      const result = calculateStepper(undefined, 1, 0, 10, false, "increment");
      expect(result).toBe(2);
    });

    it("handles undefined value with decrement operation", () => {
      const result = calculateStepper(undefined, 1, 0, 10, true, "decrement");
      expect(result).toBe(0);
    });
  });

  describe("floating point truncation", () => {
    it("truncates floating point values", () => {
      const value = 5.7;
      const step = 2.3;
      const min = 1.8;
      const max = 10.9;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(7);
    });

    it("truncates negative floating point values", () => {
      const value = -2.7;
      const step = 1.9;
      const min = 0.5;
      const max = 5.8;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(0);
    });
  });

  describe("allowZero parameter handling", () => {
    it("treats undefined allowZero as true", () => {
      const value = 1;
      const step = 2;
      const min = 0;
      const max = 10;
      const result = calculateStepper(value, step, min, max, undefined, "decrement");
      expect(result).toBe(0);
    });
  });

  describe("complex alignment scenarios", () => {
    it("handles step alignment with non-zero min", () => {
      const value = 7;
      const step = 3;
      const min = 2;
      const max = 20;
      const inc = calculateStepper(value, step, min, max, true, "increment");
      const dec = calculateStepper(value, step, min, max, true, "decrement");
      expect(inc).toBe(10);
      expect(dec).toBe(4);
    });

    it("handles large step with small range", () => {
      const value = 2;
      const step = 10;
      const min = 1;
      const max = 5;
      const result = calculateStepper(value, step, min, max, true, "increment");
      expect(result).toBe(2);
    });
  });
});

describe("checkIfOperationIsAllowed", () => {
  describe("basic operations", () => {
    describe("increment", () => {
      it("allows increment within bounds", () => {
        expect(checkIfOperationIsAllowed(3, 1, 1, 5, true, "increment")).toBe(true);
      });
      it("blocks increment at upper bound", () => {
        expect(checkIfOperationIsAllowed(5, 1, 1, 5, true, "increment")).toBe(false);
      });
    });

    describe("decrement", () => {
      it("allows decrement within bounds", () => {
        expect(checkIfOperationIsAllowed(3, 1, 1, 5, true, "decrement")).toBe(true);
      });
      it("does not block decrement at lower bound", () => {
        expect(checkIfOperationIsAllowed(1, 1, 1, 5, true, "decrement")).toBe(true);
      });
    });
  });

  describe("boundary conditions", () => {
    describe("unaligned min/max", () => {
      it("allows increment within aligned max", () => {
        expect(checkIfOperationIsAllowed(3, 2, 1, 7, true, "increment")).toBe(true);
      });
      it("blocks increment exceeding aligned max", () => {
        expect(checkIfOperationIsAllowed(6, 2, 1, 7, true, "increment")).toBe(false);
      });
    });
  });

  describe("special cases", () => {
    describe("max=0 (no upper limit)", () => {
      it("allows increment without upper bound", () => {
        expect(checkIfOperationIsAllowed(100, 10, 0, 0, true, "increment")).toBe(true);
      });
      it("allows decrement above zero", () => {
        expect(checkIfOperationIsAllowed(10, 5, 0, 0, true, "decrement")).toBe(true);
      });
      it("blocks decrement at zero", () => {
        expect(checkIfOperationIsAllowed(0, 5, 0, 0, true, "decrement")).toBe(false);
      });
    });
  });

  describe("error conditions", () => {
    describe("invalid step", () => {
      it("blocks increment with zero step", () => {
        expect(checkIfOperationIsAllowed(3, 0, 1, 5, true, "increment")).toBe(false);
      });
      it("blocks increment with negative step", () => {
        expect(checkIfOperationIsAllowed(3, -1, 1, 5, true, "increment")).toBe(false);
      });
      it("blocks decrement with zero step", () => {
        expect(checkIfOperationIsAllowed(3, 0, 1, 5, true, "decrement")).toBe(false);
      });
      it("blocks decrement with negative step", () => {
        expect(checkIfOperationIsAllowed(3, -1, 1, 5, true, "decrement")).toBe(false);
      });
    });

    describe("invalid range", () => {
      it("blocks operations when min > max", () => {
        expect(checkIfOperationIsAllowed(3, 1, 10, 2, true, "increment")).toBe(false);
        expect(checkIfOperationIsAllowed(3, 1, 10, 2, true, "decrement")).toBe(false);
      });
    });
  });

  describe("undefined value handling", () => {
    it("blocks operations when value is undefined", () => {
      expect(checkIfOperationIsAllowed(undefined, 1, 0, 10, true, "increment")).toBe(false);
      expect(checkIfOperationIsAllowed(undefined, 1, 0, 10, true, "decrement")).toBe(false);
    });
  });

  describe("allowZero=false scenarios", () => {
    it("allows decrement when value > minAligned and allowZero=false", () => {
      const value = 5;
      const step = 2;
      const min = 2;
      const max = 10;
      expect(checkIfOperationIsAllowed(value, step, min, max, false, "decrement")).toBe(true);
    });

    it("blocks decrement when value <= minAligned and allowZero=false", () => {
      const value = 2;
      const step = 2;
      const min = 2;
      const max = 10;
      expect(checkIfOperationIsAllowed(value, step, min, max, false, "decrement")).toBe(false);
    });

    it("blocks decrement when value < minAligned and allowZero=false", () => {
      const value = 1;
      const step = 2;
      const min = 2;
      const max = 10;
      expect(checkIfOperationIsAllowed(value, step, min, max, false, "decrement")).toBe(false);
    });
  });

  describe("increment boundary edge cases", () => {
    it("allows increment when value is exactly at maxAligned - step", () => {
      const value = 8;
      const step = 2;
      const min = 0;
      const max = 10;
      expect(checkIfOperationIsAllowed(value, step, min, max, true, "increment")).toBe(true);
    });

    it("blocks increment when value equals maxAligned", () => {
      const value = 10;
      const step = 2;
      const min = 0;
      const max = 10;
      expect(checkIfOperationIsAllowed(value, step, min, max, true, "increment")).toBe(false);
    });

    it("blocks increment when value > maxAligned", () => {
      const value = 12;
      const step = 2;
      const min = 0;
      const max = 10;
      expect(checkIfOperationIsAllowed(value, step, min, max, true, "increment")).toBe(false);
    });
  });

  describe("floating point step alignment", () => {
    it("handles floating point steps correctly for increment", () => {
      const value = 3;
      const step = 2.5;
      const min = 0;
      const max = 10;
      expect(checkIfOperationIsAllowed(value, step, min, max, true, "increment")).toBe(true);
    });
  });

  describe("edge case with max=0 and non-zero min", () => {
    it("allows increment with max=0 regardless of min", () => {
      const value = 5;
      const step = 1;
      const min = 10;
      const max = 0;
      expect(checkIfOperationIsAllowed(value, step, min, max, true, "increment")).toBe(true);
    });
  });
});
