import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import { SaveChangesModal } from "@/shared/common";
import { useModal } from "@/shared/modal";
import type { Ref } from "vue";

interface IUseUnsavedLayoutGuardOptions {
  editing: Ref<boolean>;
  save: () => Promise<boolean>;
  cancel: () => void;
}

/**
 * Ask before walking away from an unsaved arrangement, as the quote and list pages do.
 *
 * `onBeforeRouteUpdate` matters as much as the leave hook: the customer profile keeps the same route
 * across customers, so without it an edit session followed the rep from one customer to the next.
 */
export function useUnsavedLayoutGuard(options: IUseUnsavedLayoutGuardOptions): void {
  const { t } = useI18n();
  const { openModal, closeModal } = useModal();

  async function canChangeRoute(): Promise<boolean> {
    if (!options.editing.value) {
      return true;
    }

    return await new Promise<boolean>((resolve) => {
      openModal({
        component: SaveChangesModal,
        props: {
          title: t("sales_rep.hub.layout.editing"),
          message: t("common.messages.save_changes"),
          onConfirm: async () => {
            closeModal();
            await options.save();
            resolve(true);
          },
          onClose: () => {
            // Leaving without saving: drop the draft so it cannot resurface on the next surface.
            options.cancel();
            resolve(true);
          },
        },
      });
    });
  }

  onBeforeRouteLeave(canChangeRoute);
  onBeforeRouteUpdate(canChangeRoute);
}
