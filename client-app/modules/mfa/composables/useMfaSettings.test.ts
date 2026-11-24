import { beforeEach, describe, expect, it, vi } from "vitest";
import { shallowRef } from "vue";
import { MODULE_ID } from "../constants";
import { useMfaSettings } from "./useMfaSettings";

const { modules, getMfaSettings, getMfaSettingsWithLockout } = vi.hoisted(() => ({
  modules: { value: [] as { moduleId: string; version: string }[] },
  getMfaSettings: vi.fn(),
  getMfaSettingsWithLockout: vi.fn(),
}));

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key, te: () => false }) }));

vi.mock("@/core/composables/useModules", () => ({
  useModules: () => ({ modules: shallowRef(modules.value) }),
}));

vi.mock("../api/graphql", () => ({
  getMfaSettings,
  getMfaSettingsWithLockout,
  requestMfaChangeCode: vi.fn(),
  updateMfaOrganizationMode: vi.fn(),
  updateMfaUserMode: vi.fn(),
}));

describe("useMfaSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMfaSettings.mockResolvedValue({ storeMode: "CustomerChoice" });
    getMfaSettingsWithLockout.mockResolvedValue({ storeMode: "CustomerChoice", isLockoutEnabled: false });
  });

  it("reads the settings without the lockout from a release that doesn't report it", async () => {
    modules.value = [{ moduleId: MODULE_ID, version: "3.1005.0" }];
    const { fetchSettings, settings, isLockoutReported } = useMfaSettings("user", "org-1");

    await fetchSettings();

    expect(getMfaSettings).toHaveBeenCalledWith("org-1");
    expect(getMfaSettingsWithLockout).not.toHaveBeenCalled();
    expect(isLockoutReported.value).toBe(false);
    expect(settings.value?.isLockoutEnabled).toBeUndefined();
  });

  it("reads the lockout from a release that reports it", async () => {
    modules.value = [{ moduleId: MODULE_ID, version: "3.1006.0" }];
    const { fetchSettings, settings, isLockoutReported } = useMfaSettings("organization", "org-1");

    await fetchSettings();

    expect(getMfaSettingsWithLockout).toHaveBeenCalledWith("org-1");
    expect(getMfaSettings).not.toHaveBeenCalled();
    expect(isLockoutReported.value).toBe(true);
    expect(settings.value?.isLockoutEnabled).toBe(false);
  });
});
