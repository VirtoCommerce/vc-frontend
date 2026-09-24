import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { VcTabSwitch, VcTabSwitchGroup } from "@/ui-kit/components/molecules";

const CHECKED = "vc-tab-switch--checked";

// jsdom has no layout: every rect is zero, so the indicator's ARITHMETIC cannot be exercised here.
// What is testable is the contract around it — the group's markup, and that it survives a run in an
// environment with neither layout nor Web Animations, which is exactly where these tests execute.
function mountGroup(props: Record<string, unknown> = {}, selected = "grid") {
  return mount(VcTabSwitchGroup, {
    props,
    slots: {
      default: [
        `<VcTabSwitch value="grid" label="Grid" model-value="${selected}" />`,
        `<VcTabSwitch value="list" label="List" model-value="${selected}" />`,
      ].join(""),
    },
    global: {
      components: { VcTabSwitch },
      stubs: { VcIcon: true },
    },
  });
}

describe("VcTabSwitchGroup", () => {
  // A `fieldset` IS the group role, so the group is asserted through the element rather than through
  // a `role` attribute — and the attribute must stay ABSENT, or it is being restated redundantly.
  it("groups the switches for assistive technology", () => {
    const wrapper = mountGroup({ ariaLabel: "View mode" });

    expect(wrapper.element.tagName).toBe("FIELDSET");
    expect(wrapper.attributes("role")).toBeUndefined();
    expect(wrapper.attributes("aria-label")).toBe("View mode");
  });

  it("renders the switches it was given", () => {
    const wrapper = mountGroup();

    expect(wrapper.findAllComponents(VcTabSwitch)).toHaveLength(2);
  });

  describe("variant", () => {
    it("is plain unless asked otherwise", () => {
      expect(mountGroup().classes()).toContain("vc-tab-switch-group--plain");
    });

    it.each(["filled", "filled-strong", "seg"])("carries the %s modifier", (variant) => {
      expect(mountGroup({ variant }).classes()).toContain(`vc-tab-switch-group--${variant}`);
    });
  });

  it("stretches to equal columns only when asked", () => {
    expect(mountGroup().classes()).not.toContain("vc-tab-switch-group--fill");
    expect(mountGroup({ fill: true }).classes()).toContain("vc-tab-switch-group--fill");
  });

  // The indicator is decorative and duplicates the state the switches already announce.
  it("hides the indicator from assistive technology", () => {
    expect(mountGroup().get(".vc-tab-switch-group__pill").attributes("aria-hidden")).toBe("true");
  });

  describe("the indicator", () => {
    it("does not reach for Web Animations when the environment has none", () => {
      // jsdom provides no Element.animate; the guard is what keeps this from throwing on mount.
      expect(() => mountGroup({ variant: "seg" })).not.toThrow();
    });

    it("leaves the indicator hidden while nothing is selected", () => {
      const wrapper = mountGroup({ variant: "seg" }, "neither");

      expect(wrapper.get(".vc-tab-switch-group__pill").attributes("style")).toContain("opacity: 0");
    });

    it("does not measure before the group has been laid out", () => {
      // Zero-width box = not in flow yet. Measuring now would pin the indicator at zero and then
      // animate away from a position it never actually had.
      const wrapper = mountGroup({ variant: "seg" });
      const pill = wrapper.get(".vc-tab-switch-group__pill").element as HTMLElement;

      expect(pill.style.left).toBe("");
      expect(pill.style.width).toBe("");
    });
  });

  it("moves the indicator when the selection changes, and animates only once it has somewhere to come from", async () => {
    // The checked class landing on a switch is the whole signal, so the test moves it by hand. The
    // layout jsdom cannot produce is faked: a 200px track of two 100px halves.
    const animate = vi.fn();
    const wrapper = mountGroup({ variant: "seg" });
    const pill = wrapper.get(".vc-tab-switch-group__pill").element as HTMLElement;
    const [first, second] = wrapper.findAllComponents(VcTabSwitch).map((item) => item.element as HTMLElement);

    pill.animate = animate;
    vi.spyOn(wrapper.element, "getBoundingClientRect").mockReturnValue({ left: 0, width: 200 });
    vi.spyOn(first, "getBoundingClientRect").mockReturnValue({ left: 0, width: 100 } as DOMRect);
    vi.spyOn(second, "getBoundingClientRect").mockReturnValue({ left: 100, width: 100 } as DOMRect);

    // The first measurement that succeeds places the indicator without travelling to it.
    first.classList.remove(CHECKED);
    await flushPromises();
    first.classList.add(CHECKED);
    await flushPromises();

    expect(pill.style.left).toBe("0px");
    expect(pill.style.width).toBe("100px");
    expect(pill.style.opacity).toBe("1");
    expect(animate).not.toHaveBeenCalled();

    first.classList.remove(CHECKED);
    second.classList.add(CHECKED);
    await flushPromises();

    expect(pill.style.left).toBe("100px");
    expect(pill.style.width).toBe("100px");
    expect(animate).toHaveBeenCalledTimes(1);

    // Stretch across both seats at the middle keyframe, then gather on the new one.
    const [keyframes] = animate.mock.calls[0] as [Keyframe[]];
    expect(keyframes).toEqual([
      { left: "0px", width: "100px" },
      { left: "0px", width: "200px", offset: 0.42 },
      { left: "100px", width: "100px" },
    ]);
  });

  it("hides the indicator again when nothing is checked", async () => {
    const wrapper = mountGroup({ variant: "seg" });
    const pill = wrapper.get(".vc-tab-switch-group__pill").element as HTMLElement;
    const [first] = wrapper.findAllComponents(VcTabSwitch).map((item) => item.element as HTMLElement);

    vi.spyOn(wrapper.element, "getBoundingClientRect").mockReturnValue({ left: 0, width: 200 });
    vi.spyOn(first, "getBoundingClientRect").mockReturnValue({ left: 0, width: 100 } as DOMRect);

    first.classList.remove(CHECKED);
    await flushPromises();
    first.classList.add(CHECKED);
    await flushPromises();
    expect(pill.style.opacity).toBe("1");

    first.classList.remove(CHECKED);
    await flushPromises();

    expect(pill.style.opacity).toBe("0");
  });
});
