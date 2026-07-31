import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import VPPageBuilder from "./vp-page-builder.vue";

vi.mock("@/core/composables", () => ({
  useBreadcrumbs: () => [],
}));

vi.mock("@/plugins/builder-preview/block-mapping", () => ({
  getBlockType: () => "section",
}));

const mountedWrappers: Array<{ unmount: () => void }> = [];

afterEach(() => {
  mountedWrappers.splice(0).forEach((wrapper) => wrapper.unmount());
});

describe("VPPageBuilder", () => {
  it("replaces cached content when the network document arrives", async () => {
    const wrapper = mountPageBuilder(pageContent("cached"));

    expect(wrapper.find("#cached").exists()).toBe(true);

    await wrapper.setProps({ content: pageContent("network") });

    expect(wrapper.find("#cached").exists()).toBe(false);
    expect(wrapper.find("#network").exists()).toBe(true);
  });

  it.each([undefined, "", "{", "{}", JSON.stringify({ settings: {}, content: {} })])(
    "clears stale content when the latest payload is %s",
    async (content) => {
      const wrapper = mountPageBuilder(pageContent("stale"));
      expect(wrapper.find("#stale").exists()).toBe(true);

      await wrapper.setProps({ content });

      expect(wrapper.find("#stale").exists()).toBe(false);
      expect(wrapper.html()).not.toContain("section");
    },
  );

  it("recovers when a valid document follows an invalid update", async () => {
    const wrapper = mountPageBuilder("invalid-json");
    expect(wrapper.html()).not.toContain("section");

    await wrapper.setProps({ content: pageContent("recovered") });
    await nextTick();

    expect(wrapper.find("#recovered").exists()).toBe(true);
  });
});

function mountPageBuilder(content?: string) {
  const wrapper = mount(VPPageBuilder, {
    props: { content },
    global: {
      stubs: {
        VcBreadcrumbs: true,
        VcTypography: true,
      },
    },
  });
  mountedWrappers.push(wrapper);
  return wrapper;
}

function pageContent(id: string): string {
  return JSON.stringify({
    settings: { hideBreadcrumbs: true },
    content: [{ id, type: "test-block" }],
  });
}
