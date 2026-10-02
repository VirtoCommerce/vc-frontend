import { nextTick } from "vue";

/** Edit mode ends with the bar unmounting, taking focus with it. */
export function focusEditToggle(): void {
  void nextTick(() => {
    document.querySelector<HTMLElement>("[data-layout-edit-toggle]")?.focus({ preventScroll: true });
  });
}

/** Starting a save makes the wrapper `inert`, blurring Save to `<body>`; on failure nothing reclaims it. */
export function focusSaveButton(): void {
  void nextTick(() => {
    document.querySelector<HTMLElement>("[data-layout-save]")?.focus({ preventScroll: true });
  });
}

/**
 * Hiding, parking or restoring unmounts a block's control and mounts another elsewhere, dropping focus
 * to `<body>`. A block always has exactly one control, so focus can follow it. `preventScroll` because
 * a pointer drop lands here too. Only from `<body>`: a park undone because the user tabbed or clicked
 * away must leave focus where they put it.
 */
export function focusBlockControl(id: string): void {
  void nextTick(() => {
    if (document.activeElement && document.activeElement !== document.body) {
      return;
    }

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
