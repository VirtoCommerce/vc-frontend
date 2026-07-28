import { nextTick } from "vue";

/**
 * Hiding, parking or restoring a block unmounts its control and mounts a new one elsewhere, which
 * drops focus to `<body>`. Focus follows the block instead: its region is fixed, so there is always
 * exactly one control representing it — a widget's drag handle, a stat card, or its restore button
 * once it moves to the hidden tray.
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
        control.focus();
        return;
      }
    }
  });
}
