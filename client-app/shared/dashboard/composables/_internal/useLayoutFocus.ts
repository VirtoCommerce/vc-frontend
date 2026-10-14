import { nextTick } from "vue";

/**
 * Edit mode ends with the bar unmounting, taking focus with it. With every block hidden the toggle is gone
 * too, and the empty state's Edit layout button stands in for it — the two never render together.
 */
export function focusEditToggle(): void {
  void nextTick(() => {
    document
      .querySelector<HTMLElement>("[data-layout-edit-toggle], [data-layout-empty-edit]")
      ?.focus({ preventScroll: true });
  });
}

/**
 * The empty state's actions unmount it with their own button, and the edit toggle can sit a page below.
 * The surface's start is where the user goes next: the restored blocks, or the edit bar. No `preventScroll`,
 * so it comes into view if the user had scrolled.
 */
export function focusSurfaceStart(): void {
  void nextTick(() => {
    document.querySelector<HTMLElement>("[data-layout-surface]")?.focus();
  });
}

/**
 * Starting a save makes the wrapper `inert`, blurring Save to `<body>`; on failure nothing reclaims it.
 * No `preventScroll`: a failed restore mounts the edit bar above where Restore was, possibly off screen.
 */
export function focusSaveButton(): void {
  void nextTick(() => {
    document.querySelector<HTMLElement>("[data-layout-save]")?.focus();
  });
}

/**
 * Hiding, parking or restoring unmounts a block's control and mounts another elsewhere, dropping focus
 * to `<body>`. A block always has exactly one control, so focus can follow it. `preventScroll` because
 * a pointer drop lands here too.
 */
export function focusBlockControl(id: string): void {
  void nextTick(() => {
    const selectors = [
      `[data-block-id="${id}"] .layout-widget__handle`,
      `[data-block-id="${id}"][role="button"]`,
      `[data-restore-id="${id}"]`,
    ];

    for (const selector of selectors) {
      const control = document.querySelector<HTMLElement>(selector);
      if (control) {
        control.focus({ preventScroll: true });
        return;
      }
    }
  });
}
