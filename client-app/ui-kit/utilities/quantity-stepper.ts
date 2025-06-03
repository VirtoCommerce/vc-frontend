import clamp from "lodash/clamp";

function handleIncrement(
  value: number,
  step: number,
  minAligned: number,
  maxAligned: number,
  allowZero: boolean = true,
): number {
  if (value < 0) {
    return allowZero ? 0 : minAligned;
  }
  if (value < minAligned) {
    return minAligned;
  }
  if (value > maxAligned) {
    return maxAligned;
  }
  return clamp(value + step, minAligned, maxAligned);
}

function handleDecrement(
  value: number,
  step: number,
  minAligned: number,
  maxAligned: number,
  allowZero: boolean = true,
): number {
  if (value <= 0) {
    return allowZero ? 0 : minAligned;
  }
  if (value > maxAligned) {
    return maxAligned;
  }
  const result = value - step;
  const minValue = allowZero ? 0 : minAligned;
  return result < minAligned ? minValue : clamp(result, minAligned, maxAligned);
}

export function calculateStepper(
  _value: number | undefined,
  _step: number,
  _min: number,
  _max: number,
  _allowZero: boolean,
  direction: "increment" | "decrement",
): number {
  const step = Math.trunc(_step);
  const min = Math.trunc(_min);
  const max = Math.trunc(_max);
  const allowZero = _allowZero ?? true;
  const value = Math.trunc(_value ?? (allowZero ? 0 : 1));

  if (step <= 0) {
    return value;
  }

  const minAligned = Math.ceil(min / step) * step;
  const maxAligned = max === 0 ? Number.POSITIVE_INFINITY : Math.floor(max / step) * step;

  if (maxAligned < Math.max(minAligned, 0)) {
    return value;
  }

  return direction === "increment"
    ? handleIncrement(value, step, minAligned, maxAligned, allowZero)
    : handleDecrement(value, step, minAligned, maxAligned, allowZero);
}

export function checkIfOperationIsAllowed(
  value: number | undefined,
  step: number,
  min: number,
  max: number,
  allowZero: boolean,
  direction: "increment" | "decrement",
) {
  if (step <= 0 || value === undefined || (max < min && max !== 0)) {
    return false;
  }

  if (direction === "increment") {
    const maxAligned = max === 0 ? Number.POSITIVE_INFINITY : Math.floor(max / step) * step;
    return value < maxAligned;
  }

  if (allowZero) {
    return value > 0;
  }

  const minAligned = Math.ceil(min / step) * step;
  return value > minAligned;
}
