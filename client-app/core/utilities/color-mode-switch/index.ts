const SWITCHING_CLASS = "color-mode-switching";

let current: object | null = null;

export interface IColorModeSwitchOrigin {
  x: number;
  y: number;
}

/**
 * Swaps the colour mode behind a circular reveal growing out of `origin` — the control that
 * was pressed — instead of repainting the page in a single frame. The palette is ~400 custom
 * properties changing at once on `html.dark`, which no CSS transition can carry; the View
 * Transitions API can, because it animates a snapshot of the page rather than its properties.
 * Browsers without the API, and anyone asking for reduced motion, keep the instant swap.
 */
export function switchColorMode(apply: () => void, origin?: IColorModeSwitchOrigin | null): void {
  const root = document.documentElement;

  if (typeof document.startViewTransition !== "function" || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;

  root.style.setProperty("--color-mode-switch-x", `${x}px`);
  root.style.setProperty("--color-mode-switch-y", `${y}px`);
  // To the far corner, not half the diagonal: a control in the corner of the header is the
  // usual origin, and the circle still has to clear the opposite corner of the viewport.
  root.style.setProperty(
    "--color-mode-switch-radius",
    `${Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))}px`,
  );
  root.classList.add(SWITCHING_CLASS);

  // A second switch started before this one ends takes the class over: the browser skips the
  // running transition, and its cleanup would otherwise strip the new one's styles mid-flight.
  const token = {};
  current = token;

  void document
    .startViewTransition(apply)
    .finished.finally(() => {
      if (current === token) {
        current = null;
        root.classList.remove(SWITCHING_CLASS);
      }
    })
    .catch(() => {});
}
