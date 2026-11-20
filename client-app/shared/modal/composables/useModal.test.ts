import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { closeAllModals, useModal } from "./useModal";

describe("closeAllModals", () => {
  beforeEach(() => {
    const { closeModal, modalStack } = useModal();

    while (modalStack.value.length) {
      closeModal();
    }
  });

  it("closes every open modal", () => {
    const { openModal, modalStack } = useModal();
    openModal({ component: "VcConfirmationModal" });
    openModal({ component: "VcConfirmationModal" });

    closeAllModals();

    expect(modalStack.value).toHaveLength(0);
  });

  it("does not return focus to the element that opened a modal", async () => {
    const { openModal } = useModal();
    const trigger = document.createElement("button");
    document.body.append(trigger);
    const focus = vi.spyOn(trigger, "focus");
    openModal({ component: "VcConfirmationModal", triggerElement: trigger });

    closeAllModals();
    await nextTick();

    expect(focus).not.toHaveBeenCalled();
    trigger.remove();
  });
});
