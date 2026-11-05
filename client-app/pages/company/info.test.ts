import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createI18n } from "vue-i18n";
import enMessages from "@/ui-kit/locales/en.json";
import CompanyInfo from "./info.vue";

// Everything a vi.mock factory reaches for must live in the hoisted block — the factories run before this module's
// own top-level bindings exist.
const mocks = await vi.hoisted(async () => {
  const { computed, defineComponent, h, ref } = await import("vue");

  const files = ref<FileType[]>([]);

  return {
    files,
    uploadedFiles: computed(() => files.value.filter((file) => file.status === "uploaded")),
    fileOptions: ref({ allowedExtensions: [] as string[], maxFileSize: 0, maxFileCount: 0, unavailable: false }),
    fetchFileOptions: vi.fn(),
    uploadFiles: vi.fn(),
    FilePicker: defineComponent({
      name: "FilePickerStub",
      props: { disabled: Boolean, files: { type: Array, default: () => [] } },
      emits: { addFiles: (items: INewFile[]) => Array.isArray(items) },

      setup:
        (props, { slots }) =>
        () =>
          h("div", [
            slots.custom?.({ openFilePicker: vi.fn(), onFileDrop: vi.fn(), disabled: props.disabled }),
            slots.default?.(),
          ]),
    }),
    Empty: defineComponent({ setup: () => () => h("div") }),
  };
});

vi.mock("@/core/composables", async () => {
  const { ref } = await import("vue");
  return {
    usePageHead: vi.fn(),
    useWhiteLabeling: () => ({
      whiteLabelingLogoUrl: ref(""),
      fetchWhiteLabelingSettings: vi.fn(),
      isOrganizationLogoUploaded: ref(false),
    }),
  };
});

vi.mock("@/shared/account", async () => {
  const { ref } = await import("vue");
  return {
    AddressDropdownMenu: mocks.Empty,
    useUser: () => ({
      loading: ref(false),
      organization: ref({ id: "org-1", name: "Acme" }),
      checkPermissions: () => true,
    }),
  };
});

vi.mock("@/shared/company", async () => {
  const { ref } = await import("vue");
  return {
    AddOrUpdateCompanyAddressModal: mocks.Empty,
    useCurrentOrganizationAddresses: () => ({
      addresses: ref([]),
      sort: ref({ column: "", direction: "" }),
      page: ref(1),
      pages: ref(1),
      removeAddresses: vi.fn(),
      addOrUpdateAddresses: vi.fn(),
      addAddressToFavorite: vi.fn(),
      removeAddressFromFavorite: vi.fn(),
      loading: ref(false),
    }),
    useOrganization: () => ({ loading: ref(false), updateOrganization: vi.fn() }),
    useOrganizationLogo: () => ({ loading: ref(false), updateLogo: vi.fn() }),
  };
});

vi.mock("@/shared/files", async () => {
  const { ref } = await import("vue");
  return {
    useFiles: () => ({
      files: mocks.files,
      uploadedFiles: mocks.uploadedFiles,
      addFiles: (items: INewFile[]) => mocks.files.value.push(...items),
      validateFiles: vi.fn(),
      uploadFiles: mocks.uploadFiles,
      removeFiles: vi.fn(),
      fetchOptions: mocks.fetchFileOptions,
      options: mocks.fileOptions,
      hasFailedFiles: ref(false),
    }),
  };
});

vi.mock("@/shared/modal", () => ({ useModal: () => ({ openModal: vi.fn(), closeModal: vi.fn() }) }));
vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ warning: vi.fn() }) }));
vi.mock("@/ui-kit/components", () => ({ VcConfirmationModal: mocks.Empty }));

const SLOT = { template: "<div><slot /></div>" };

function newFile(name: string): INewFile {
  return { name, size: 1, contentType: "image/png", status: "new", progress: 0, file: new File([], name) };
}

function mountPage() {
  const errorHandler = vi.fn();
  const i18n = createI18n({ locale: "en", legacy: false, messages: { en: enMessages }, missingWarn: false });

  const wrapper = mount(CompanyInfo, {
    global: {
      plugins: [i18n],
      config: { errorHandler },
      stubs: {
        VcFilePicker: mocks.FilePicker,
        VcWidget: SLOT,
        VcLabel: SLOT,
        VcTypography: SLOT,
        VcInput: true,
        VcButton: true,
        VcImage: true,
        VcAlert: true,
        VcTable: true,
        VcEmptyView: true,
      },
    },
  });

  return { wrapper, errorHandler, picker: () => wrapper.findComponent(mocks.FilePicker) };
}

beforeEach(() => {
  mocks.files.value = [];
  mocks.fileOptions.value = { allowedExtensions: [], maxFileSize: 0, maxFileCount: 0, unavailable: false };
  vi.resetAllMocks();
});

describe("company info page", () => {
  it("renders the logo requirements after the file options load, without an i18n error", async () => {
    mocks.fetchFileOptions.mockImplementation(async () => {
      await Promise.resolve();
      mocks.fileOptions.value = { ...mocks.fileOptions.value, allowedExtensions: [".jpg", ".png"], maxFileSize: 1024 };
    });

    const { wrapper, errorHandler } = mountPage();
    await flushPromises();

    expect(errorHandler).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("JPG, PNG");
  });

  it("disables the logo picker while any file is uploading", async () => {
    const { picker } = mountPage();
    await flushPromises();

    expect(picker().props("disabled")).toBe(false);

    mocks.files.value = [
      { ...newFile("a.png"), status: "attached", url: "/a.png" },
      { ...newFile("b.png"), status: "uploading" },
    ];
    await flushPromises();

    expect(picker().props("disabled")).toBe(true);
  });

  it("keeps the page working when the picked logo is not uploaded", async () => {
    const { picker, errorHandler } = mountPage();
    await flushPromises();

    mocks.uploadFiles.mockImplementation(() => {
      mocks.files.value[0].status = "error";
    });
    picker().vm.$emit("addFiles", [newFile("too-big.png")]);
    await flushPromises();

    expect(errorHandler).not.toHaveBeenCalled();
  });

  it("shows the preview of an uploaded logo", async () => {
    const { wrapper, picker } = mountPage();
    await flushPromises();

    mocks.uploadFiles.mockImplementation(() => {
      Object.assign(mocks.files.value[0], { status: "uploaded", id: "f-1", url: "/logo.png" });
    });
    picker().vm.$emit("addFiles", [newFile("logo.png")]);
    await flushPromises();

    expect(wrapper.findComponent({ name: "VcImage" }).attributes("src")).toBe("/logo.png");
  });
});
