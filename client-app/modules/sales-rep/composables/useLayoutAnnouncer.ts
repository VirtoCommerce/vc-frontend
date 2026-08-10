import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useBlockTitle } from "./useBlockTitle";
import type { KeyboardSortSignalType, SalesRepLayoutScopeType } from "../types/layout";

const ZERO_WIDTH_SPACE = "\u200B";

/**
 * Localizes keyboard-sort signals for an `aria-live` region — the only feedback a keyboard user gets,
 * where a pointer user watches the block follow the cursor.
 */
export function useLayoutAnnouncer(scope: SalesRepLayoutScopeType) {
  const { t } = useI18n();
  const { titleOf } = useBlockTitle(scope);
  const message = ref("");

  // An `aria-live` region is only read when its content changes, so the same words twice running
  // would be silent the second time. An alternating zero-width space differs without being spoken.
  function say(text: string): void {
    const marked = message.value.endsWith(ZERO_WIDTH_SPACE);
    const spoken = marked ? message.value.slice(0, -1) : message.value;

    // Toggle the marker rather than only ever adding it, or the third repeat would match the second
    // and go silent again.
    message.value = spoken !== text || marked ? text : `${text}${ZERO_WIDTH_SPACE}`;
  }

  function announce(signal: KeyboardSortSignalType): void {
    const title = titleOf(signal.id);

    switch (signal.kind) {
      case "grabbed":
      case "moved":
      case "dropped":
      case "edge":
        say(
          t(
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
          ),
        );
        break;
      default:
        say(t(`sales_rep.hub.layout.a11y.${signal.kind}`, { title }));
    }
  }

  return { message, announce, say };
}
