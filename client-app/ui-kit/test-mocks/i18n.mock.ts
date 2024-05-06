import { vi } from "vitest";

export function mockI18n(): void {
  vi.mock("vue-i18n", async () => {
    const actualI18n = await vi.importActual("vue-i18n");
    return {
      ...{ actualI18n },
      useI18n: vi.fn().mockReturnValue({
        t: (key: string) => key,
      }),
    };
  });
}
