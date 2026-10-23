import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h, inject, ref } from "vue";
import { vcPopoverKey } from "@/ui-kit/components/molecules/popover/vc-popover-context";
import { usePopoverHostTeleport } from "@/ui-kit/composables";
import type { MaybeRefOrGetter } from "vue";

function mountWithContext(enabled?: MaybeRefOrGetter<boolean>) {
  let context: VcPopoverContextType | null = null;

  const Child = defineComponent({
    setup() {
      context = inject(vcPopoverKey, null);
      return () => h("span");
    },
  });

  const Parent = defineComponent({
    setup() {
      usePopoverHostTeleport(enabled);
      return () => h(Child);
    },
  });

  mount(Parent);

  return () => context?.enableTeleport.value;
}

function addPopoverHost(): void {
  const host = document.createElement("div");
  host.id = "popover-host";
  document.body.appendChild(host);
}

describe("usePopoverHostTeleport", () => {
  afterEach(() => {
    document.getElementById("popover-host")?.remove();
  });

  it("keeps popovers in place when the app has no popover host", () => {
    const enableTeleport = mountWithContext();

    expect(enableTeleport()).toBe(false);
  });

  it("teleports popovers into the popover host once mounted", () => {
    addPopoverHost();

    const enableTeleport = mountWithContext();

    expect(enableTeleport()).toBe(true);
  });

  it("follows the enabled flag", () => {
    addPopoverHost();
    const enabled = ref(false);

    const enableTeleport = mountWithContext(enabled);

    expect(enableTeleport()).toBe(false);

    enabled.value = true;

    expect(enableTeleport()).toBe(true);
  });
});
