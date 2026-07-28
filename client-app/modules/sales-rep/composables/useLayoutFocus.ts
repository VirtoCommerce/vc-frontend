import { nextTick } from "vue";

/**
 * Send focus back to the edit toggle when edit mode ends. The edit bar unmounts with it, so focus was
 * sitting on a button that no longer exists and would otherwise fall to the top of the page.
 */
export function focusEditToggle(): void {
  void nextTick(() => {
    document.querySelector<HTMLElement>("[data-layout-edit-toggle]")?.focus({ preventScroll: true });
  });
}

/**
 * Hiding, parking or restoring a block unmounts its control and mounts a new one elsewhere, which
 * drops focus to `<body>`. Focus follows the block instead: its region is fixed, so there is always
 * exactly one control representing it — a widget's drag handle, a stat card, or its restore button
 * once it moves to the hidden tray.
 *
 * `preventScroll` because a pointer drop lands here too, and yanking the viewport after a mouse drag
 * is not what the rep asked for.
 */
export function focusBlockControl(id: string): void {
  void nextTick(() => {
    const selectors = [
      `[data-block-id="${id}"] .layout-block__handle`,
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
