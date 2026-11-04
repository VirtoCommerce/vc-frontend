import { describe, expect, it } from "vitest";
import { linearLinePath, niceTicks, smoothLinePath, splitAtGaps } from "./chart-geometry";

describe("niceTicks", () => {
  it("rounds the axis up to a readable step", () => {
    expect(niceTicks(9_400_000)).toEqual([0, 2_500_000, 5_000_000, 7_500_000, 10_000_000]);
    expect(niceTicks(362)).toEqual([0, 100, 200, 300, 400]);
  });

  it("falls back to unit steps for an empty chart", () => {
    expect(niceTicks(0)).toEqual([0, 1, 2, 3, 4]);
    expect(niceTicks(Number.NaN)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe("linearLinePath", () => {
  it("joins the points with straight segments", () => {
    expect(
      linearLinePath([
        { x: 0, y: 10 },
        { x: 5.555, y: 2 },
      ]),
    ).toBe("M0,10 L5.56,2");
  });
});

describe("smoothLinePath", () => {
  it("passes through every point and flattens the tangent at a peak", () => {
    const path = smoothLinePath([
      { x: 0, y: 100 },
      { x: 30, y: 20 },
      { x: 60, y: 100 },
    ]);

    expect(path.startsWith("M0,100 C")).toBe(true);
    expect(path).toContain(" 30,20 ");
    expect(path.endsWith(" 60,100")).toBe(true);
    // At the peak both handles share its y, so the curve is rounded rather than pointed.
    expect(path).toContain("20,20 30,20 C40,20");
  });

  it("does not overshoot a monotone run", () => {
    const path = smoothLinePath([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 50 },
    ]);
    const controlYs = [...path.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((match) => Number(match[2]));

    expect(Math.min(...controlYs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...controlYs)).toBeLessThanOrEqual(50);
  });

  it("handles one point and no points", () => {
    expect(smoothLinePath([])).toBe("");
    expect(smoothLinePath([{ x: 5, y: 7 }])).toBe("M5,7");
  });
});

describe("splitAtGaps", () => {
  it("cuts the series at every gap and drops the gaps", () => {
    expect(splitAtGaps([1, 2, null, 3, null, null, 4])).toEqual([[1, 2], [3], [4]]);
  });

  it("ignores gaps at either end", () => {
    expect(splitAtGaps([null, 1, 2, null])).toEqual([[1, 2]]);
    expect(splitAtGaps([null, null])).toEqual([]);
  });
});
