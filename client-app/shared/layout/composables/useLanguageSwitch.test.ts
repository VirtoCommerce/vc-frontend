import { describe, expect, it, vi } from "vitest";
import { useLanguageSwitch } from "./useLanguageSwitch";
import type { ILanguage } from "@/core/types";

vi.mock("@/core/composables/useLanguages", () => ({ useLanguages: () => ({}) }));
vi.mock("@/core/api/graphql/slugInfo/queries/getSlugInfo", () => ({ getSlugInfo: vi.fn() }));
vi.mock("@/shared/broadcast/composables/useBroadcast", () => ({ useBroadcast: () => ({ emit: vi.fn() }) }));

function nameOf(nativeName: string): string {
  return useLanguageSwitch().getLanguageName({ nativeName } as ILanguage);
}

describe("useLanguageSwitch: getLanguageName", () => {
  it("drops the region in brackets from the native name", () => {
    expect(nameOf("Deutsch (Deutschland)")).toBe("Deutsch");
  });

  it("keeps a region in full-width brackets", () => {
    expect(nameOf("中文（中国）")).toBe("中文（中国）");
  });
});
