import { afterEach, describe, expect, it } from "vitest";
import { useSearchScore } from "./useSearchScore";

const { preparingScope, isScopePending, prepareScope, holdScope } = useSearchScore();

afterEach(() => {
  preparingScope.value = false;
});

describe("useSearchScore — prepareScope", () => {
  it("marks the scope as preparing until it is finished", () => {
    const finish = prepareScope();

    expect(preparingScope.value).toBe(true);
    expect(isScopePending.value).toBe(true);

    finish();

    expect(preparingScope.value).toBe(false);
  });

  it("ignores a finish from a caller that a newer one has replaced", () => {
    const finishFirst = prepareScope();
    const finishSecond = prepareScope();

    finishFirst();

    expect(preparingScope.value).toBe(true);

    finishSecond();

    expect(preparingScope.value).toBe(false);
  });

  it("does nothing on a second finish", () => {
    const finishFirst = prepareScope();
    finishFirst();
    const finishSecond = prepareScope();

    finishFirst();

    expect(preparingScope.value).toBe(true);

    finishSecond();
  });
});

describe("useSearchScore — holdScope", () => {
  it("keeps the scope pending until every hold is released, each only once", () => {
    const releaseFirst = holdScope();
    const releaseSecond = holdScope();

    releaseFirst();
    releaseFirst();

    expect(isScopePending.value).toBe(true);

    releaseSecond();

    expect(isScopePending.value).toBe(false);
  });
});
