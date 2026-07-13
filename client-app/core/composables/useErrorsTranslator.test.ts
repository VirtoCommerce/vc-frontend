import { describe, expect, it, vi } from "vitest";
import { useErrorsTranslator } from "./useErrorsTranslator";

function mockI18n(): void {
  vi.mock("vue-i18n", () => {
    return {
      useI18n: vi.fn().mockReturnValue({
        t: (key: string) => key,
        te: (key: string) => key,
      }),
    };
  });
}

describe("use-errors-translator", () => {
  mockI18n();

  it("should return undefined error", () => {
    const { localizedItemsErrors, setErrors } = useErrorsTranslator("validation_error");

    setErrors([
      {
        errorCode: "PRODUCT_QTY_INSUFFICIENT",
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["123"]).toBeUndefined();
  });

  it("should retrun insufficient product quantity error", () => {
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
    expect(
      localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"].includes(
        "validation_error.PRODUCT_QTY_INSUFFICIENT",
      ),
    ).toBeTruthy();
  });

  it("should return product quantity changed error", () => {
    const { localizedItemsErrors, setErrors } = useErrorsTranslator("validation_error");

    setErrors([
      {
        errorCode: "PRODUCT_QTY_CHANGED",
        errorParameters: [
          {
            key: "availQty",
            value: "10",
          },
        ],
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"]).toBeDefined();
    expect(
      localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"].includes("validation_error.PRODUCT_QTY_CHANGED"),
    ).toBeTruthy();
  });

  const errorsWithoutParameters: { description: string; errorCode: string }[] = [
    { description: "product inactive", errorCode: "CART_PRODUCT_INACTIVE" },
    { description: "invalid product price", errorCode: "PRODUCT_PRICE_INVALID" },
    { description: "product is out of stock", errorCode: "PRODUCT_FFC_QTY" },
    { description: "line item not found", errorCode: "LINE_ITEM_NOT_FOUND" },
    { description: "invalid product", errorCode: "CART_INVALID_PRODUCT" },
  ];

  it.each(errorsWithoutParameters)("should return $description error", ({ errorCode }) => {
    const { localizedItemsErrors, setErrors } = useErrorsTranslator("validation_error");

    setErrors([
      {
        errorCode,
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"]).toBeDefined();
    expect(
      localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"].includes(`validation_error.${errorCode}`),
    ).toBeTruthy();
  });

  it("should return product min quantity error", () => {
    const { localizedItemsErrors, setErrors } = useErrorsTranslator("validation_error");

    setErrors([
      {
        errorCode: "PRODUCT_MIN_QTY",
        errorParameters: [
          {
            key: "minQty",
            value: 5,
          },
        ],
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"]).toBeDefined();
    expect(
      localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"].includes("validation_error.PRODUCT_MIN_QTY"),
    ).toBeTruthy();
  });

  it("should return product max quantity error", () => {
    const { localizedItemsErrors, setErrors } = useErrorsTranslator("validation_error");

    setErrors([
      {
        errorCode: "PRODUCT_MAX_QTY",
        errorParameters: [
          {
            key: "maxQty",
            value: 5,
          },
        ],
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"]).toBeDefined();
    expect(
      localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"].includes("validation_error.PRODUCT_MAX_QTY"),
    ).toBeTruthy();
  });

  it("should return product min/max quantity error", () => {
    const { localizedItemsErrors, setErrors } = useErrorsTranslator("validation_error");

    setErrors([
      {
        errorCode: "PRODUCT_MIN_MAX_QTY",
        errorParameters: [
          {
            key: "minQty",
            value: 2,
          },
          {
            key: "maxQty",
            value: 5,
          },
        ],
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"]).toBeDefined();
    expect(
      localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"].includes("validation_error.PRODUCT_MIN_MAX_QTY"),
    ).toBeTruthy();
  });

  it("should return product min order quantity is not available error", () => {
    const { localizedItemsErrors, setErrors } = useErrorsTranslator("validation_error");

    setErrors([
      {
        errorCode: "PRODUCT_MIN_QTY_NOT_AVAILABLE",
        errorParameters: [
          {
            key: "minQty",
            value: "150",
          },
        ],
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"]).toBeDefined();
    expect(
      localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"].includes(
        "validation_error.PRODUCT_MIN_QTY_NOT_AVAILABLE",
      ),
    ).toBeTruthy();
  });

  it("should return product exact quantity error", () => {
    const { localizedItemsErrors, setErrors } = useErrorsTranslator("validation_error");

    setErrors([
      {
        errorCode: "PRODUCT_EXACT_QTY",
        errorParameters: [
          {
            key: "minQty",
            value: "150",
          },
        ],
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"]).toBeDefined();
    expect(
      localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"].includes("validation_error.PRODUCT_EXACT_QTY"),
    ).toBeTruthy();
  });
});
