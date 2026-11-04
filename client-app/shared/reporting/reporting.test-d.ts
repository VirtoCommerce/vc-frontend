import { describe, expectTypeOf, it } from "vitest";
import { buildReportingPlan, buildReportingVariables } from "./reporting";

// Shaped as a generated query's variables: every `use{i}` is required, the windows are optional.
type GeneratedVariablesType = {
  storeId?: string;
  prevFrom?: string;
  prevTo?: string;
  use0: boolean;
  from0?: string;
  to0?: string;
  lyFrom0?: string;
  lyTo0?: string;
  use11: boolean;
  from11?: string;
};

describe("buildReportingVariables", () => {
  it("fits a generated query's variables without a cast", () => {
    const variables = { ...buildReportingVariables(buildReportingPlan("year")), storeId: "store" };

    expectTypeOf(variables).toExtend<GeneratedVariablesType>();
  });
});
