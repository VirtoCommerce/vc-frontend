import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import BottomHeaderLink from "./bottom-header-link.vue";

vi.mock("@/shared/layout/composables/useHeaderCountLabel", () => ({
  useHeaderCountLabel: () => ({ getCountAriaLabel: (title?: string) => title }),
}));
vi.mock("@/shared/layout/components/header-badge/header-badge.vue", () => ({ default: { template: "<span />" } }));

const EXTERNAL_URL = "https://example.com/docs";

function mountLink(route: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/:pathMatch(.*)*", component: { template: "<div />" } }],
  });
  const push = vi.spyOn(router, "push");
  const wrapper = mount(BottomHeaderLink, {
    props: { link: { title: "Docs", route } },
    global: { plugins: [router], stubs: { VcIcon: true } },
  });

  return { wrapper, push };
}

describe("BottomHeaderLink", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens an external URL as it is, in a new tab, without the router", async () => {
    const { wrapper, push } = mountLink(EXTERNAL_URL);
    const anchor = wrapper.get("a");

    await anchor.trigger("click");

    expect(anchor.attributes()).toMatchObject({
      href: EXTERNAL_URL,
      target: "_blank",
      rel: "noopener noreferrer",
    });
    expect(push).not.toHaveBeenCalled();
  });

  it("does not put a script URL into href", () => {
    const { wrapper } = mountLink("javascript:alert(1)");
    const anchor = wrapper.get("a");

    expect(anchor.attributes("href")).not.toMatch(/^javascript:/i);
    expect(anchor.attributes("target")).toBeUndefined();
  });

  it("navigates to an internal route with the router, in the same tab", async () => {
    const { wrapper, push } = mountLink("/cart");
    const anchor = wrapper.get("a");

    await anchor.trigger("click");

    expect(anchor.attributes("href")).toBe("/cart");
    expect(anchor.attributes("target")).toBeUndefined();
    expect(push).toHaveBeenCalledOnce();
  });

  it("renders a button without a route", () => {
    const { wrapper } = mountLink("");

    expect(wrapper.find("a").exists()).toBe(false);
    expect(wrapper.get("button").attributes("target")).toBeUndefined();
  });
});
