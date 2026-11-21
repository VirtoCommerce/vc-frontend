import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref, withDirectives } from "vue";
import { getBehaviorDirective } from "./index";
import type { CustomSectionDirectiveType, ICustomSectionBehavior } from "../types";

const HOOKS = ["mounted", "beforeUpdate", "updated", "beforeUnmount", "unmounted"] as const;

function createBehavior() {
  const calls: string[] = [];
  const directive = Object.fromEntries(
    HOOKS.map((hook) => [
      hook,
      vi.fn((_: HTMLElement, binding: { value?: string }) => calls.push(`${hook} ${binding.value}`)),
    ]),
  ) as CustomSectionDirectiveType;
  let resolveLoad: ((loaded: CustomSectionDirectiveType) => void) | undefined;
  const behavior: ICustomSectionBehavior = {
    description: "Test.",
    directive: () =>
      new Promise((resolve) => {
        resolveLoad = resolve;
      }),
  };

  return { behavior, calls, load: (): void => resolveLoad?.(directive) };
}

function mountWith(behavior: ICustomSectionBehavior) {
  const value = ref("a");
  const wrapper = mount(
    defineComponent({
      setup: () => () => withDirectives(h("div", value.value), [[getBehaviorDirective(behavior), value.value]]),
    }),
  );

  return { wrapper, value };
}

describe("a behavior's lazy directive", () => {
  it("forwards every hook once the behavior has loaded", async () => {
    const { behavior, calls, load } = createBehavior();
    const { wrapper, value } = mountWith(behavior);
    load();
    await flushPromises();

    value.value = "b";
    await nextTick();
    wrapper.unmount();

    expect(calls).toEqual(["mounted a", "beforeUpdate b", "updated b", "beforeUnmount b", "unmounted b"]);
  });

  it("mounts with the latest value when the behavior loads after its element", async () => {
    const { behavior, calls, load } = createBehavior();
    const { value } = mountWith(behavior);

    value.value = "b";
    await nextTick();
    load();
    await flushPromises();

    expect(calls).toEqual(["mounted b"]);
  });

  it("never mounts an element that unmounts before its behavior loads", async () => {
    const { behavior, calls, load } = createBehavior();
    const { wrapper } = mountWith(behavior);

    wrapper.unmount();
    load();
    await flushPromises();

    expect(calls).toEqual([]);
  });
});
