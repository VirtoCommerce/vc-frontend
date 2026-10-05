import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";
import { h, nextTick } from "vue";
import { describeScrollBox as describeBox } from "@/core/utilities/tests";
import VcScrollbar from "./vc-scrollbar.vue";

// jsdom ships MutationObserver but not ResizeObserver, and useResizeObserver constructs one on
// mount. Only the mutation path is exercised below, so a no-op is enough.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);

enableAutoUnmount(afterEach);

// The observers behind the content check are debounced by 100 ms.
const CONTENT_DEBOUNCE_MS = 100;

async function afterContentSettles() {
  await new Promise((resolve) => setTimeout(resolve, CONTENT_DEBOUNCE_MS + 60));
}

function mountScrollbar(rows: number) {
  return mount(VcScrollbar, {
    attachTo: document.body,
    props: { vertical: true },
    slots: { default: () => Array.from({ length: rows }, (_, index) => h("p", `row ${index}`)) },
  });
}

describe("VcScrollbar", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  describe("edge events", () => {
    // Content that fits never scrolls, so a reach-bottom pager would stall on page one.
    it("reports the bottom on mount when the content fits", async () => {
      const wrapper = mountScrollbar(1);

      describeBox(wrapper.element as HTMLElement, { clientHeight: 400, scrollHeight: 400, scrollTop: 0 });
      await nextTick();
      await afterContentSettles();

      expect(wrapper.emitted("reachBottom")).toHaveLength(1);
    });

    // A collapsed axis measures 0 and so scores as sitting at both of its edges: a closed popover
    // (VcPopover renders content eagerly and hides it with display:none), a `max-height: 0`
    // region, a squeezed flex item. One collapsed axis is enough to make the numbers meaningless.
    it.each([
      ["no box at all", undefined],
      ["a height-collapsed region", { clientHeight: 0, scrollHeight: 0, scrollTop: 0, clientWidth: 300 }],
      ["a width-collapsed region", { clientHeight: 400, scrollHeight: 400, scrollTop: 0, clientWidth: 0 }],
    ])("says nothing about the edges of %s", async (_label, box) => {
      const wrapper = mount(VcScrollbar, {
        attachTo: document.body,
        props: { vertical: true, horizontal: true },
        slots: { default: () => h("p", "row") },
      });

      if (box) {
        describeBox(wrapper.element as HTMLElement, box);
      }

      await nextTick();
      await afterContentSettles();

      expect(wrapper.emitted("reachBottom")).toBeUndefined();
      expect(wrapper.emitted("reachRight")).toBeUndefined();
    });

    // A gated axis must not latch as "arrived": enabling it later has to announce its edge.
    it("announces the bottom when the vertical axis is turned on after mount", async () => {
      const wrapper = mount(VcScrollbar, {
        attachTo: document.body,
        props: { vertical: false, horizontal: true },
        slots: { default: () => h("p", "row") },
      });

      describeBox(wrapper.element as HTMLElement, { clientHeight: 400, scrollHeight: 400, scrollTop: 0 });
      await afterContentSettles();

      expect(wrapper.emitted("reachBottom")).toBeUndefined();

      await wrapper.setProps({ vertical: true });
      await afterContentSettles();

      expect(wrapper.emitted("reachBottom")).toHaveLength(1);
    });

    // A loaded page moves the bottom edge without any scroll.
    it("re-arms the bottom when content is appended below the viewport", async () => {
      const wrapper = mountScrollbar(1);
      const element = wrapper.element as HTMLElement;

      describeBox(element, { clientHeight: 100, scrollHeight: 100, scrollTop: 0 });
      await afterContentSettles();

      expect(wrapper.emitted("reachBottom")).toHaveLength(1);

      // a page arrives: the box is taller now, and nothing scrolled
      describeBox(element, { clientHeight: 100, scrollHeight: 500, scrollTop: 0 });
      element.appendChild(document.createElement("p"));
      await afterContentSettles();

      // no second emit — the bottom is no longer under the viewport
      expect(wrapper.emitted("reachBottom")).toHaveLength(1);

      // scrolling down to it emits again, which the latch would have swallowed before
      describeBox(element, { clientHeight: 100, scrollHeight: 500, scrollTop: 400 });
      element.dispatchEvent(new Event("scroll"));
      await nextTick();

      expect(wrapper.emitted("reachBottom")).toHaveLength(2);
    });

    // An axis without overflow:auto sits at both edges by definition, so it announces nothing.
    it.each([
      ["a horizontal-only scrollbar", { horizontal: true }],
      ["a disabled scrollbar", { vertical: true, disabled: true }],
      ["a scrollbar with no axis turned on", {}],
    ])("stays quiet about the bottom on %s", async (_label, props) => {
      const wrapper = mount(VcScrollbar, {
        attachTo: document.body,
        props,
        slots: { default: () => h("p", "row") },
      });

      describeBox(wrapper.element as HTMLElement, { clientHeight: 400, scrollHeight: 400, scrollTop: 0 });
      await afterContentSettles();

      expect(wrapper.emitted("reachBottom")).toBeUndefined();
    });

    it("does not repeat while the viewport stays at the bottom", async () => {
      const wrapper = mountScrollbar(1);
      const element = wrapper.element as HTMLElement;

      describeBox(element, { clientHeight: 100, scrollHeight: 100, scrollTop: 0 });
      await afterContentSettles();

      expect(wrapper.emitted("reachBottom")).toHaveLength(1);

      // A second measurement has to be provoked, or this asserts nothing: describeBox is not a
      // mutation and the ResizeObserver is stubbed, so without this the check never runs again and
      // the test stays green even with the latch deleted. An attribute is watched but is not
      // growth, which is exactly the "nothing arrived" case.
      element.firstElementChild?.setAttribute("role", "none");
      await afterContentSettles();

      expect(wrapper.emitted("reachBottom")).toHaveLength(1);
    });

    it("still emits from a real scroll", async () => {
      const wrapper = mountScrollbar(20);
      const element = wrapper.element as HTMLElement;

      describeBox(element, { clientHeight: 100, scrollHeight: 500, scrollTop: 0 });
      await afterContentSettles();

      expect(wrapper.emitted("reachBottom")).toBeUndefined();

      describeBox(element, { clientHeight: 100, scrollHeight: 500, scrollTop: 400 });
      element.dispatchEvent(new Event("scroll"));
      await nextTick();

      expect(wrapper.emitted("reachBottom")).toHaveLength(1);
    });

    // `scroll` reports a position, so only an actual scroll emits it.
    it("emits the scroll payload only when something actually scrolled", async () => {
      const wrapper = mountScrollbar(1);
      const element = wrapper.element as HTMLElement;

      describeBox(element, { clientHeight: 100, scrollHeight: 100, scrollTop: 0 });
      await afterContentSettles();

      expect(wrapper.emitted("scroll")).toBeUndefined();

      element.dispatchEvent(new Event("scroll"));
      await nextTick();

      expect(wrapper.emitted("scroll")).toHaveLength(1);
      expect(wrapper.emitted("scroll")?.[0][0]).toMatchObject({ isAtBottom: true, isAtTop: true });
    });
  });

  describe("auto tab stop", () => {
    async function mountOverflowing(slot: () => unknown, props: Record<string, unknown> = {}) {
      const wrapper = mount(VcScrollbar, {
        attachTo: document.body,
        props: { vertical: true, ...props },
        slots: { default: slot },
      });

      describeBox(wrapper.element as HTMLElement, { clientHeight: 100, scrollHeight: 500, scrollTop: 0 });
      await afterContentSettles();

      return wrapper;
    }

    it("makes an overflowing region with nothing focusable in it keyboard-reachable", async () => {
      const wrapper = await mountOverflowing(() => h("p", "row"));

      expect(wrapper.attributes("tabindex")).toBe("0");
    });

    // The listbox owns the keyboard entry (aria-activedescendant) whether its role is on the
    // region or inside it.
    it.each([
      ["on the region itself", () => h("p", "row"), { role: "listbox" }],
      ["on a list inside it", () => h("ul", { role: "listbox" }, [h("li", { role: "option" }, "row")]), {}],
      [
        "on a list of buttons taken out of the tab order",
        () => h("ul", { role: "listbox" }, [h("button", { role: "option", tabindex: -1 }, "row")]),
        {},
      ],
    ])("keeps the region out of the tab order when the listbox role sits %s", async (_label, slot, props) => {
      const wrapper = await mountOverflowing(slot, props);

      expect(wrapper.attributes("tabindex")).toBe("-1");
    });

    // A popup's list is measured a debounce after it opens; the -1 must already be there.
    it("keeps a listbox region out of the tab order before it overflows", async () => {
      const wrapper = mount(VcScrollbar, {
        attachTo: document.body,
        props: { vertical: true },
        slots: { default: () => h("ul", { role: "listbox" }, [h("li", { role: "option" }, "row")]) },
      });

      describeBox(wrapper.element as HTMLElement, { clientHeight: 0, scrollHeight: 0, scrollTop: 0 });
      await afterContentSettles();

      expect(wrapper.attributes("tabindex")).toBe("-1");
    });

    it("leaves a region that fits and holds no interactive role without a tabindex", async () => {
      const wrapper = mount(VcScrollbar, {
        attachTo: document.body,
        props: { vertical: true },
        slots: { default: () => h("p", "row") },
      });

      describeBox(wrapper.element as HTMLElement, { clientHeight: 100, scrollHeight: 100, scrollTop: 0 });
      await afterContentSettles();

      expect(wrapper.attributes("tabindex")).toBeUndefined();
    });

    // Focusable content keeps the browser from making the region a tab stop, so it needs no -1.
    it("leaves an overflowing listbox with a focusable descendant without a tabindex", async () => {
      const wrapper = await mountOverflowing(() =>
        h("ul", { role: "listbox", tabindex: 0 }, [h("li", { role: "option" }, "row")]),
      );

      expect(wrapper.attributes("tabindex")).toBeUndefined();
    });

    describe("a press on a region kept out of the Tab order", () => {
      const listbox = () => h("ul", { role: "listbox" }, [h("li", { role: "option", class: "row" }, "row")]);

      function press(target: Element, button = 0): MouseEvent {
        const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true, button });
        target.dispatchEvent(event);

        return event;
      }

      it("does not focus the region when its own area is pressed", async () => {
        const wrapper = await mountOverflowing(listbox);

        expect(press(wrapper.get(".row").element).defaultPrevented).toBe(true);
      });

      it("leaves a press on a focusable descendant alone", async () => {
        const wrapper = await mountOverflowing(() =>
          h("ul", { role: "listbox" }, [h("button", { role: "option", tabindex: -1, class: "row" }, "row")]),
        );

        expect(press(wrapper.get(".row").element).defaultPrevented).toBe(false);
      });

      it("leaves a press alone on a region that is a tab stop", async () => {
        const wrapper = await mountOverflowing(listbox, { focusable: true });

        expect(press(wrapper.get(".row").element).defaultPrevented).toBe(false);
      });

      it("does not focus the region when its padding is pressed", async () => {
        const wrapper = await mountOverflowing(listbox);

        expect(press(wrapper.element).defaultPrevented).toBe(true);
      });

      // Middle-click autoscroll is the browser's; a right press would still take focus.
      it("leaves the middle button alone and still guards the right one", async () => {
        const wrapper = await mountOverflowing(listbox);

        expect(press(wrapper.get(".row").element, 1).defaultPrevented).toBe(false);
        expect(press(wrapper.get(".row").element, 2).defaultPrevented).toBe(true);
      });

      it("leaves text beside the interactive container selectable", async () => {
        const wrapper = await mountOverflowing(() => [h("p", { class: "note" }, "note"), listbox()]);

        expect(press(wrapper.get(".note").element).defaultPrevented).toBe(false);
      });

      // Only a container inside the region counts; an outer menu around it does not.
      it("leaves text beside the container selectable inside an outer interactive container", async () => {
        const outer = document.createElement("div");
        outer.setAttribute("role", "menu");
        document.body.appendChild(outer);
        onTestFinished(() => outer.remove());

        const wrapper = mount(VcScrollbar, {
          attachTo: outer,
          props: { vertical: true },
          slots: { default: () => [h("p", { class: "note" }, "note"), listbox()] },
        });

        describeBox(wrapper.element as HTMLElement, { clientHeight: 100, scrollHeight: 500, scrollTop: 0 });
        await afterContentSettles();

        expect(press(wrapper.get(".note").element).defaultPrevented).toBe(false);
      });

      // A consumer's own -1 (a menubar of links) is not the guard's to enforce.
      it("leaves a press alone on a region a consumer took out of the Tab order itself", async () => {
        const wrapper = mount(VcScrollbar, {
          attachTo: document.body,
          props: { vertical: true },
          attrs: { tabindex: "-1", role: "menubar" },
          slots: { default: () => h("a", { href: "#", role: "menuitem" }, "link") },
        });

        describeBox(wrapper.element as HTMLElement, { clientHeight: 100, scrollHeight: 500, scrollTop: 0 });
        await afterContentSettles();

        expect(press(wrapper.element).defaultPrevented).toBe(false);
      });

      it("leaves a press alone on a region a consumer made a tab stop", async () => {
        const wrapper = mount(VcScrollbar, {
          attachTo: document.body,
          props: { vertical: true },
          attrs: { tabindex: "0" },
          slots: { default: listbox },
        });

        describeBox(wrapper.element as HTMLElement, { clientHeight: 100, scrollHeight: 500, scrollTop: 0 });
        await afterContentSettles();

        expect(press(wrapper.get(".row").element).defaultPrevented).toBe(false);
      });

      it("leaves a press alone on a region without an interactive role", async () => {
        const wrapper = await mountOverflowing(() => h("p", { class: "row" }, "row"));

        expect(press(wrapper.get(".row").element).defaultPrevented).toBe(false);
      });
    });
  });
});
