import { mount, RouterLinkStub } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import VcRecordCard from "./vc-record-card.vue";
import type { ComponentMountingOptions } from "@vue/test-utils";

function mountCard(options: ComponentMountingOptions<typeof VcRecordCard> = {}) {
  return mount(VcRecordCard, {
    ...options,
    global: {
      stubs: {
        VcIcon: true,
        VcDropdownMenu: true,
        VcButton: true,
        VcBadge: { name: "VcBadge", template: "<span><slot /></span>" },
        RouterLink: RouterLinkStub,
      },
      mocks: { $t: (key: string) => key },
    },
  });
}

describe("VcRecordCard", () => {
  it("renders the title as text when there is no link target", () => {
    const wrapper = mountCard({ props: { title: "Priya Raman" } });

    expect(wrapper.text()).toContain("Priya Raman");
    expect(wrapper.find("a").exists()).toBe(false);
    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false);
  });

  it("renders the title as a router link", () => {
    const wrapper = mountCard({ props: { title: "10479", to: "/orders/1" } });
    const link = wrapper.findComponent(RouterLinkStub);

    expect(link.props("to")).toBe("/orders/1");
    expect(link.text()).toBe("10479");
  });

  it("adds rel to an external link opened in a new tab", () => {
    const wrapper = mountCard({ props: { title: "Docs", externalLink: "https://example.com", target: "_blank" } });
    const link = wrapper.find("a");

    expect(link.attributes("href")).toBe("https://example.com");
    expect(link.attributes("rel")).toBe("noopener noreferrer");
  });

  it("drops the link when disabled", () => {
    const wrapper = mountCard({ props: { title: "10479", to: "/orders/1", disabled: true } });

    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false);
    expect(wrapper.text()).toContain("10479");
  });

  it("emits titleClick only for a link title", async () => {
    const link = mountCard({ props: { title: "Docs", externalLink: "https://example.com" } });
    const text = mountCard({ props: { title: "Docs" } });

    await link.find("a").trigger("click");
    await text.find("span").trigger("click");

    expect(link.emitted("titleClick")).toHaveLength(1);
    expect(text.emitted("titleClick")).toBeUndefined();
  });

  it("renders the description and a zero metric", () => {
    const wrapper = mountCard({ props: { title: "A", description: "Paid by card", metric: 0 } });

    expect(wrapper.text()).toContain("Paid by card");
    expect(wrapper.text()).toContain("0");
  });

  it("renders a meta item per entry, with an icon only where one is set", () => {
    const wrapper = mountCard({
      props: { title: "A", meta: [{ icon: "clock", text: "2h ago" }, { text: "Credit card" }] },
    });

    expect(wrapper.text()).toContain("2h ago");
    expect(wrapper.text()).toContain("Credit card");
    expect(wrapper.findAllComponents({ name: "VcIcon" }).map((icon) => icon.attributes("name"))).toEqual(["clock"]);
  });

  it("renders the lead, status and default slots", () => {
    const wrapper = mountCard({
      props: { title: "A" },
      slots: {
        lead: '<span data-test-id="lead">PR</span>',
        default: '<p data-test-id="body">Message</p>',
        status: '<span data-test-id="status">Active</span>',
      },
    });

    expect(wrapper.find('[data-test-id="lead"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="body"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="status"]').exists()).toBe(true);
  });

  it("renders the initials avatar as the lead", () => {
    const wrapper = mountCard({ props: { title: "Priya Raman", initials: "PR" } });
    const avatar = wrapper.findComponent({ name: "VcBadge" });

    expect(avatar.exists()).toBe(true);
    expect(avatar.text()).toBe("PR");
  });

  it("lets the lead slot replace the initials avatar", () => {
    const wrapper = mountCard({
      props: { title: "A", initials: "PR" },
      slots: { lead: '<span data-test-id="dot"></span>' },
    });

    expect(wrapper.find('[data-test-id="dot"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: "VcBadge" }).exists()).toBe(false);
  });

  it("renders the menu only when menu content is passed", () => {
    expect(
      mountCard({ props: { title: "A" } })
        .findComponent({ name: "VcDropdownMenu" })
        .exists(),
    ).toBe(false);
    expect(
      mountCard({ props: { title: "A" }, slots: { menu: "<span>Edit</span>" } })
        .findComponent({ name: "VcDropdownMenu" })
        .exists(),
    ).toBe(true);
  });

  it("keeps clicks and Enter in the actions from reaching a card-level listener", async () => {
    const onClick = vi.fn();
    const onKeydown = vi.fn();
    const wrapper = mountCard({
      props: { title: "A" },
      attrs: { onClick, onKeydown },
      slots: { actions: '<button data-test-id="custom-action">Go</button>' },
    });
    const action = wrapper.find('[data-test-id="custom-action"]');

    await action.trigger("click");
    await action.trigger("keydown", { key: "Enter" });

    expect(onClick).not.toHaveBeenCalled();
    expect(onKeydown).not.toHaveBeenCalled();
  });

  it("renders custom actions in place of the menu", () => {
    const wrapper = mountCard({
      props: { title: "A" },
      slots: { actions: '<button data-test-id="custom-action">Go</button>', menu: "<span>Edit</span>" },
    });

    expect(wrapper.find('[data-test-id="custom-action"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: "VcDropdownMenu" }).exists()).toBe(false);
  });
});
