export type ChartPointType = { x: number; y: number };

/** Splits a series at its gaps (`null`), so each run of consecutive points is drawn as its own stretch of line. */
export function splitAtGaps<T>(items: (T | null)[]): T[][] {
  const runs: T[][] = [];
  let run: T[] = [];
  for (const item of items) {
    if (item !== null) {
      run.push(item);
    } else if (run.length) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length) {
    runs.push(run);
  }
  return runs;
}

const NICE_STEPS = [1, 2, 2.5, 5, 10];

/** Axis ticks from 0 to a round maximum that covers `max`, `count` intervals. */
export function niceTicks(max: number, count = 4): number[] {
  if (!Number.isFinite(max) || max <= 0) {
    return Array.from({ length: count + 1 }, (_, i) => i);
  }
  const rawStep = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = (NICE_STEPS.find((nice) => nice * magnitude >= rawStep) ?? 10) * magnitude;
  return Array.from({ length: count + 1 }, (_, i) => i * step);
}

const SVG_PRECISION = 100;

function round(value: number): number {
  return Math.round(value * SVG_PRECISION) / SVG_PRECISION;
}

function point({ x, y }: ChartPointType): string {
  return `${round(x)},${round(y)}`;
}

/** SVG path through every point with straight segments. */
export function linearLinePath(points: ChartPointType[]): string {
  return points.map((item, i) => `${i === 0 ? "M" : "L"}${point(item)}`).join(" ");
}

/**
 * SVG path through every point as a smooth curve (monotone cubic, Fritsch–Carlson): peaks and dips are rounded with a
 * flat tangent, and the curve never overshoots a point, so it can't suggest a value the data doesn't have.
 */
export function smoothLinePath(points: ChartPointType[]): string {
  if (points.length < 2) {
    return linearLinePath(points);
  }

  const slopes = points.slice(0, -1).map((item, i) => {
    const next = points[i + 1];
    return (next.y - item.y) / (next.x - item.x);
  });

  const tangents = points.map((_, i) => {
    if (i === 0) {
      return slopes[0];
    }
    if (i === points.length - 1) {
      return slopes[i - 1];
    }
    const before = slopes[i - 1];
    const after = slopes[i];
    // A peak or a dip (the slope changes sign): a flat tangent rounds it off.
    return before * after <= 0 ? 0 : (before + after) / 2;
  });

  slopes.forEach((slope, i) => {
    if (slope === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      return;
    }
    const a = tangents[i] / slope;
    const b = tangents[i + 1] / slope;
    const length = a * a + b * b;
    // Keeps each segment monotone, so the curve stays between its two points.
    if (length > 9) {
      const scale = 3 / Math.sqrt(length);
      tangents[i] = scale * a * slope;
      tangents[i + 1] = scale * b * slope;
    }
  });

  const segments = points.slice(0, -1).map((item, i) => {
    const next = points[i + 1];
    const third = (next.x - item.x) / 3;
    const c1 = { x: item.x + third, y: item.y + tangents[i] * third };
    const c2 = { x: next.x - third, y: next.y - tangents[i + 1] * third };
    return `C${point(c1)} ${point(c2)} ${point(next)}`;
  });

  return `M${point(points[0])} ${segments.join(" ")}`;
}
