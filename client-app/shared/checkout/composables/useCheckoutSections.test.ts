import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useCheckoutSections } from "./useCheckoutSections";

const mocks = vi.hoisted(() => ({
  isExternalCheckout: { value: false },
  sections: { value: {} },
  allItemsAreDigital: { value: false },
  isValidShipment: { value: false },
  isValidPayment: { value: false },
  themeContext: { value: { settings: { checkout_multistep_enabled: false, checkout_comment_enabled: true } } },
}));

vi.mock("@/core/composables", () => ({
  useThemeContext: () => ({ themeContext: mocks.themeContext }),
}));

vi.mock("./useExternalCheckout", () => ({
  useExternalCheckout: () => ({ isExternalCheckout: mocks.isExternalCheckout, sections: mocks.sections }),
}));
vi.mock("@/shared/cart", () => ({
  useFullCart: () => ({ allItemsAreDigital: mocks.allItemsAreDigital }),
}));
vi.mock("./useCheckout", () => ({
  useCheckout: () => ({ isValidShipment: mocks.isValidShipment, isValidPayment: mocks.isValidPayment }),
}));

describe("useCheckoutSections", () => {
  beforeEach(() => {
    mocks.isExternalCheckout = ref(false);
    mocks.sections = ref({});
    mocks.allItemsAreDigital = ref(false);
    mocks.isValidShipment = ref(false);
    mocks.isValidPayment = ref(false);
    mocks.themeContext = ref({ settings: { checkout_multistep_enabled: false, checkout_comment_enabled: true } });
  });

  it("shows every section and checks shipping and payment in a store checkout", () => {
    mocks.sections.value = { shipping: false, payment: false, comment: false };

    const sections = useCheckoutSections();

    expect(sections.isShippingSectionVisible.value).toBe(true);
    expect(sections.isPaymentSectionVisible.value).toBe(true);
    expect(sections.isCommentSectionVisible.value).toBe(true);
    expect(sections.hasIncompleteSections.value).toBe(true);
  });

  it("reports incomplete sections when only the payment is invalid", () => {
    mocks.isValidShipment.value = true;

    const sections = useCheckoutSections();

    expect(sections.isPaymentSectionVisible.value).toBe(true);
    expect(sections.hasIncompleteSections.value).toBe(true);
  });

  it("hides the shipping section when all items are digital", () => {
    mocks.allItemsAreDigital.value = true;
    mocks.isValidPayment.value = true;

    const sections = useCheckoutSections();

    expect(sections.isShippingSectionVisible.value).toBe(false);
    expect(sections.hasIncompleteSections.value).toBe(false);
  });

  it("hides the comment section when the comment setting is off", () => {
    mocks.themeContext.value.settings.checkout_comment_enabled = false;

    const sections = useCheckoutSections();

    expect(sections.isCommentSectionVisible.value).toBe(false);
  });

  it("hides the comment section when the comment setting is off even if an external checkout keeps it", () => {
    mocks.themeContext.value.settings.checkout_comment_enabled = false;
    mocks.isExternalCheckout.value = true;
    mocks.sections.value = { comment: true };

    const sections = useCheckoutSections();

    expect(sections.isCommentSectionVisible.value).toBe(false);
  });

  it("hides the sections an external checkout turns off and does not check them", () => {
    mocks.isExternalCheckout.value = true;
    mocks.sections.value = { shipping: false, payment: false, comment: false };

    const sections = useCheckoutSections();

    expect(sections.isShippingSectionVisible.value).toBe(false);
    expect(sections.isPaymentSectionVisible.value).toBe(false);
    expect(sections.isCommentSectionVisible.value).toBe(false);
    expect(sections.hasIncompleteSections.value).toBe(false);
  });

  it("checks only the sections an external checkout keeps", () => {
    mocks.isExternalCheckout.value = true;
    mocks.sections.value = { shipping: true, payment: false };

    const sections = useCheckoutSections();

    expect(sections.isCommentSectionVisible.value).toBe(true);
    expect(sections.hasIncompleteSections.value).toBe(true);

    mocks.isValidShipment.value = true;
    expect(sections.hasIncompleteSections.value).toBe(false);
  });

  it("is single-page in a store checkout with multistep disabled", () => {
    const { isSinglePageCheckout } = useCheckoutSections();

    expect(isSinglePageCheckout.value).toBe(true);
  });

  it("follows the multistep setting in a store checkout", () => {
    mocks.themeContext.value.settings.checkout_multistep_enabled = true;

    const { isSinglePageCheckout } = useCheckoutSections();

    expect(isSinglePageCheckout.value).toBe(false);
  });

  it("is single-page in an external checkout even with multistep enabled", () => {
    mocks.themeContext.value.settings.checkout_multistep_enabled = true;
    mocks.isExternalCheckout.value = true;

    const { isSinglePageCheckout } = useCheckoutSections();

    expect(isSinglePageCheckout.value).toBe(true);
  });
});
