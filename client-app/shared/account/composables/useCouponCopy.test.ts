import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCouponCopy } from "./useCouponCopy";

const mocks = vi.hoisted(() => ({
  copy: vi.fn(),
  success: vi.fn(),
  isSupported: { value: true },
}));

vi.mock("@vueuse/core", () => ({
  useClipboard: () => ({ copy: mocks.copy, isSupported: { value: mocks.isSupported.value } }),
}));

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ success: mocks.success }) }));

describe("useCouponCopy", () => {
  beforeEach(() => {
    mocks.copy.mockReset();
    mocks.success.mockReset();
    mocks.isSupported.value = true;
  });

  it("copies the code and shows a success notification", async () => {
    const { copyCoupon } = useCouponCopy();

    await copyCoupon("SALE10");

    expect(mocks.copy).toHaveBeenCalledWith("SALE10");
    expect(mocks.success).toHaveBeenCalledWith(
      expect.objectContaining({ text: "shared.account.promotion_coupons.clipboard_success" }),
    );
  });

  it("does nothing for an empty code", async () => {
    const { copyCoupon } = useCouponCopy();

    await copyCoupon("  ");

    expect(mocks.copy).not.toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it("does nothing when the clipboard is not supported", async () => {
    mocks.isSupported.value = false;
    const { copyCoupon } = useCouponCopy();

    await copyCoupon("SALE10");

    expect(mocks.copy).not.toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
  });
});
