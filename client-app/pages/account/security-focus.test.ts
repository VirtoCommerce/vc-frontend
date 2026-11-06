import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref, useTemplateRef } from "vue";
import SecurityPage from "./security.vue";

const mocks = vi.hoisted(() => ({
  openModal: vi.fn(),
  deleteKey: vi.fn(),
  createKey: vi.fn(),
}));

const signInMethods = ref<
  {
    name: string;
    displayName: string;
    canCreateKey: boolean;
    canDeleteKey: boolean;
    keys: { id: string; name: string }[];
  }[]
>([]);

vi.mock("@/shared/account", () => ({
  useSignInMethods: () => ({
    signInMethods,
    loading: ref(false),
    renaming: ref(false),
    deleting: ref(false),
    refetch: vi.fn(),
    renameKey: vi.fn(),
    deleteKey: mocks.deleteKey,
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

vi.mock("@/shared/modal", () => ({ useModal: () => ({ openModal: mocks.openModal }) }));

vi.mock("@/ui-kit/components", () => ({ VcConfirmationModal: {} }));

const t = (key: string, named?: Record<string, unknown>) => (named ? `${key}|${JSON.stringify(named)}` : key);

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t, d: (value: string) => value }),
}));

// Renders a real <button> and exposes focus(), like VcButton.
const VcButtonStub = defineComponent({
  inheritAttrs: false,
  props: { ariaLabel: { type: String, default: undefined } },
  emits: { click: (event: MouseEvent) => event instanceof MouseEvent },

  setup(props, { attrs, emit, expose, slots }) {
    const button = useTemplateRef<HTMLButtonElement>("button");

    expose({ focus: () => button.value?.focus() });

    return () =>
      h(
        "button",
        {
          ...attrs,
          ref: "button",
          type: "button",
          "aria-label": props.ariaLabel,
          onClick: (e: MouseEvent) => emit("click", e),
        },
        slots.default?.(),
      );
  },
});

const extensionProps = {
  createKey: mocks.createKey,
  creating: false,
  createKeyText: "Add passkey",
};

enableAutoUnmount(afterEach);

function mountPage() {
  return mount(SecurityPage, {
    attachTo: document.body,
    global: {
      mocks: { $t: t },
      stubs: {
        VcTypography: { template: "<h1><slot /></h1>" },
        ExtensionPoint: defineComponent({
          setup(_, { slots }) {
            return () => h("div", slots.default?.({ extensionProps }));
          },
        }),
        VcWidget: { template: "<section><slot name='append' /><slot /></section>" },
        VcIcon: true,
        VcButton: VcButtonStub,
      },
    },
  });
}

function addPasskeyButton(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-test-id='create-sign-in-key-button']");
}

describe("security page — keyboard focus after adding or deleting a key (VCST-6600)", () => {
  beforeEach(() => {
    signInMethods.value = [
      {
        name: "Passkey",
        displayName: "Passkey",
        canCreateKey: true,
        canDeleteKey: true,
        keys: [{ id: "key-1", name: "Work laptop" }],
      },
    ];
    mocks.openModal.mockReset();
    mocks.deleteKey.mockReset();
    mocks.createKey.mockReset();
  });

  it("keeps focus on Add passkey once the passkey is created", async () => {
    // A browser drops focus to the body when the focused button turns disabled for the loading state.
    mocks.createKey.mockImplementation(async () => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
    mountPage();
    const add = addPasskeyButton()!;
    add.focus();

    add.click();
    await flushPromises();

    expect(document.activeElement).toBe(add);
  });

  it("moves focus to Add passkey after the key is deleted, not to the page body", async () => {
    mocks.deleteKey.mockImplementation(async () => {
      signInMethods.value = [{ ...signInMethods.value[0], keys: [] }];
    });
    mocks.openModal.mockReturnValue(vi.fn());
    mountPage();
    const deleteButton = document.querySelector<HTMLButtonElement>("li button")!;
    deleteButton.focus();
    deleteButton.click();

    const [{ props }] = mocks.openModal.mock.calls[0] as [{ props: { onConfirm: () => Promise<void> } }];
    await props.onConfirm();
    await flushPromises();

    expect(deleteButton.isConnected).toBe(false);
    expect(document.activeElement).toBe(addPasskeyButton());
  });

  it("moves focus to the passkey list when there is no Add passkey button", async () => {
    signInMethods.value = [{ ...signInMethods.value[0], canCreateKey: false }];
    mocks.deleteKey.mockImplementation(async () => {
      signInMethods.value = [{ ...signInMethods.value[0], keys: [] }];
    });
    mocks.openModal.mockReturnValue(vi.fn());
    mountPage();
    document.querySelector<HTMLButtonElement>("li button")!.click();

    const [{ props }] = mocks.openModal.mock.calls[0] as [{ props: { onConfirm: () => Promise<void> } }];
    await props.onConfirm();
    await flushPromises();

    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toBe(document.querySelector("[data-test-id='sign-in-keys-empty-label']"));
  });
});
