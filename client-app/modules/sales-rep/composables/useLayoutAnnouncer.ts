import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { getBlock } from "../layout/registry";
import type { KeyboardSortSignalType, SalesRepLayoutScopeType } from "../types/layout";

/**
 * Turns keyboard-sort signals into localized text for an `aria-live` region.
 *
 * Grab-and-move is invisible without it: a sighted pointer user sees the block follow the cursor,
 * whereas a keyboard user has only the announcement to tell them what moved and where it landed.
 */
export function useLayoutAnnouncer(scope: SalesRepLayoutScopeType) {
  const { t } = useI18n();
  const message = ref("");

  function announce(signal: KeyboardSortSignalType): void {
    const block = getBlock(scope, signal.id);
    const title = block ? t(block.titleKey) : signal.id;

    switch (signal.kind) {
      case "grabbed":
      case "moved":
      case "dropped":
        message.value = t(
          // The grab announcement is the only place the arrow keys are spelled out, so the stat row
          // gets its own wording — there, up and down hide and restore rather than move.
          signal.kind === "grabbed" && signal.parkable
            ? "sales_rep.hub.layout.a11y.grabbed_parkable"
            : `sales_rep.hub.layout.a11y.${signal.kind}`,
          {
            title,
            // Signals carry array indices; announcements are read by people, so they count from one.
            position: signal.index + 1,
            total: signal.total,
          },
        );
        break;
      default:
        message.value = t(`sales_rep.hub.layout.a11y.${signal.kind}`, { title });
    }
  }

  return { message, announce };
}
