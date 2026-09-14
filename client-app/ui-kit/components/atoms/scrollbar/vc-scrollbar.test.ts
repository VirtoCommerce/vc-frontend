import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
    // Контент, который помещается целиком, не рождает ни одного события прокрутки. Потребитель,
    // подгружающий страницы по reach-bottom, застревал бы на первой навсегда.
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

    // Защёлка гейтнутой оси не должна доезжать до "уже прибыли": VcTable включает оси пропсами,
    // и после включения ось обязана объявить свой край.
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

    // Дозагруженная страница двигает нижний край, но прокрутки при этом не происходит.
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

    // Ось без overflow:auto стоит у обоих своих краёв по определению — объявлять прибытие,
    // которого никто не может совершить, нечестно.
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

    // `scroll` описывает позицию, а не переход, поэтому его источник — только сама прокрутка.
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
});
