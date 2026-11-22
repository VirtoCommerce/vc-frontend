import { describe, expectTypeOf, it } from "vitest";
import type { CustomSectionDirectiveType, defineBehavior, IBehaviorContext } from "@/core-api";

describe("the custom section kit in the facade", () => {
  it("gives a plugin behavior the per-element scope and the motion read the built-ins get", () => {
    expectTypeOf<typeof defineBehavior>().returns.toEqualTypeOf<CustomSectionDirectiveType>();
    expectTypeOf<typeof defineBehavior>()
      .parameter(0)
      .toEqualTypeOf<(element: HTMLElement, context: IBehaviorContext) => void>();
    expectTypeOf<IBehaviorContext["isReducedMotion"]>().toEqualTypeOf<boolean>();
  });
});
