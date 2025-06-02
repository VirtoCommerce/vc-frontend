import clamp from "lodash/clamp";

function handleIncrement(value: number, step: number, minAligned: number, maxAligned: number): number {
  if (value < 0) {
    return 0;
  }
  if (value < minAligned) {
    return minAligned;
  }
  if (value > maxAligned) {
    return maxAligned;
  }
  return clamp(value + step, minAligned, maxAligned);
}

function handleDecrement(value: number, step: number, minAligned: number, maxAligned: number): number {
  if (value <= 0) {
    return 0;
  }
  if (value > maxAligned) {
    return maxAligned;
  }
  const result = value - step;
  return result < minAligned ? 0 : clamp(result, minAligned, maxAligned);
}

export function calculateStepper(
  _value: number | undefined,
  _step: number,
  _min: number,
  _max: number,
  direction: "increment" | "decrement",
): number {
  const value = Math.trunc(_value ?? 0);
  const step = Math.trunc(_step);
  const min = Math.trunc(_min);
  const max = Math.trunc(_max);

  if (step <= 0) {
    return value;
  }

  const minAligned = Math.ceil(min / step) * step;
  const maxAligned = max === 0 ? Number.POSITIVE_INFINITY : Math.floor(max / step) * step;

  if (maxAligned < Math.max(minAligned, 0)) {
    return value;
  }

  return direction === "increment"
    ? handleIncrement(value, step, minAligned, maxAligned)
    : handleDecrement(value, step, minAligned, maxAligned);
}

export function checkIfOperationIsAllowed(
  value: number | undefined,
  step: number,
  min: number,
  max: number,
  direction: "increment" | "decrement",
) {
  if (step <= 0 || value === undefined || (max < min && max !== 0)) {
    return false;
  }

  if (direction === "increment") {
    const maxAligned = max === 0 ? Number.POSITIVE_INFINITY : Math.floor(max / step) * step;
    return value < maxAligned;
  }

  // Decrement should be always available if qty is > 0
  return value > 0;
}
