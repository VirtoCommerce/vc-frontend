import { describe, expect, it, vi } from "vitest";
import { ENABLED_KEY, MODULE_ID } from "../constants";
import { isSalesRepsEnabled } from "./useSalesRepsConfig";

const { isEnabled, useModuleSettings } = vi.hoisted(() => {
  const isEnabledFn = vi.fn();
  return { isEnabled: isEnabledFn, useModuleSettings: vi.fn(() => ({ isEnabled: isEnabledFn })) };
});
vi.mock("@/core/composables/useModuleSettings", () => ({ useModuleSettings }));

describe("useSalesRepsConfig", () => {
  it("is enabled only when the SalesRep.Enabled storefront setting is on", () => {
    isEnabled.mockReturnValue(true);
    expect(isSalesRepsEnabled()).toBe(true);
    expect(useModuleSettings).toHaveBeenCalledWith(MODULE_ID);
    expect(isEnabled).toHaveBeenCalledWith(ENABLED_KEY);

    isEnabled.mockReturnValue(false);
    expect(isSalesRepsEnabled()).toBe(false);
  });
});
