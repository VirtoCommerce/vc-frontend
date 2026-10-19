import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import settingsData from "@/config/settings_data.json";
import { BUILTIN_ENABLED_THEME_SETTING } from "./constants";
import { init } from "./index";
import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

const mocks = vi.hoisted(() => {
  const settings: Record<string, unknown> = {};
  return { settings, isSalesRepsEnabled: vi.fn(() => false) };
});

vi.mock("@/core/composables/useThemeContext", () => ({
  useThemeContext: () => ({ themeContext: ref({ settings: mocks.settings }) }),
}));

vi.mock("./composables/useSalesRepsConfig", () => ({
  isSalesRepsEnabled: mocks.isSalesRepsEnabled,
  isSalesRepTasksEnabled: () => false,
  isSalesRepUser: () => false,
}));

function createRouter() {
  return { addRoute: vi.fn() } as unknown as Router & { addRoute: ReturnType<typeof vi.fn> };
}

describe("init", () => {
  beforeEach(() => {
    mocks.settings = {};
    mocks.isSalesRepsEnabled.mockClear();
  });

  it("ships with the built-in hub off", () => {
    expect((settingsData.settings as Record<string, unknown>)[BUILTIN_ENABLED_THEME_SETTING]).toBe(false);
  });

  it("registers nothing while sales_rep_builtin_enabled is off, whatever the store's module setting", () => {
    mocks.isSalesRepsEnabled.mockReturnValue(true);
    const router = createRouter();

    init(router, {} as I18n);

    expect(router.addRoute).not.toHaveBeenCalled();
    expect(mocks.isSalesRepsEnabled).not.toHaveBeenCalled();
  });

  it("still defers to the store's module setting once sales_rep_builtin_enabled is on", () => {
    mocks.settings = { [BUILTIN_ENABLED_THEME_SETTING]: true };
    mocks.isSalesRepsEnabled.mockReturnValue(false);
    const router = createRouter();

    init(router, {} as I18n);

    expect(mocks.isSalesRepsEnabled).toHaveBeenCalled();
    expect(router.addRoute).not.toHaveBeenCalled();
  });
});
