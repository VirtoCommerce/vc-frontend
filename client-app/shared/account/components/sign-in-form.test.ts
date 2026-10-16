import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignInForm from "./sign-in-form.vue";

const h = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    authorize: vi.fn(),
    signIn: vi.fn(),
    analytics: vi.fn(),
    errors: ref<{ code: string; description: string }[]>([]),
  };
});

// The submit handler alone: validation passes, and both fields hold a value.
vi.mock("vee-validate", async () => {
  const { ref } = await import("vue");
  return {
    useForm: () => ({ errors: ref({}), meta: ref({ touched: false }), handleSubmit: (fn: () => unknown) => fn }),
    useField: () => ({ value: ref("rep@example.com") }),
  };
});

vi.mock("@/core/composables", () => ({
  useAuth: () => ({ authorize: h.authorize }),
  useAnalytics: () => ({ analytics: h.analytics }),
  useErrorsTranslator: () => ({ translate: (error: { code: string }) => error.code }),
}));

vi.mock("@/shared/account/composables", async () => {
  const { ref } = await import("vue");
  return {
    useSignMeIn: () => ({ errors: h.errors, loading: ref(false), signIn: h.signIn, resetErrors: vi.fn() }),
  };
});

vi.mock("@/core/utilities", () => ({
  isLockoutError: () => false,
  Logger: { error: vi.fn() },
}));

vi.mock("@/shared/common", () => ({ ContactAdministratorLink: { template: "<a />" } }));

async function submit(): Promise<void> {
  const wrapper = mount(SignInForm, {
    global: {
      stubs: { VcAlert: true, VcInput: true, VcCheckbox: true, VcButton: true, RouterLink: true },
      mocks: { $t: (key: string) => key },
    },
  });

  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

beforeEach(() => {
  h.authorize.mockReset().mockResolvedValue(undefined);
  h.signIn.mockReset().mockResolvedValue(undefined);
  h.analytics.mockReset();
  h.errors.value = [];
});

// One login event per attempt: GA counts these, and the Sales Rep hub counts the successes as sign-ins.
describe("SignInForm login event", () => {
  // The token request both throws and fills the identity errors on a 400.
  it("reports a wrong password once, with the identity errors", async () => {
    h.authorize.mockImplementation(() => {
      h.errors.value = [{ code: "invalid_grant", description: "The login or password is incorrect." }];
      return Promise.reject(new Error("Bad Request"));
    });

    await submit();

    expect(h.analytics.mock.calls).toEqual([
      ["login", "password", { success: false, errors: "invalid_grant: The login or password is incorrect." }],
    ]);
  });

  it("reports a sign-in that threw once, as a failure", async () => {
    h.authorize.mockRejectedValue(new Error("Failed to fetch"));

    await submit();

    expect(h.analytics.mock.calls).toEqual([["login", "password", { success: false, errors: "Failed to fetch" }]]);
  });

  it("reports a sign-in that went through as a success", async () => {
    await submit();

    expect(h.analytics.mock.calls).toEqual([["login", "password", { success: true }]]);
  });
});
