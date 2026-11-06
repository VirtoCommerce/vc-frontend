import { nextTick, toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";

/**
 * Focus moves for one layout surface, each made after the next render. They look only inside the surface's
 * root, so two surfaces on a page, or two dashboards with a block id in common, never take focus from each other.
 */
export function useLayoutFocus(root: MaybeRefOrGetter<HTMLElement | null | undefined>) {
  /** Focuses the first element any of the selectors finds in the surface, in the order given. */
  function focusFirst(selectors: readonly string[], options?: FocusOptions): void {
    void nextTick(() => {
      const surface = toValue(root);
      for (const selector of selectors) {
        const target = surface?.querySelector<HTMLElement>(selector);
        if (target) {
          target.focus(options);
          return;
        }
      }
    });
  }

  /**
   * Edit mode ends with the bar unmounting, taking focus with it. With every block hidden the toggle is gone
   * too, and the empty state's Edit layout button stands in for it — the two never render together.
   */
  function focusEditToggle(): void {
    focusFirst(["[data-layout-edit-toggle], [data-layout-empty-edit]"], { preventScroll: true });
  }

  /**
   * The empty state's actions unmount it with their own button, and the edit toggle can sit a page below.
   * The surface's start is where the user goes next: the restored blocks, or the edit bar. No `preventScroll`,
   * so it comes into view if the user had scrolled.
   */
  function focusSurfaceStart(): void {
    void nextTick(() => toValue(root)?.focus());
  }

  /**
   * Starting a save makes the wrapper `inert`, blurring Save to `<body>`; on failure nothing reclaims it.
   * No `preventScroll`: a failed restore mounts the edit bar above where Restore was, possibly off screen.
   */
  function focusSaveButton(): void {
    focusFirst(["[data-layout-save]"]);
  }

  /**
   * Hiding, parking or restoring unmounts a block's control and mounts another elsewhere, dropping focus
   * to `<body>`. A block always has exactly one control, so focus can follow it. `preventScroll` because
   * a pointer drop lands here too.
   */
  function focusBlockControl(id: string): void {
    focusFirst(
      [
        `[data-block-id="${id}"] .layout-widget__handle`,
        `[data-block-id="${id}"][role="button"]`,
        `[data-restore-id="${id}"]`,
      ],
      { preventScroll: true },
    );
  }

  return { focusEditToggle, focusSurfaceStart, focusSaveButton, focusBlockControl };
}
