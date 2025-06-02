import { describe, it, expect } from "vitest";
import { calculateStepper, checkIfOperationIsAllowed } from "./quantity-stepper";

describe("calculateStepper", () => {
  describe("aligned values", () => {
    it("increments an aligned value within boundaries", () => {
      const value = 3;
      const step = 1;
      const min = 1;
      const max = 5;
      const result = calculateStepper(value, step, min, max, "increment");
      expect(result).toBe(4);
    });

    it("decrements an aligned value within boundaries", () => {
      const value = 3;
      const step = 1;
      const min = 1;
      const max = 5;
      const result = calculateStepper(value, step, min, max, "decrement");
      expect(result).toBe(2);
    });
  });

  describe("unaligned initial values", () => {
    it("increments an unaligned value within boundaries", () => {
      const value = 3;
      const step = 2;
      const min = 0;
      const max = 10;
      const result = calculateStepper(value, step, min, max, "increment");
      expect(result).toBe(5);
    });

    it("decrements an unaligned value within boundaries", () => {
      const value = 3;
      const step = 2;
      const min = 0;
      const max = 10;
      const result = calculateStepper(value, step, min, max, "decrement");
      expect(result).toBe(1);
    });
  });

  describe("values below minimum", () => {
    it("clamps to minAligned then increments", () => {
      const value = 1;
      const step = 2;
      const min = 3;
      const max = 10;
      const result = calculateStepper(value, step, min, max, "increment");
      expect(result).toBe(4);
    });

    it("clamps to minAligned then decrements", () => {
      const value = 1;
      const step = 2;
      const min = 3;
      const max = 10;
      const result = calculateStepper(value, step, min, max, "decrement");
      expect(result).toBe(0);
    });
  });

  describe("values above maximum", () => {
    it("clamps to maxAligned then increments", () => {
      const value = 12;
      const step = 2;
      const min = 1;
      const max = 9;
      const result = calculateStepper(value, step, min, max, "increment");
      expect(result).toBe(8);
    });

    it("clamps to maxAligned then decrements", () => {
      const value = 12;
      const step = 2;
      const min = 1;
      const max = 9;
      const result = calculateStepper(value, step, min, max, "decrement");
      expect(result).toBe(8);
    });
  });

  describe("boundary conditions", () => {
    it("does not exceed max on increment at maxAligned", () => {
      const value = 10;
      const step = 5;
      const min = 0;
      const max = 10;
      const result = calculateStepper(value, step, min, max, "increment");
      expect(result).toBe(10);
    });

    it("does not go below min on decrement at minAligned", () => {
      const value = 0;
      const step = 5;
      const min = 0;
      const max = 10;
      const result = calculateStepper(value, step, min, max, "decrement");
      expect(result).toBe(0);
    });
  });

  describe("non-integer steps and bounds", () => {
    it("aligns non-integer min and max then increments", () => {
      const value = 5;
      const step = 2.5;
      const min = 3.2;
      const max = 12.7;
      const result = calculateStepper(value, step, min, max, "increment");
      expect(result).toBe(7);
    });

    it("aligns non-integer min and max then decrements", () => {
      const value = 5;
      const step = 2.5;
      const min = 3.2;
      const max = 12.7;
      const result = calculateStepper(value, step, min, max, "decrement");
      expect(result).toBe(3);
    });
  });

  describe("step larger than range", () => {
    it("returns consistent result when step > (max - min)", () => {
      const value = 0;
      const step = 3;
      const min = 1;
      const max = 2;
      const inc = calculateStepper(value, step, min, max, "increment");
      const dec = calculateStepper(value, step, min, max, "decrement");
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
      const inc = calculateStepper(value, step, min, max, "increment");
      const dec = calculateStepper(value, step, min, max, "decrement");
      expect(inc).toBe(0);
      expect(dec).toBe(0);
    });

    it("clamps to min when min > value and min > 0", () => {
      const value = 0;
      const step = 1;
      const min = 2;
      const max = 3;
      const inc = calculateStepper(value, step, min, max, "increment");
      expect(inc).toBe(2);
    });
  });

  describe("edge cases", () => {
    it("returns value if step is 0", () => {
      const value = 5;
      const step = 0;
      const min = 0;
      const max = 10;
      const result = calculateStepper(value, step, min, max, "increment");
      expect(result).toBe(value);
    });

    it("returns value if step is negative", () => {
      const value = 5;
      const step = -2;
      const min = 0;
      const max = 10;
      const result = calculateStepper(value, step, min, max, "increment");
      expect(result).toBe(value);
    });

    it("returns value if min > max", () => {
      const value = 5;
      const step = 1;
      const min = 10;
      const max = 2;
      const result = calculateStepper(value, step, min, max, "increment");
      expect(result).toBe(value);
    });

    it("clamps to min when min = max", () => {
      const value = 5;
      const step = 1;
      const min = 3;
      const max = 3;
      const result = calculateStepper(value, step, min, max, "increment");
      expect(result).toBe(3);
    });
  });

  describe("max=0 (no upper limit)", () => {
    it("increments without upper bound", () => {
      const value = 100;
      const step = 10;
      const min = 0;
      const max = 0;
      const result = calculateStepper(value, step, min, max, "increment");
      expect(result).toBe(110);
    });

    it("decrements with lower bound only", () => {
      const value = 10;
      const step = 5;
      const min = 0;
      const max = 0;
      const result = calculateStepper(value, step, min, max, "decrement");
      expect(result).toBe(5);
    });

    it("does not go below minAligned on increment", () => {
      const value = -5;
      const step = 3;
      const min = 2;
      const max = 0;
      const result = calculateStepper(value, step, min, max, "increment");
      expect(result).toBe(0);
    });

    it("does not go below 0 on decrement", () => {
      const value = -5;
      const step = 3;
      const min = 2;
      const max = 0;
      const result = calculateStepper(value, step, min, max, "decrement");
      expect(result).toBe(0);
    });
  });
});

describe("checkIfOperationIsAllowed", () => {
  describe("basic operations", () => {
    describe("increment", () => {
      it("allows increment within bounds", () => {
        expect(checkIfOperationIsAllowed(3, 1, 1, 5, "increment")).toBe(true);
      });
      it("blocks increment at upper bound", () => {
        expect(checkIfOperationIsAllowed(5, 1, 1, 5, "increment")).toBe(false);
      });
    });

    describe("decrement", () => {
      it("allows decrement within bounds", () => {
        expect(checkIfOperationIsAllowed(3, 1, 1, 5, "decrement")).toBe(true);
      });
      it("does not block decrement at lower bound", () => {
        expect(checkIfOperationIsAllowed(1, 1, 1, 5, "decrement")).toBe(true);
      });
    });
  });

  describe("boundary conditions", () => {
    describe("unaligned min/max", () => {
      it("allows increment within aligned max", () => {
        expect(checkIfOperationIsAllowed(3, 2, 1, 7, "increment")).toBe(true);
      });
      it("blocks increment exceeding aligned max", () => {
        expect(checkIfOperationIsAllowed(5, 2, 1, 7, "increment")).toBe(false);
      });
    });
  });

  describe("special cases", () => {
    describe("max=0 (no upper limit)", () => {
      it("allows increment without upper bound", () => {
        expect(checkIfOperationIsAllowed(100, 10, 0, 0, "increment")).toBe(true);
      });
      it("allows decrement above zero", () => {
        expect(checkIfOperationIsAllowed(10, 5, 0, 0, "decrement")).toBe(true);
      });
      it("blocks decrement at zero", () => {
        expect(checkIfOperationIsAllowed(0, 5, 0, 0, "decrement")).toBe(false);
      });
    });
  });

  describe("error conditions", () => {
    describe("invalid step", () => {
      it("blocks increment with zero step", () => {
        expect(checkIfOperationIsAllowed(3, 0, 1, 5, "increment")).toBe(false);
      });
      it("blocks increment with negative step", () => {
        expect(checkIfOperationIsAllowed(3, -1, 1, 5, "increment")).toBe(false);
      });
      it("blocks decrement with zero step", () => {
        expect(checkIfOperationIsAllowed(3, 0, 1, 5, "decrement")).toBe(false);
      });
      it("blocks decrement with negative step", () => {
        expect(checkIfOperationIsAllowed(3, -1, 1, 5, "decrement")).toBe(false);
      });
    });

    describe("invalid range", () => {
      it("blocks operations when min > max", () => {
        expect(checkIfOperationIsAllowed(3, 1, 10, 2, "increment")).toBe(false);
        expect(checkIfOperationIsAllowed(3, 1, 10, 2, "decrement")).toBe(false);
      });
    });
  });
});
