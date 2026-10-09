import { describe, expect, it, vi } from "vitest";
import { ENABLED_KEY, MODULE_ID, SALES_REP_ACCESS_PERMISSION } from "../constants";
import { isSalesRepsEnabled, isSalesRepUser } from "./useSalesRepsConfig";

const { isEnabled, useModuleSettings } = vi.hoisted(() => {
  const isEnabledFn = vi.fn();
  return { isEnabled: isEnabledFn, useModuleSettings: vi.fn(() => ({ isEnabled: isEnabledFn })) };
});
vi.mock("@/core/composables/useModuleSettings", () => ({ useModuleSettings }));

const { checkPermissions } = vi.hoisted(() => ({ checkPermissions: vi.fn() }));
vi.mock("@/shared/account/composables/useUser", () => ({ useUser: () => ({ checkPermissions }) }));

describe("useSalesRepsConfig", () => {
  it("is enabled only when the SalesRep.Enabled storefront setting is on", () => {
    isEnabled.mockReturnValue(true);
    expect(isSalesRepsEnabled()).toBe(true);
    expect(useModuleSettings).toHaveBeenCalledWith(MODULE_ID);
    expect(isEnabled).toHaveBeenCalledWith(ENABLED_KEY);

    isEnabled.mockReturnValue(false);
    expect(isSalesRepsEnabled()).toBe(false);
  });

  describe("isSalesRepUser", () => {
    it("requires both the store setting and the permission", () => {
      isEnabled.mockReturnValue(true);
      checkPermissions.mockReturnValue(true);

      expect(isSalesRepUser()).toBe(true);
      expect(checkPermissions).toHaveBeenCalledWith(SALES_REP_ACCESS_PERMISSION);
    });

    it("is false for a permitted user when the module is off for the store", () => {
      isEnabled.mockReturnValue(false);
      checkPermissions.mockReturnValue(true);

      expect(isSalesRepUser()).toBe(false);
    });

    it("is false for a user without the rep permission", () => {
      isEnabled.mockReturnValue(true);
      checkPermissions.mockReturnValue(false);

      expect(isSalesRepUser()).toBe(false);
    });

    it("does not evaluate the permission when the module is off", () => {
      isEnabled.mockReturnValue(false);
      checkPermissions.mockReset();

      isSalesRepUser();

      expect(checkPermissions).not.toHaveBeenCalled();
    });
  });
});
