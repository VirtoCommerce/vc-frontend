import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import VcBreadcrumbs from "./vc-breadcrumbs.vue";

const createWrapper = createWrapperFactory(mount, VcBreadcrumbs);

const ITEMS = [{ title: "Home", route: "/" }, { title: "Hub" }, { title: "Orders" }];

// One row per <li>: what it wraps its text in, under which class, where it points, and whether it is exposed.
const shape = (wrapper: ReturnType<typeof createWrapper>) =>
  wrapper.findAll("li.vc-breadcrumbs__item").map((li) => ({
    child: li.element.firstElementChild?.tagName ?? null,
    childClass: li.element.firstElementChild?.getAttribute("class") ?? null,
    to: li.element.firstElementChild?.getAttribute("to") ?? null,
    text: li.text(),
    hidden: li.attributes("aria-hidden") ?? null,
  }));

enableAutoUnmount(afterEach);

describe("VcBreadcrumbs", () => {
  it("links a crumb that carries a route and renders a routeless one exactly like the current page", () => {
    const wrapper = createWrapper({ props: { items: ITEMS } });

    expect(shape(wrapper)).toEqual([
      { child: "ROUTER-LINK-STUB", childClass: "vc-breadcrumbs__link", to: "/", text: "Home", hidden: null },
      { child: "SPAN", childClass: "vc-breadcrumbs__slash", to: null, text: "/", hidden: "true" },
      { child: null, childClass: null, to: null, text: "Hub", hidden: null },
      { child: "SPAN", childClass: "vc-breadcrumbs__slash", to: null, text: "/", hidden: "true" },
      { child: null, childClass: null, to: null, text: "Orders", hidden: null },
    ]);
  });

  it("keeps the separators out of the list assistive technology reads, item and glyph alike", () => {
    const wrapper = createWrapper({ props: { items: ITEMS } });

    const exposed = wrapper.findAll("li.vc-breadcrumbs__item").filter((li) => li.attributes("aria-hidden") !== "true");

    expect(exposed.map((li) => li.text())).toEqual(["Home", "Hub", "Orders"]);
    expect(exposed.some((li) => li.find(".vc-breadcrumbs__slash").exists())).toBe(false);
  });
});
