import { describe, expect, it, vi } from "vitest";
import { useErrorsTranslator } from "./useErrorsTranslator";

function mockI18n(): void {
  vi.mock("vue-i18n", async (importOriginal) => {
    const actualI18n = await importOriginal();
    return {
      ...{ actualI18n },
      useI18n: vi.fn().mockReturnValue({
        t: (key: string) => key,
        te: (key: string) => key,
      }),
    };
  });
}

describe("use-errors-translator", () => {
  mockI18n();

  it("Test", () => {
    const { localizedItemsErrors, setErrors } = useErrorsTranslator("validation_error");

    setErrors([
      {
        errorCode: "PRODUCT_QTY_INSUFFICIENT",
        errorParameters: [
          {
            key: "new_qty",
            value: 1600,
          },
          {
            key: "avail_qty",
            value: 1586,
          },
        ],
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"]).toBeDefined();
    expect(localizedItemsErrors.value["123"]).toBeUndefined();
  });
});
