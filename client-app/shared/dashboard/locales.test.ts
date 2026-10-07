import { describe, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n";
import { useLayoutAnnouncer } from "./composables/_internal/useLayoutAnnouncer";
import type { KeyboardSortSignalType } from "./types";
import type { LocaleMessage } from "@intlify/core-base";

vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));

// The announcer builds its keys at runtime (`shared.dashboard.a11y.${kind}`), so neither a grep nor
// `check-locales` — which only compares key sets file by file — can tell a kind with no message from one
// with. This resolves every announcement against every locale's own messages, with no fallback locale: a
// missing key comes back as the key itself.
type TranslateType = (key: string, params?: Record<string, unknown>) => string;

const i18nState: { t: TranslateType } = vi.hoisted(() => ({ t: (key: string) => key }));

vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({ t: (key: string, params?: Record<string, unknown>) => i18nState.t(key, params) }),
}));

const LOCALE_FILE = /([a-z]{2})\.json$/;

const LOCALE_MESSAGES: Record<string, LocaleMessage> = Object.fromEntries(
  Object.entries(import.meta.glob<{ default: LocaleMessage }>("../../../locales/*.json", { eager: true })).map(
    ([filePath, module]) => [LOCALE_FILE.exec(filePath)?.[1], module.default],
  ),
);

// One signal per kind, made total by `satisfies`: a kind added to KeyboardSortSignalType fails to compile here
// until it is listed — and then fails below until every locale translates it.
const SIGNALS = {
  grabbed: { kind: "grabbed", id: "probe", index: 0, total: 3, parkable: false },
  moved: { kind: "moved", id: "probe", index: 1, total: 3 },
  dropped: { kind: "dropped", id: "probe", index: 1, total: 3 },
  edge: { kind: "edge", id: "probe", index: 2, total: 3 },
  cancelled: { kind: "cancelled", id: "probe" },
  parked: { kind: "parked", id: "probe" },
  restored: { kind: "restored", id: "probe" },
} satisfies { [K in KeyboardSortSignalType["kind"]]: KeyboardSortSignalType & { kind: K } };

// The stat row's own wording for a grab, where up and down hide and show instead of moving.
const ANNOUNCEMENTS: [string, KeyboardSortSignalType][] = [
  ...Object.entries(SIGNALS),
  ["grabbed_parkable", { ...SIGNALS.grabbed, parkable: true }],
];

describe("layout announcements", () => {
  it("covers all 13 storefront languages", () => {
    expect(new Set(Object.keys(LOCALE_MESSAGES))).toEqual(
      new Set(["de", "en", "es", "fi", "fr", "it", "ja", "no", "pl", "pt", "ru", "sv", "zh"]),
    );
  });

  describe.each(Object.keys(LOCALE_MESSAGES))("in %s", (locale) => {
    it.each(ANNOUNCEMENTS)("translates %s", (_name, signal) => {
      const i18n = createI18n(locale, "USD");
      i18n.global.setLocaleMessage(locale, LOCALE_MESSAGES[locale]);
      i18n.global.locale.value = locale;
      i18nState.t = (key, params) => i18n.global.t(key, params ?? {});

      const { message, announce } = useLayoutAnnouncer("localesSpec");
      announce(signal);

      expect(message.value).not.toContain("shared.dashboard");
      // The block's name is the one thing every announcement must carry.
      expect(message.value).toContain("probe");
    });
  });
});
