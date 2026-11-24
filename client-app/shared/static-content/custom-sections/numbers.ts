import { clamp, round } from "lodash-es";

const PRECISION = 3;

/** A number, or a string that is one; `undefined` for anything else, an empty string included. */
export function toFiniteNumber(value: unknown): number | undefined {
  const number = typeof value === "string" && value.trim() ? Number(value) : value;
  return typeof number === "number" && Number.isFinite(number) ? number : undefined;
}

export function toUnitShare(value: number): number {
  return round(clamp(value, 0, 1), PRECISION);
}
