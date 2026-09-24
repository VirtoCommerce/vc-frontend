import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { createI18n } from "@/i18n";
import { uiKit } from "@/ui-kit";
import uiKitMessages from "@/ui-kit/locales/en.json";
import enMessages from "../../../../../../locales/en.json";
import OptionFile from "../option-file.vue";
import type { CartConfigurationItemFileType } from "@/core/api/graphql/types";
import type { VueWrapper } from "@vue/test-utils";

// Stands in for `POST /api/files/{scope}`: each test sets how the server answers the files of a request.
const server = vi.hoisted(() => ({
  respond: vi.fn<(fileNames: string[]) => unknown[]>(),
}));

vi.mock("@/core/api/common/composables/useAxios", async () => {
  const { shallowRef } = await import("vue");

  return {
    useAxios: () => {
      const data = shallowRef<unknown[]>();

      return {
        data,
        execute: (_url: string, config: { data: FormData }) => {
          data.value = server.respond(config.data.getAll("file").map((file) => (file as File).name));
          return Promise.resolve();
        },
      };
    },
  };
});

vi.mock("@/core/api/graphql/files", () => ({
  getFileUploadOptions: vi.fn(),
  deleteFile: vi.fn().mockResolvedValue(true),
}));

const saved = (name: string) => ({ succeeded: true, id: `id-${name}`, name, url: `/api/files/id-${name}` });

// The server's answer when the `product-configuration` scope is not registered: one result that names no file.
const invalidScope = {
  succeeded: false,
  errorCode: "INVALID_SCOPE",
  errorMessage: "Unknown scope 'product-configuration'",
  errorParameter: "product-configuration",
};

enableAutoUnmount(afterEach);

beforeEach(() => {
  server.respond.mockReset();
});

// Hosts OptionFile the way product-configuration.vue does: the files it reports on `input` become the section's
// selection and come straight back as `value`.
function mountOptionFile() {
  const i18n = createI18n("en", "USD");
  i18n.global.setLocaleMessage("en", enMessages);
  i18n.global.mergeLocaleMessage("en", uiKitMessages);

  const value = ref<CartConfigurationItemFileType[]>();
  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(OptionFile, {
            value: value.value,
            onInput: (files: CartConfigurationItemFileType[]) => {
              value.value = files;
            },
          });
      },
    }),
    // VcImage and VcIcon only draw the file and button icons.
    { global: { plugins: [i18n, uiKit], stubs: { VcImage: true, VcIcon: true } } },
  );

  return { wrapper, value, optionFile: wrapper.findComponent(OptionFile) };
}

// Picks a file in the field's file input, as the user does, and waits for the upload and everything it sets off.
async function attach(wrapper: VueWrapper, name: string): Promise<void> {
  const input = wrapper.get<HTMLInputElement>('input[type="file"]');
  Object.defineProperty(input.element, "files", {
    value: [new File(["content"], name, { type: "text/plain" })],
    configurable: true,
  });
  await input.trigger("input");
  await flushPromises();
}

describe("OptionFile", () => {
  it("keeps a failed file and its error in the field", async () => {
    // Nothing was uploaded, so the selection is still empty. Reporting it anyway came back as a new empty `value`,
    // which the field treated as a reset and cleared.
    server.respond.mockImplementation(() => [invalidScope]);
    const { wrapper } = mountOptionFile();

    await attach(wrapper, "drawing.txt");

    const file = wrapper.get(".vc-file");
    expect(file.text()).toContain("drawing.txt");
    expect(file.get(".vc-file__message--error").text()).toMatch(/^Unknown scope '.*'\./);
    expect(wrapper.text()).toContain("Fix file upload errors to continue.");
  });

  it("does not report an empty selection when the failed file is removed", async () => {
    // The section has no files before or after, so there is nothing to report. product-configuration.vue would store
    // an empty report as a selection, which deselects "None".
    server.respond.mockImplementation(() => [invalidScope]);
    const { wrapper, optionFile } = mountOptionFile();
    await attach(wrapper, "drawing.txt");

    await wrapper.get('.vc-file button[aria-label="Remove file"]').trigger("click");
    await flushPromises();

    expect(wrapper.find(".vc-file").exists()).toBe(false);
    expect(optionFile.emitted("input")).toBeUndefined();
  });

  it("reports an uploaded file", async () => {
    // Control: a saved file becomes the section's selection.
    server.respond.mockImplementation((fileNames) => fileNames.map((name) => saved(name)));
    const { wrapper, optionFile } = mountOptionFile();

    await attach(wrapper, "drawing.txt");

    expect(optionFile.emitted("input")).toEqual([
      [[expect.objectContaining({ name: "drawing.txt", url: "/api/files/id-drawing.txt" })]],
    ]);
    expect(wrapper.get(".vc-file__link").text()).toBe("drawing.txt");
  });

  it("reports the empty selection when the uploaded file is removed", async () => {
    // Control: the section had a file, so it has to hear that it has none now.
    server.respond.mockImplementation((fileNames) => fileNames.map((name) => saved(name)));
    const { wrapper, optionFile } = mountOptionFile();
    await attach(wrapper, "drawing.txt");

    await wrapper.get('.vc-file button[aria-label="Remove file"]').trigger("click");
    await flushPromises();

    expect(optionFile.emitted("input")?.at(-1)).toEqual([[]]);
    expect(wrapper.find(".vc-file").exists()).toBe(false);
  });

  it("clears the field when the selection is cleared from outside", async () => {
    // Control: an empty `value` from product-configuration.vue still resets the field.
    server.respond.mockImplementation((fileNames) => fileNames.map((name) => saved(name)));
    const { wrapper, value } = mountOptionFile();
    await attach(wrapper, "drawing.txt");

    value.value = undefined;
    await flushPromises();

    expect(wrapper.find(".vc-file").exists()).toBe(false);
  });
});
