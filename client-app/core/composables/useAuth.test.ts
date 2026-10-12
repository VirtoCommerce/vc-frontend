import { afterEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { Ref } from "vue";

const tokenParams: { value?: Ref<URLSearchParams | undefined> } = {};

function tokenRequest() {
  return { data: ref(null), execute: vi.fn().mockResolvedValue(undefined), isFetching: ref(false) };
}

vi.mock("@/core/api/common", () => ({
  useFetch: () => ({
    post: (params: Ref<URLSearchParams | undefined>) => {
      tokenParams.value = params;
      return { json: tokenRequest };
    },
  }),
}));

vi.mock("@/core/api/common/utils", () => ({
  errorHandler: vi.fn(),
  toServerError: vi.fn(),
}));

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store-1" },
}));

vi.mock("@/shared/broadcast", () => ({
  useBroadcast: () => ({ emit: vi.fn() }),
  TabsType: { CURRENT: "current" },
  unauthorizedErrorEvent: "unauthorized-error",
  userBeforeUnauthorizeEvent: "user-before-unauthorize",
}));

async function getUseAuth() {
  const { useAuth } = await import("./useAuth");
  return useAuth();
}

describe("useAuth", () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe("otpSignIn", () => {
    it("requests a token with the otp_email grant", async () => {
      const { otpSignIn } = await getUseAuth();

      await otpSignIn({ email: "buyer@acme.com", code: "123456", storeId: "store-1" });

      expect(Object.fromEntries(tokenParams.value!.value!)).toEqual({
        grant_type: "otp_email",
        scope: "offline_access",
        storeId: "store-1",
        email: "buyer@acme.com",
        code: "123456",
      });
    });

    it("signs in to the organization last selected for this email", async () => {
      localStorage.setItem("organization-id-buyer@acme.com", "org-b");
      const { otpSignIn } = await getUseAuth();

      await otpSignIn({ email: "buyer@acme.com", code: "123456", storeId: "store-1" });

      expect(tokenParams.value!.value!.get("organization_id")).toBe("org-b");
    });
  });
});
