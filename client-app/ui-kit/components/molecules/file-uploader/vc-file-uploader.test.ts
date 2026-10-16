import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";
import enMessages from "../../../locales/en.json";
import VcAlert from "../alert/vc-alert.vue";
import VcFilePicker from "../file-picker/vc-file-picker.vue";
import VcFileUploader from "./vc-file-uploader.vue";

const i18n = createI18n({ locale: "en", legacy: false, messages: { en: enMessages }, missingWarn: false });

function mountUploader(unavailable?: boolean) {
  return mount(VcFileUploader, {
    props: { maxFileCount: 5, maxFileSize: 1024 * 1024, allowedExtensions: [], files: [], unavailable },
    global: {
      plugins: [i18n],
      components: { VcAlert, VcFilePicker },
      stubs: { VcFile: true, VcFilePicker: true, VcIcon: true },
    },
  });
}

describe("VcFileUploader", () => {
  it("disables the picker and shows the notice instead of the requirements when unavailable", () => {
    const wrapper = mountUploader(true);

    const picker = wrapper.findComponent(VcFilePicker);
    expect(picker.props("disabled")).toBe(true);
    expect(picker.props("requirements")).toBeUndefined();
    expect(wrapper.get('[data-test-id="file-uploader-unavailable"]').text()).toBe("File upload is not available.");
  });

  it("keeps the picker and its requirements when available", () => {
    // Control: the default state.
    const wrapper = mountUploader();

    const picker = wrapper.findComponent(VcFilePicker);
    expect(picker.props("disabled")).toBe(false);
    expect(picker.props("requirements")).toContain("1MB");
    expect(wrapper.find('[data-test-id="file-uploader-unavailable"]').exists()).toBe(false);
  });
});
