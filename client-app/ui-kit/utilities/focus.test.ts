import { afterEach, describe, expect, it, vi } from "vitest";
import { classifyShellFocusOut, shellFocusEntered, watchFocusLeavingOwnPopover } from "./focus";

// A shell whose calendar is teleported out of its subtree, plus an unrelated popover it does not own.
function buildDom(): void {
  document.body.innerHTML = `
    <fieldset id="shell">
      <input id="field" />
      <button id="trigger" aria-controls="own-popover"></button>
    </fieldset>
    <div id="own-popover" class="vc-popover__body"><div id="cell" tabindex="-1"></div></div>
    <div id="alien-popover" class="vc-popover__body"><div id="alien-cell" tabindex="-1"></div></div>
    <button id="outside"></button>
  `;
}

function el(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`no #${id}`);
  }
  return element;
}

// currentTarget only exists during dispatch, so every case goes through a real listener on the shell.
function onShell<T>(type: "focusin" | "focusout", read: (event: FocusEvent) => T, from: string, to: string | null): T {
  const shell = el("shell");
  let result: T | undefined;
  const listener = (event: Event): void => {
    result = read(event as FocusEvent);
  };
  shell.addEventListener(type, listener);
  el(from).dispatchEvent(new FocusEvent(type, { bubbles: true, relatedTarget: to ? el(to) : null }));
  shell.removeEventListener(type, listener);
  return result as T;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("classifyShellFocusOut", () => {
  it("reports a move between the shell's own controls as internal", () => {
    buildDom();
    expect(onShell("focusout", classifyShellFocusOut, "field", "trigger")).toBe("internal");
  });

  it("reports the shell's own popover, matched by aria-controls, as own-popover", () => {
    buildDom();
    expect(onShell("focusout", classifyShellFocusOut, "field", "cell")).toBe("own-popover");
  });

  it("reports another component's popover as a departure", () => {
    buildDom();
    expect(onShell("focusout", classifyShellFocusOut, "field", "alien-cell")).toBe("left");
  });

  it("reports focus lost to nothing as a departure", () => {
    buildDom();
    expect(onShell("focusout", classifyShellFocusOut, "field", null)).toBe("left");
  });
});

describe("shellFocusEntered", () => {
  it("is true when focus arrives from outside", () => {
    buildDom();
    expect(onShell("focusin", shellFocusEntered, "field", "outside")).toBe(true);
  });

  it("is false when focus only moves between the shell's own controls", () => {
    buildDom();
    expect(onShell("focusin", shellFocusEntered, "trigger", "field")).toBe(false);
  });

  it("is false on the return trip from the shell's own popover", () => {
    buildDom();
    expect(onShell("focusin", shellFocusEntered, "field", "cell")).toBe(false);
  });
});

describe("watchFocusLeavingOwnPopover", () => {
  function arm(): { onLeft: ReturnType<typeof vi.fn>; stop: () => void } {
    buildDom();
    const onLeft = vi.fn();
    const stop = onShell("focusout", (event) => watchFocusLeavingOwnPopover(event, onLeft), "field", "cell");
    return { onLeft, stop };
  }

  it("emits one blur when focus leaves the popover for the outside", () => {
    const { onLeft, stop } = arm();

    el("cell").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: el("outside") }));

    expect(onLeft).toHaveBeenCalledTimes(1);
    expect(onLeft.mock.calls[0][0]).toBeInstanceOf(FocusEvent);
    expect(onLeft.mock.calls[0][0].relatedTarget).toBe(el("outside"));
    stop();
  });

  // A click on non-focusable chrome loses focus to nothing while the PAGE keeps it — a real departure.
  // jsdom reports document.hasFocus() false for every document, so the browser's answer is stubbed in.
  it("emits a blur when focus is lost to nothing inside a focused page", () => {
    const { onLeft, stop } = arm();
    const hasFocus = vi.spyOn(document, "hasFocus").mockReturnValue(true);

    el("cell").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: null }));

    expect(onLeft).toHaveBeenCalledTimes(1);
    hasFocus.mockRestore();
    stop();
  });

  // Alt-Tab fires focusout with a null relatedTarget while focus stays put; reporting it would lie AND
  // burn the one-shot watch, so the real departure afterwards is what matters.
  it("stays quiet on a window switch and still reports the real departure afterwards", () => {
    const { onLeft, stop } = arm();
    const hasFocus = vi.spyOn(document, "hasFocus").mockReturnValue(false);

    el("cell").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: null }));
    expect(onLeft).not.toHaveBeenCalled();

    hasFocus.mockReturnValue(true);
    el("cell").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: el("outside") }));
    expect(onLeft).toHaveBeenCalledTimes(1);

    hasFocus.mockRestore();
    stop();
  });

  // Non-teleported split: the shell's own focusout listener already sees the departure bubble past.
  it("stands down when the popover renders inside the shell", () => {
    buildDom();
    el("shell").appendChild(el("own-popover"));
    const onLeft = vi.fn();
    const stop = onShell("focusout", (event) => watchFocusLeavingOwnPopover(event, onLeft), "field", "cell");

    el("cell").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: el("outside") }));

    expect(onLeft).not.toHaveBeenCalled();
    stop();
  });

  it("stays quiet while focus moves inside the popover", () => {
    const { onLeft, stop } = arm();

    el("cell").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: el("own-popover") }));
    expect(onLeft).not.toHaveBeenCalled();

    // Still armed: the real departure afterwards must be reported.
    el("cell").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: el("outside") }));
    expect(onLeft).toHaveBeenCalledTimes(1);
    stop();
  });

  it("stays quiet when focus returns into the shell", () => {
    const { onLeft, stop } = arm();

    el("cell").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: el("field") }));

    expect(onLeft).not.toHaveBeenCalled();
    stop();
  });

  it("reports the departure exactly once", () => {
    const { onLeft, stop } = arm();

    el("cell").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: el("outside") }));
    el("cell").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: el("outside") }));

    expect(onLeft).toHaveBeenCalledTimes(1);
    stop();
  });

  it("goes quiet after stop()", () => {
    const { onLeft, stop } = arm();

    stop();
    el("cell").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: el("outside") }));

    expect(onLeft).not.toHaveBeenCalled();
  });

  it("ignores focusout from a popover the shell does not own", () => {
    const { onLeft, stop } = arm();

    el("alien-cell").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: el("outside") }));

    expect(onLeft).not.toHaveBeenCalled();
    stop();
  });
});
