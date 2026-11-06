import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import SecurityPage from "./security.vue";

const signInMethods = ref([
  {
    name: "Passkey",
    displayName: "Passkey",
    canCreateKey: false,
    canRenameKey: true,
    canDeleteKey: true,
    keys: [
      { id: "key-1", name: "Work laptop" },
      { id: "key-2", name: "Phone" },
      { id: "key-3", name: "" },
    ],
  },
]);

vi.mock("@/shared/account", () => ({
  useSignInMethods: () => ({
    signInMethods,
    loading: ref(false),
    renaming: ref(false),
    deleting: ref(false),
    refetch: vi.fn(),
    renameKey: vi.fn(),
    deleteKey: vi.fn(),
  }),
}));

vi.mock("@/shared/account/components/rename-sign-in-key-modal.vue", () => ({ default: {} }));

vi.mock("@/core/composables", () => ({ usePageHead: vi.fn() }));

vi.mock("@/core/composables/useThemeContext", () => ({
  useThemeContext: () => ({ themeContext: ref({ storeSettings: { authenticationTypes: ["Passkey"] } }) }),
}));

vi.mock("@/shared/common/composables/extensionRegistry/useExtensionRegistry", () => ({
  useExtensionRegistry: () => ({ getContribution: () => ({}) }),
}));

vi.mock("@/shared/modal", () => ({ useModal: () => ({ openModal: vi.fn() }) }));

vi.mock("@/ui-kit/components", () => ({ VcConfirmationModal: {} }));

/** "key|{named}" — enough to tell which key a label was built for */
const t = (key: string, named?: Record<string, unknown>) => (named ? `${key}|${JSON.stringify(named)}` : key);

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t, d: (value: string) => value }),
}));

enableAutoUnmount(afterEach);

function mountPage() {
  return mount(SecurityPage, {
    global: {
      mocks: { $t: t },
      stubs: {
        VcTypography: { template: "<h1><slot /></h1>" },
        ExtensionPoint: { template: "<div><slot :extension-props='{}' /></div>" },
        VcWidget: { template: "<section><slot /></section>" },
        VcIcon: true,
        VcButton: { template: "<button type='button'><slot /></button>" },
      },
    },
  });
}

describe("security page — key action buttons (VCST-6599)", () => {
  it("names every rename / delete button after its own key, so the keys can be told apart", () => {
    const labels = mountPage()
      .findAll("li button")
      .map((button) => button.attributes("aria-label"));

    expect(labels).toHaveLength(6);
    expect(new Set(labels).size).toBe(6);
    expect(labels.filter((label) => label?.includes("Work laptop"))).toHaveLength(2);
    expect(labels.filter((label) => label?.includes("Phone"))).toHaveLength(2);
  });

  it("falls back to the unnamed-key text for a key without a name", () => {
    const labels = mountPage()
      .findAll("li")[2]
      .findAll("button")
      .map((button) => button.attributes("aria-label"));

    expect(labels.every((label) => label?.includes("pages.account.security.unnamed_key"))).toBe(true);
  });
});
