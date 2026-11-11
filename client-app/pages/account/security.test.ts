import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref, useTemplateRef } from "vue";
import SecurityPage from "./security.vue";

type SignInMethodFixtureType = {
  name: string;
  displayName: string;
  canCreateKey: boolean;
  canRenameKey: boolean;
  canDeleteKey: boolean;
  keys: { id: string; name: string }[];
};

const mocks = vi.hoisted(() => ({
  openModal: vi.fn(),
  createKey: vi.fn(),
  deleteKey: vi.fn(),
  refetch: vi.fn(),
}));

const signInMethods = ref<SignInMethodFixtureType[]>([]);

vi.mock("@/shared/account", () => ({
  useSignInMethods: () => ({
    signInMethods,
    loading: ref(false),
    renaming: ref(false),
    deleting: ref(false),
    refetch: mocks.refetch,
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

/** "key|{named}" — enough to tell which key a label was built for */
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

beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockReset());
});

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

function createPasskeyMethod(overrides: Partial<SignInMethodFixtureType> = {}): SignInMethodFixtureType {
  return {
    name: "Passkey",
    displayName: "Passkey",
    canCreateKey: true,
    canRenameKey: false,
    canDeleteKey: true,
    keys: [{ id: "key-1", name: "Work laptop" }],
    ...overrides,
  };
}

describe("security page — key action buttons", () => {
  beforeEach(() => {
    signInMethods.value = [
      createPasskeyMethod({
        canCreateKey: false,
        canRenameKey: true,
        keys: [
          { id: "key-1", name: "Work laptop" },
          { id: "key-2", name: "Phone" },
          { id: "key-3", name: "" },
        ],
      }),
    ];
  });

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

describe("security page — keyboard focus after adding or deleting a key", () => {
  function addPasskeyButton(): HTMLElement | null {
    return document.querySelector<HTMLElement>("[data-test-id='Passkey-create-key-button']");
  }

  function deleteButtons(): HTMLButtonElement[] {
    return [...document.querySelectorAll<HTMLButtonElement>("li button")];
  }

  // A browser moves focus off a focused button once it turns disabled for its loading state.
  function blurOnCreate(): void {
    mocks.createKey.mockImplementation(async () => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
  }

  // The real mutation resolves only after its list refetch.
  function refreshListOnDelete(): void {
    mocks.deleteKey.mockImplementation(async (_signInMethodName: string, keyId: string) => {
      signInMethods.value = signInMethods.value.map((method) => ({
        ...method,
        keys: method.keys.filter((key) => key.id !== keyId),
      }));

      return true;
    });
  }

  // Closing the real dialog moves focus on the next tick: back to the button that opened it or, once that button
  // is gone, to the control focused before it.
  function mockDeleteDialog(previouslyFocused?: HTMLElement): void {
    mocks.openModal.mockImplementation(() => {
      const opener = document.activeElement as HTMLElement;

      return () => void nextTick(() => (opener.isConnected ? opener : previouslyFocused)?.focus());
    });
  }

  async function confirmDelete(deleteButton: HTMLButtonElement): Promise<void> {
    deleteButton.focus();
    deleteButton.click();

    const [[{ props }]] = mocks.openModal.mock.calls as [[{ props: { onConfirm: () => Promise<void> } }]];
    await props.onConfirm();
  }

  it("returns focus to Add passkey once the passkey is created", async () => {
    signInMethods.value = [createPasskeyMethod()];
    blurOnCreate();
    mountPage();
    const addButton = addPasskeyButton()!;

    addButton.focus();
    addButton.click();
    await flushPromises();

    expect(document.activeElement).toBe(addButton);
  });

  it("leaves focus where the user moved it while the key list was refreshing", async () => {
    signInMethods.value = [createPasskeyMethod()];
    blurOnCreate();
    mountPage();
    const addButton = addPasskeyButton()!;
    const [deleteButton] = deleteButtons();
    mocks.refetch.mockImplementation(async () => {
      deleteButton.focus();
    });

    addButton.focus();
    addButton.click();
    await flushPromises();

    expect(document.activeElement).toBe(deleteButton);
  });

  it("moves focus to Add passkey after a key is deleted", async () => {
    signInMethods.value = [
      createPasskeyMethod({
        keys: [
          { id: "key-1", name: "Work laptop" },
          { id: "key-2", name: "Phone" },
        ],
      }),
    ];
    refreshListOnDelete();
    mountPage();
    const [firstDeleteButton, secondDeleteButton] = deleteButtons();
    mockDeleteDialog(secondDeleteButton);

    await confirmDelete(firstDeleteButton);

    expect(firstDeleteButton.isConnected).toBe(false);
    expect(document.activeElement).toBe(addPasskeyButton());
  });

  it("moves focus to the no-keys text when the last key is deleted and there is no Add passkey button", async () => {
    signInMethods.value = [createPasskeyMethod({ canCreateKey: false })];
    refreshListOnDelete();
    mountPage();
    mockDeleteDialog();

    await confirmDelete(deleteButtons()[0]);

    expect(document.activeElement).toBe(document.querySelector("[data-test-id='Passkey-no-keys-label']"));
  });

  it("leaves focus on the Delete button when the delete fails", async () => {
    signInMethods.value = [createPasskeyMethod()];
    mocks.deleteKey.mockResolvedValue(false);
    mountPage();
    mockDeleteDialog();
    const [deleteButton] = deleteButtons();

    await confirmDelete(deleteButton);

    expect(deleteButton.isConnected).toBe(true);
    expect(document.activeElement).toBe(deleteButton);
  });
});
