import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { createI18n } from "@/i18n";
import { useErrorsTranslator } from "./useErrorsTranslator";
import type { ValidationErrorType } from "@/core/api/graphql/types";

const localeFiles = import.meta.glob<{ default: Record<string, unknown> }>("../../../locales/*.json", { eager: true });
const locales = Object.entries(localeFiles).map(([path, module]) => [
  path.slice(path.lastIndexOf("/") + 1, -".json".length),
  module.default,
]);

// Parameter keys as x-cart sends them (CartErrorDescriber.ProductPackSizeError / ProductQuantityLimitError).
const errors: ValidationErrorType[] = [
  {
    objectId: "pack",
    errorCode: "PRODUCT_PACK_SIZE_LIMIT",
    errorMessage: "server text",
    errorParameters: [
      { key: "qty", value: "3" },
      { key: "packSize", value: "4" },
    ],
  },
  {
    objectId: "limit",
    errorCode: "LINE_ITEM_LIMIT",
    errorMessage: "server text",
    errorParameters: [{ key: "limit", value: "999999" }],
  },
];

function translate(locale: string, messages: Record<string, unknown>) {
  const i18n = createI18n(locale, "USD");
  i18n.global.setLocaleMessage(locale, messages);
  i18n.global.locale.value = locale;

  let result: Record<string, string[]> = {};
  mount(
    defineComponent({
      setup() {
        const { localizedItemsErrors, setErrors } = useErrorsTranslator<ValidationErrorType>("validation_error");
        setErrors(errors);
        result = localizedItemsErrors.value;
        return () => h("div");
      },
    }),
    { global: { plugins: [i18n] } },
  );
  return result;
}

describe("quantity validation errors in every locale", () => {
  it.each(locales)("%s fills the server parameters into its own text", (locale, messages) => {
    const result = translate(locale as string, messages as Record<string, unknown>);

    expect(result.pack[0]).toContain("4");
    expect(result.limit[0]).toContain("999999");
    for (const text of [result.pack[0], result.limit[0]]) {
      expect(text).not.toBe("server text");
      expect(text).not.toMatch(/[{}]/);
    }
  });
});
