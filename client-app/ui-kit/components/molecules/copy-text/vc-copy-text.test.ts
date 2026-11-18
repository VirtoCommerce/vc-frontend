import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { uiKitOptionsKey } from "@/ui-kit/composables/useUiKitOptions";
import VcCopyText from "./vc-copy-text.vue";
import type { IUiKitOptions, VcNotificationsType } from "@/ui-kit/composables/useUiKitOptions";

const copy = vi.fn();

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useClipboard: () => ({ copy, isSupported: ref(true) }),
}));

function mountCopyText(options?: IUiKitOptions) {
  return mount(VcCopyText, {
    props: { text: "ORDER-42", notification: "Copied" },
    global: {
      provide: options ? { [uiKitOptionsKey]: options } : {},
      mocks: { $t: (key: string) => key },
      stubs: { VcButton: true },
    },
  });
}

describe("VcCopyText", () => {
  it("copies without a toast when the app passes no notifications", async () => {
    copy.mockClear();

    mountCopyText().findComponent({ name: "VcButton" }).vm.$emit("click");
    await vi.waitFor(() => expect(copy).toHaveBeenCalled());

    expect(copy).toHaveBeenCalledWith("ORDER-42");
  });

  it("shows the success toast through the app's notifications", async () => {
    const notifications: VcNotificationsType = { info: vi.fn(), success: vi.fn(), warning: vi.fn(), error: vi.fn() };

    mountCopyText({ notifications }).findComponent({ name: "VcButton" }).vm.$emit("click");
    await vi.waitFor(() => expect(notifications.success).toHaveBeenCalled());

    expect(notifications.success).toHaveBeenCalledWith({ text: "Copied", duration: 4000, single: true });
  });
});
