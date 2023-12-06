import { config } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";
import { useQuantityValidationSchema } from ".";

describe("use-quantity-validation-schema", () => {
  beforeEach(() => {
    const i18n = createI18n({});

    config.global.plugins = [i18n];
    config.global.mocks = {
      t: (key: string) => key,
    };
  });

  it("max limit only", () => {
    const { quantitySchema } = useQuantityValidationSchema({});

    expect(quantitySchema.value.isValidSync(1)).toBe(true);
    expect(quantitySchema.value.isValidSync(9999999)).toBe(false);
  });
});
