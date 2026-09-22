import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref, useTemplateRef } from "vue";
import { useCatalogGridMotion } from "./useCatalogGridMotion";

type FakeAnimationType = Animation & { cancelled: boolean; keyframes: unknown; options: KeyframeAnimationOptions };

const animations: FakeAnimationType[] = [];
let reduced = false;

vi.mock("@vueuse/core", () => ({ useMediaQuery: () => ref(reduced) }));

// jsdom implements neither Web Animations nor getAnimations, so the element carries a stand-in that
// records what it was asked to play and whether anyone cancelled it.
function installFakeAnimations() {
  animations.length = 0;

  Element.prototype.animate = function animate(keyframes: unknown, options: KeyframeAnimationOptions) {
    const animation = {
      keyframes,
      options,
      cancelled: false,
      target: this,
      finished: Promise.resolve(),
      cancel(this: { cancelled: boolean }) {
        this.cancelled = true;
      },
    } as unknown as FakeAnimationType;

    animations.push(animation);
    return animation;
  };

  Element.prototype.getAnimations = function getAnimations() {
    return animations.filter((animation) => (animation as unknown as { target: Element }).target === this);
  };
}

function mountGrid(cards = 3) {
  const viewMode = ref<"grid" | "list">("grid");
  let api: ReturnType<typeof useCatalogGridMotion>;

  const wrapper = mount(
    defineComponent({
      setup() {
        const grid = useTemplateRef<HTMLElement>("grid");
        api = useCatalogGridMotion(grid, viewMode);
        return () =>
          h(
            "div",
            { ref: "grid" },
            Array.from({ length: cards }, (_, i) => h("article", { key: i }, `card ${i}`)),
          );
      },
    }),
    { attachTo: document.body },
  );

  return { wrapper, viewMode, api: api! };
}

describe("useCatalogGridMotion", () => {
  beforeEach(() => {
    reduced = false;
    installFakeAnimations();
  });

  it("raises every card, deepening the wave up to a dozen and no further", async () => {
    const { api } = mountGrid(20);
    animations.length = 0;

    await api.enter();

    expect(animations).toHaveLength(20);
    expect(animations[0].options.delay).toBe(0);
    expect(animations[5].options.delay).toBe(200);
    expect(animations[12].options.delay).toBe(480);
    expect(animations[19].options.delay).toBe(480);
  });

  it("dims the grid before the new layout lands, not under the reader's eye", async () => {
    const { viewMode, api } = mountGrid();
    animations.length = 0;

    viewMode.value = "list";
    await flushPromises();

    // The grid dimmed first, and only then did what it renders catch up.
    expect(animations[0].options.duration).toBe(130);
    expect(api.displayedViewMode.value).toBe("list");
  });

  it("cancels the dimming rather than painting over it, because the grid element survives the change", async () => {
    const { viewMode, wrapper } = mountGrid();
    animations.length = 0;

    const before = wrapper.element;
    viewMode.value = "list";
    await flushPromises();

    expect(wrapper.element).toBe(before);
    // A filled animation beats an inline style: left alone it would strand the grid at zero opacity.
    expect(animations[0].cancelled).toBe(true);
  });

  it("clears a filled animation it has no handle on", async () => {
    const { wrapper, api } = mountGrid();
    animations.length = 0;

    // A CSS transition, or a fade started before this component was created on the same element:
    // nothing holds a reference to it, and left running it paints the grid out for good.
    const stray = wrapper.element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });

    await api.enter();

    expect((stray as unknown as { cancelled: boolean }).cancelled).toBe(true);
  });

  it("carries the depth in each card's own transform, so every card turns about its own axis", async () => {
    const { api } = mountGrid(4);
    animations.length = 0;

    await api.flip(() => {});

    // A `perspective` property on the grid would put one vanishing point at the grid's centre, and
    // a card in an outer column would turn as though watched from the side.
    const frames = animations.map((animation) => animation.keyframes as { transform: string }[]);
    expect(frames.every((frame) => frame.every((step) => step.transform.startsWith("perspective(1200px)")))).toBe(true);
    expect(frames[0][1].transform).toContain("rotateY(-90deg)");
  });

  it("switches the layout without moving anything when motion is not wanted", async () => {
    reduced = true;
    const { viewMode, api } = mountGrid();
    animations.length = 0;

    viewMode.value = "list";
    await flushPromises();
    await api.enter();

    expect(animations).toHaveLength(0);
    expect(api.displayedViewMode.value).toBe("list");
  });
});
