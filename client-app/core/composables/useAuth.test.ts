import { afterEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { Ref } from "vue";

const tokenParams: { value?: Ref<URLSearchParams | undefined> } = {};
const tokenResponse = ref<unknown>(null);

function tokenRequest() {
  return { data: tokenResponse, execute: vi.fn().mockResolvedValue(undefined), isFetching: ref(false) };
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
    tokenResponse.value = null;
  });

  describe("authorize", () => {
    it("requests a token with the password grant", async () => {
      const { authorize } = await getUseAuth();

      await authorize("buyer@acme.com", "secret");

      expect(Object.fromEntries(tokenParams.value!.value!)).toEqual({
        grant_type: "password",
        scope: "offline_access",
        storeId: "store-1",
        username: "buyer@acme.com",
        password: "secret",
      });
    });

    it("signs in to the organization last selected for this user name", async () => {
      localStorage.setItem("organization-id-buyer@acme.com", "org-b");
      const { authorize } = await getUseAuth();

      await authorize("buyer@acme.com", "secret");

      expect(tokenParams.value!.value!.get("organization_id")).toBe("org-b");
    });
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

  describe("mfaSignIn", () => {
    it("requests a token with the mfa grant", async () => {
      const { mfaSignIn } = await getUseAuth();

      await mfaSignIn({ email: "buyer@acme.com", twoFactorToken: "token-1", code: "123456", storeId: "store-1" });

      expect(Object.fromEntries(tokenParams.value!.value!)).toEqual({
        grant_type: "mfa",
        scope: "offline_access",
        storeId: "store-1",
        two_factor_token: "token-1",
        code: "123456",
      });
    });

    it("signs in to the organization last selected for this email", async () => {
      localStorage.setItem("organization-id-buyer@acme.com", "org-b");
      const { mfaSignIn } = await getUseAuth();

      await mfaSignIn({ email: "buyer@acme.com", twoFactorToken: "token-1", code: "123456", storeId: "store-1" });

      expect(tokenParams.value!.value!.get("organization_id")).toBe("org-b");
    });
  });

  describe("twoFactorChallenge", () => {
    it("returns the second factor challenge when the password sign-in requires it", async () => {
      tokenResponse.value = {
        errors: [{ code: "two_factor_required" }],
        twoFactorToken: "token-1",
        provider: "Email",
        providers: [{ name: "Email", destination: "b•••r@acme.com" }],
      };
      const { twoFactorChallenge } = await getUseAuth();

      expect(twoFactorChallenge.value).toEqual({
        twoFactorToken: "token-1",
        provider: "Email",
        providers: [{ name: "Email", destination: "b•••r@acme.com" }],
      });
    });

    it.each([
      ["another error", { errors: [{ code: "login_failed" }], twoFactorToken: "token-1" }],
      ["no token", { errors: [{ code: "two_factor_required" }] }],
      ["no response", null],
    ])("returns nothing for %s", async (_case, response) => {
      tokenResponse.value = response;
      const { twoFactorChallenge } = await getUseAuth();

      expect(twoFactorChallenge.value).toBeUndefined();
    });
  });
});
