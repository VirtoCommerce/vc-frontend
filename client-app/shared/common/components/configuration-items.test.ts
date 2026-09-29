import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { CONFIGURABLE_SECTION_TYPES } from "@/shared/catalog/constants/configurableProducts";
import ConfigurationItems from "./configuration-items.vue";

const downloadFileMock = vi.hoisted(() => vi.fn());

vi.mock("@/shared/files", () => ({ downloadFile: downloadFileMock }));

function mountItems(files: Array<{ name: string; url?: string | null }>) {
  return mount(ConfigurationItems, {
    props: {
      configurationItems: [{ id: "1", type: CONFIGURABLE_SECTION_TYPES.file, files }],
    },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { VcIcon: true, VcButton: true, VcPriceDisplay: true },
    },
  });
}

describe("ConfigurationItems", () => {
  it("renders one link per file and downloads it on click", async () => {
    const wrapper = mountItems([
      { name: "a.txt", url: "/api/files/a" },
      { name: "b.txt", url: "/api/files/b" },
    ]);

    const links = wrapper.findAll("a.configuration-items__file");
    expect(links.map((link) => link.attributes("href"))).toEqual(["/api/files/a", "/api/files/b"]);
    expect(links[1].attributes("download")).toBe("b.txt");

    await links[1].trigger("click");
    expect(downloadFileMock).toHaveBeenCalledWith("/api/files/b", "b.txt");
  });

  it("renders a file without url as plain text", () => {
    const wrapper = mountItems([{ name: "pending.txt", url: null }]);

    expect(wrapper.find("a").exists()).toBe(false);
    expect(wrapper.find("span.configuration-items__file").text()).toBe("pending.txt");
  });
});
