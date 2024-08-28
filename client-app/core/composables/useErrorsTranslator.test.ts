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

  const { localizedItemsErrors, setErrors } = useErrorsTranslator("validation_error");

  it("Test for unexisting error", () => {
    setErrors([
      {
        errorCode: "PRODUCT_QTY_INSUFFICIENT",
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["123"]).toBeUndefined();
  });

  it("Test for insufficient product quantity", () => {
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

  it("Test for product quantity changed error", () => {
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

  it("Test for product inactive error", () => {
    setErrors([
      {
        errorCode: "CART_PRODUCT_INACTIVE",
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"]).toBeDefined();
    expect(
      localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"].includes("validation_error.CART_PRODUCT_INACTIVE"),
    ).toBeTruthy();
  });

  it("Test for product price is invalid error", () => {
    setErrors([
      {
        errorCode: "PRODUCT_PRICE_INVALID",
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"]).toBeDefined();
    expect(
      localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"].includes("validation_error.PRODUCT_PRICE_INVALID"),
    ).toBeTruthy();
  });

  it("Test for product is out of stock error", () => {
    setErrors([
      {
        errorCode: "PRODUCT_FFC_QTY",
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"]).toBeDefined();
    expect(
      localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"].includes("validation_error.PRODUCT_FFC_QTY"),
    ).toBeTruthy();
  });

  it("Test for product min quantity error", () => {
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

  it("Test for product max quantity error", () => {
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

  it("Test for product min/max quantity error", () => {
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

  it("Test for line item mot found error", () => {
    setErrors([
      {
        errorCode: "LINE_ITEM_NOT_FOUND",
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"]).toBeDefined();
    expect(
      localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"].includes("validation_error.LINE_ITEM_NOT_FOUND"),
    ).toBeTruthy();
  });

  it("Test for product min order quantity is not available error", () => {
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

  it("Test for product exact quantity error", () => {
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

  it("Test for invalid product error", () => {
    setErrors([
      {
        errorCode: "CART_INVALID_PRODUCT",
        objectId: "78e7a44e292a439a9a4e059bda5a398f",
        objectType: "CartProduct",
      },
    ]);

    expect(localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"]).toBeDefined();
    expect(
      localizedItemsErrors.value["78e7a44e292a439a9a4e059bda5a398f"].includes("validation_error.CART_INVALID_PRODUCT"),
    ).toBeTruthy();
  });
});
