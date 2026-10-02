import Sortable from "sortablejs";
import { nextTick, onScopeDispose, readonly, ref, toValue, watch } from "vue";
import type { MaybeRefOrGetter, Ref } from "vue";

export type SortableOrientationType = "vertical" | "horizontal";

/**
 * An item leaving this list for another one in its group. `index` is absent for a keyboard move — it appends —
 * except when a cancelled grab (Escape or blur) sends the item back to the list it was grabbed in, at the place
 * it left.
 */
export type SortableMovePayloadType = {
  id: string;
  from: string;
  to: string;
  index?: number;
};

/** What a sort just did, unlocalized: the consumer owns the wording and the `aria-live` region. */
export type SortableSignalType =
  /** `canChangeList`: the cross-axis arrows move the item to a sibling list (see `listOrder`). */
  | { kind: "grabbed"; id: string; index: number; total: number; canChangeList: boolean }
  /** `edge` reports a move that could not happen: silence leaves a screen-reader user unable to tell why. */
  | { kind: "moved" | "dropped" | "edge"; id: string; index: number; total: number }
  | { kind: "cancelled"; id: string }
  /** A cross-axis arrow found no list in that direction that accepts the item. */
  | { kind: "noTarget"; id: string }
  | { kind: "movedList"; id: string; from: string; to: string };

/**
 * Spread onto the consumer's own item element. `class` is a STRING: a bare `v-bind` of an object class
 * rewrites the computed it came from in place.
 */
export type SortableItemAttrsType = {
  "data-sortable-id": string;
  class: string;
  tabindex?: "0";
  role?: "button";
  "aria-pressed"?: "true" | "false";
  onKeydown?: (event: KeyboardEvent) => void;
  onBlur?: () => void;
};

/** A grab starting, by pointer or keyboard. `from` is the list it starts in. */
export type SortableGrabPayloadType = { id: string; from: string };

/** A grab ending — dropped, cancelled or let go — in whichever list holds it by then. */
export type SortableReleasePayloadType = { id: string };

/** Spread onto the element that takes the keyboard in a list with a separate `handle`. */
export type SortableHandleAttrsType = {
  class: string;
  tabindex: "0";
  "aria-pressed": "true" | "false";
  onKeydown: (event: KeyboardEvent) => void;
  onBlur: () => void;
};

export interface IUseSortableListOptions {
  /** Names this list in move payloads, in `accepts` and in a sibling's `listOrder`. */
  name: MaybeRefOrGetter<string>;
  /** Ids in render order. The single source of truth — the DOM is only a projection of it. */
  items: () => readonly string[];
  /** Lists sharing a group exchange items. */
  group?: MaybeRefOrGetter<string> | Ref<string | undefined> | (() => string | undefined);
  /**
   * Ordered names of this list and its siblings in the group. The cross-axis arrows walk it one list at a
   * time, skipping lists that are not mounted or refuse the item, and stop at either end.
   */
  listOrder?:
    MaybeRefOrGetter<readonly string[]> | Ref<readonly string[] | undefined> | (() => readonly string[] | undefined);
  /** Per-item acceptance, asked on the pointer path (SortableJS `put`) AND the keyboard path. Read once. */
  accepts?: (id: string, from: string) => boolean;
  /**
   * Drag by a handle instead of the whole item; the keyboard then goes through `handleAttrs`. `true` drags
   * by the element `handleAttrs` is bound to; a selector adds whatever it matches to that pointer grip.
   * Read once.
   */
  handle?: boolean | string;
  /** Elements inside an item that must never start a drag — controls sitting inside the handle. Read once. */
  filter?: string;
  orientation?: MaybeRefOrGetter<SortableOrientationType>;
  /** While true the list is inert and its items keep their own behaviour. */
  disabled?: MaybeRefOrGetter<boolean>;
  /** Same-list reorder, as the full new order. */
  onReorder: (ids: string[]) => void;
  /** Cross-list move. Whoever owns both arrays applies it — never this list alone — and synchronously, or
   * focus cannot follow the item into the other list. */
  onMove?: (payload: SortableMovePayloadType) => void;
  onAnnounce?: (signal: SortableSignalType) => void;
  onGrab?: (payload: SortableGrabPayloadType) => void;
  onRelease?: (payload: SortableReleasePayloadType) => void;
}

export const SORTABLE_ITEM_ATTRIBUTE = "data-sortable-id";
export const SORTABLE_NAME_ATTRIBUTE = "data-sortable-name";
export const HANDLE_SELECTOR = ".vc-sortable__handle";

// Where a keyboard grab began, so Escape can undo every move it made, across lists too.
type GrabOriginType = { list: string; index: number };

type RegisteredListType = {
  accepts?: (id: string, from: string) => boolean;
  isEnabled: () => boolean;
  focusItem: (id: string) => void;
  /** Takes over a grab that a sibling's cross-axis arrow carried into this list. */
  adopt: (id: string, origin: GrabOriginType) => void;
  /** Lets go of a grab that came from `list`, whose indices a pointer press there has just captured. */
  releaseFrom: (list: string) => void;
};

// The keyboard has no drop target under a pointer to ask, so a list needs to ask its siblings directly.
const listsByGroup = new Map<string, Map<string, RegisteredListType>>();

function moveWithin(items: readonly string[], id: string, index: number): string[] {
  const ids = items.filter((candidate) => candidate !== id);
  ids.splice(index, 0, id);
  return ids;
}

/**
 * Pointer and keyboard reordering for a container this caller renders. SortableJS moves DOM nodes; this
 * undoes every move and reports it instead, so state alone drives the render.
 *
 * Keyboard: Space/Enter grabs and drops, arrows along `orientation` move, Escape puts it back, blur
 * cancels, and the cross-axis arrows move the item along `listOrder`. The grab travels with the item, so it is
 * held until dropped whichever list it is in, and Escape or blur returns it to where it was grabbed. Focus
 * follows it into the sibling list unless the owner has already moved focus elsewhere.
 */
export function useSortableList(
  container: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: IUseSortableListOptions,
) {
  const whole = typeof options.handle === "string" ? !options.handle.trim() : !options.handle;

  const grabbedId = ref<string>();
  let origin: GrabOriginType | undefined;

  const nameOf = () => toValue(options.name);
  const groupOf = () => toValue<string | undefined>(options.group);
  const isEnabled = () => !toValue(options.disabled);

  function announce(signal: SortableSignalType): void {
    options.onAnnounce?.(signal);
  }

  function isGrabbed(id: string): boolean {
    return grabbedId.value === id;
  }

  // Let go without moving anything back or reporting it: the grab is handed to another list.
  function release(): void {
    grabbedId.value = undefined;
    origin = undefined;
  }

  // The grab is over here: the UI is going away, a pointer press is taking over, or the item left.
  function end(): void {
    const id = grabbedId.value;
    release();
    if (id !== undefined) {
      options.onRelease?.({ id });
    }
  }

  const siblingsOf = () => listsByGroup.get(groupOf() ?? "");

  // A moved item's control unmounts here and mounts there, which drops focus to <body>; the owner has
  // applied the move by the next render, so focus follows it — unless the owner placed it already.
  function followInto(list: RegisteredListType | undefined, id: string): void {
    void nextTick(() => {
      if (!document.activeElement || document.activeElement === document.body) {
        list?.focusItem(id);
      }
    });
  }

  // Vue's `insertBefore` blurs the moved node in Chrome and WebKit, and blur cancels a grab — so an
  // unguarded move snaps straight back. Ignore that self-inflicted blur until the refocus has run.
  let refocusing = false;

  function refocus(target: HTMLElement | null): void {
    refocusing = true;
    void nextTick(() => {
      target?.focus();
      refocusing = false;
    });
  }

  function grab(id: string): void {
    const items = options.items();
    const index = items.indexOf(id);
    if (index < 0) {
      return;
    }
    grabbedId.value = id;
    origin = { list: nameOf(), index };
    options.onGrab?.({ id, from: nameOf() });
    const order = toValue<readonly string[] | undefined>(options.listOrder);
    announce({ kind: "grabbed", id, index, total: items.length, canChangeList: Boolean(order && order.length > 1) });
  }

  function drop(id: string): void {
    const items = options.items();
    end();
    announce({ kind: "dropped", id, index: items.indexOf(id), total: items.length });
  }

  // `target` only from Escape: putting the item back blurs it, so focus needs restoring. Blur-cancel
  // passes none — the user is tabbing away, and pulling focus back would trap them.
  function cancel(id: string, target?: HTMLElement | null): void {
    const from = origin;
    release();

    if (from && from.list !== nameOf()) {
      options.onMove?.({ id, from: nameOf(), to: from.list, index: from.index });
      options.onRelease?.({ id });
      announce({ kind: "cancelled", id });
      if (target) {
        followInto(siblingsOf()?.get(from.list), id);
      }
      return;
    }

    options.onReorder(moveWithin(options.items(), id, from?.index ?? 0));
    options.onRelease?.({ id });
    announce({ kind: "cancelled", id });

    if (target) {
      refocus(target);
    }
  }

  function step(id: string, delta: number, target: HTMLElement | null): void {
    const items = options.items();
    const from = items.indexOf(id);
    const to = from + delta;
    if (from < 0) {
      return;
    }
    if (to < 0 || to >= items.length) {
      announce({ kind: "edge", id, index: from, total: items.length });
      return;
    }
    options.onReorder(moveWithin(items, id, to));
    announce({ kind: "moved", id, index: to, total: items.length });
    refocus(target);
  }

  function stepList(id: string, delta: number): void {
    const order = toValue<readonly string[] | undefined>(options.listOrder) ?? [];
    const name = nameOf();
    const siblings = siblingsOf();

    for (let index = order.indexOf(name) + delta; index >= 0 && index < order.length; index += delta) {
      const target = order[index];
      const sibling = siblings?.get(target);
      // Refused as the pointer would be: SortableJS drops nothing into a disabled list either.
      if (target === name || !sibling?.isEnabled() || sibling.accepts?.(id, name) === false) {
        continue;
      }
      // The grab travels with the item: the sibling holds it from here, so the next key acts there.
      const carried = origin ?? { list: name, index: options.items().indexOf(id) };
      release();
      options.onMove?.({ id, from: name, to: target });
      announce({ kind: "movedList", id, from: name, to: target });
      sibling.adopt(id, carried);
      followInto(sibling, id);
      return;
    }

    announce({ kind: "noTarget", id });
  }

  function focusItem(id: string): void {
    const item = [...(toValue(container)?.querySelectorAll<HTMLElement>(`[${SORTABLE_ITEM_ATTRIBUTE}]`) ?? [])].find(
      (candidate) => candidate.getAttribute(SORTABLE_ITEM_ATTRIBUTE) === id,
    );
    const target = whole ? item : item?.querySelector<HTMLElement>(HANDLE_SELECTOR);
    target?.focus({ preventScroll: true });
  }

  function onKeydown(event: KeyboardEvent, id: string): void {
    // The item's or handle's listener also hears keys bubbling from controls inside it, which keep their own.
    const fromDescendant = event.target instanceof Node && event.target !== event.currentTarget;
    if (!isEnabled() || fromDescendant) {
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (isGrabbed(id)) {
        drop(id);
      } else {
        grab(id);
      }
      return;
    }

    if (!isGrabbed(id)) {
      return;
    }

    const target = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;

    if (event.key === "Escape") {
      event.preventDefault();
      cancel(id, target);
      return;
    }

    onArrow(event, id, target);
  }

  function onArrow(event: KeyboardEvent, id: string, target: HTMLElement | null): void {
    const [back, forward, listBack, listForward] =
      toValue(options.orientation) === "horizontal"
        ? ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
        : ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

    if (event.key === back || event.key === forward) {
      event.preventDefault();
      step(id, event.key === back ? -1 : 1, target);
      return;
    }

    const order = toValue<readonly string[] | undefined>(options.listOrder);
    if (order && order.length > 1 && (event.key === listBack || event.key === listForward)) {
      event.preventDefault();
      stepList(id, event.key === listBack ? -1 : 1);
    }
  }

  function onBlur(id: string): void {
    if (!refocusing && isGrabbed(id)) {
      cancel(id);
    }
  }

  function itemAttrs(id: string): SortableItemAttrsType {
    if (!isEnabled()) {
      return { [SORTABLE_ITEM_ATTRIBUTE]: id, class: "" };
    }

    const classes = ["vc-sortable__item"];
    if (whole) {
      classes.push("vc-sortable__item--whole");
    }
    if (isGrabbed(id)) {
      classes.push("vc-sortable__item--grabbed");
    }

    const attrs: SortableItemAttrsType = { [SORTABLE_ITEM_ATTRIBUTE]: id, class: classes.join(" ") };

    if (whole) {
      attrs.tabindex = "0";
      attrs.role = "button";
      attrs["aria-pressed"] = isGrabbed(id) ? "true" : "false";
      attrs.onKeydown = (event) => onKeydown(event, id);
      attrs.onBlur = () => onBlur(id);
    }

    return attrs;
  }

  /** Null while the list is disabled, and for a list that drags by the whole item. */
  function handleAttrs(id: string): SortableHandleAttrsType | null {
    if (whole || !isEnabled()) {
      return null;
    }

    return {
      class: "vc-sortable__handle",
      tabindex: "0",
      "aria-pressed": isGrabbed(id) ? "true" : "false",
      onKeydown: (event) => onKeydown(event, id),
      onBlur: () => onBlur(id),
    };
  }

  // Where the dragged node sat, so it goes back between the same neighbours — the index alone lands it
  // outside a v-for's anchors when the list is followed by other content.
  let originSibling: Node | null = null;

  function restore(event: Sortable.SortableEvent): void {
    const saved = originSibling?.parentNode === event.from ? originSibling : null;
    originSibling = null;
    // Removed before the fallback index is read: with the item still in place, a backward move reads one short.
    event.item.remove();
    event.from.insertBefore(event.item, saved ?? event.from.children[event.oldIndex ?? 0] ?? null);
  }

  function groupOption(group: string | undefined): Sortable.Options["group"] {
    if (!group || !options.accepts) {
      return group;
    }
    const accepts = options.accepts;

    return {
      name: group,
      // A group name belongs to the list and cannot say "some items"; the rule belongs to the item.
      put: (_to, from, dragEl) =>
        accepts(
          dragEl.getAttribute(SORTABLE_ITEM_ATTRIBUTE) ?? "",
          from.el.getAttribute(SORTABLE_NAME_ATTRIBUTE) ?? "",
        ),
    };
  }

  // SortableJS accepts a native drop only over a list, so releasing in the gap between two lists is a
  // cancelled drop to the browser, which flies the drag image back to where it started — while the item
  // lands where the placeholder showed. Accepting `dragover` page-wide for the drag's length keeps the two
  // in step; SortableJS already cancels the `drop` itself. A drop zone of the page's own that decided —
  // accepted, or refused with `dropEffect = "none"` — keeps its decision; one that refuses only by not
  // cancelling `dragover` now gets the drop event, and must check what it holds. WebKit reads an unset
  // `dropEffect` as "none", so it is seeded on the way down, before any zone, to keep "none" a refusal.
  let acceptingDropsIn: Document | undefined;

  function seedDropEffect(event: DragEvent): void {
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }

  function acceptDrop(event: DragEvent): void {
    if (event.defaultPrevented || event.dataTransfer?.dropEffect === "none") {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }

  function stopAcceptingDrops(): void {
    acceptingDropsIn?.removeEventListener("dragover", seedDropEffect, true);
    acceptingDropsIn?.removeEventListener("dragover", acceptDrop);
    acceptingDropsIn = undefined;
  }

  function startAcceptingDrops(doc: Document): void {
    stopAcceptingDrops();
    acceptingDropsIn = doc;
    doc.addEventListener("dragover", seedDropEffect, true);
    doc.addEventListener("dragover", acceptDrop);
  }

  function pointerHandle(): string | undefined {
    if (typeof options.handle === "string") {
      return options.handle.trim() ? `${HANDLE_SELECTOR}, ${options.handle}` : undefined;
    }
    return options.handle ? HANDLE_SELECTOR : undefined;
  }

  function create(el: HTMLElement): Sortable {
    return new Sortable(el, {
      group: groupOption(groupOf()),
      handle: pointerHandle(),
      filter: options.filter,
      // Without it the filter preventDefaults the mousedown and the control inside the handle loses its click.
      preventOnFilter: false,
      // Items are what `itemAttrs` stamped; anything else in the container keeps its place.
      draggable: `[${SORTABLE_ITEM_ATTRIBUTE}]`,
      animation: 150,
      ghostClass: "vc-sortable__item--ghost",
      dragClass: "vc-sortable__item--drag",
      disabled: !isEnabled(),

      // SortableJS defaults to `delay: 0` and preventDefaults every touchmove once a tap registers, so a
      // swipe starting on an item drags instead of scrolling. `delayOnTouchOnly` exempts the mouse.
      delay: 200,
      delayOnTouchOnly: true,
      touchStartThreshold: 5,

      // Sortable captures indices at choose time, so a keyboard grab cancelled mid-drag would reshuffle
      // the list under them. `release`, not `cancel` — the restore is the reshuffle.
      // A grab carried out of this list into a sibling would blur-cancel back into it under the press, so
      // it goes too. Any other grab in the group still cancels, as it touches nothing this press captured.
      onChoose: () => {
        end();
        siblingsOf()?.forEach((list) => list.releaseFrom(nameOf()));
      },

      onStart: (event: Sortable.SortableEvent) => {
        originSibling = event.item.nextSibling;
        startAcceptingDrops(el.ownerDocument);
        const id = event.item.getAttribute(SORTABLE_ITEM_ATTRIBUTE);
        if (id) {
          options.onGrab?.({ id, from: nameOf() });
        }
      },

      // Draggable indices, never plain ones: other children of the container would shift them.
      onUpdate: (event: Sortable.SortableEvent) => {
        restore(event);

        const ids = [...options.items()];
        const [moved] = ids.splice(event.oldDraggableIndex ?? 0, 1);
        ids.splice(event.newDraggableIndex ?? 0, 0, moved);
        options.onReorder(ids);
      },

      // Cross-list. `onEnd` fires once per drag, unlike separate onAdd/onRemove, which double-apply.
      onEnd: (event: Sortable.SortableEvent) => {
        stopAcceptingDrops();
        const id = event.item.getAttribute(SORTABLE_ITEM_ATTRIBUTE);

        if (event.from !== event.to) {
          // Back into the source list — state is what moves the item across.
          restore(event);

          const to = event.to.getAttribute(SORTABLE_NAME_ATTRIBUTE);
          if (id && to) {
            options.onMove?.({ id, from: nameOf(), to, index: event.newDraggableIndex ?? undefined });
          }
        }

        if (id) {
          options.onRelease?.({ id });
        }
      },
    });
  }

  let sortable: Sortable | undefined;

  watch(
    () => toValue(container),
    (el, _previous, onCleanup) => {
      if (!el) {
        return;
      }
      const instance = create(el);
      sortable = instance;
      onCleanup(() => {
        // `destroy` mid-drag ends it without an `end` event.
        stopAcceptingDrops();
        instance.destroy();
        sortable = undefined;
      });
    },
    // Sync: built the moment the element exists, as an `onMounted` would, whenever that is.
    { immediate: true, flush: "sync" },
  );

  // The list's name is what a sibling's drop reports as its target, so the list stamps it itself — a
  // caller rendering its own container need not know the attribute.
  watch([() => toValue(container), nameOf], ([el, name]) => el?.setAttribute(SORTABLE_NAME_ATTRIBUTE, name), {
    immediate: true,
    flush: "sync",
  });

  // An item that leaves the list while held lets go here, before the render removes it: not every engine
  // blurs a removed element (Chrome does, jsdom does not), and a blur-cancel would put it back.
  watch(options.items, (ids) => {
    if (grabbedId.value !== undefined && !ids.includes(grabbedId.value)) {
      end();
    }
  });

  watch(isEnabled, (enabled) => {
    sortable?.option("disabled", !enabled);
    if (!enabled) {
      end();
    }
  });

  watch(groupOf, (group) => sortable?.option("group", groupOption(group)));

  watch(
    [groupOf, nameOf],
    ([group, name], _previous, onCleanup) => {
      if (!group) {
        return;
      }
      const lists = listsByGroup.get(group) ?? new Map<string, RegisteredListType>();
      listsByGroup.set(group, lists);
      const adopt = (id: string, carried: GrabOriginType) => {
        grabbedId.value = id;
        origin = carried;
        // An owner that refused the move leaves nothing here to hold.
        void nextTick(() => {
          if (grabbedId.value === id && !options.items().includes(id)) {
            end();
          }
        });
      };
      const releaseFrom = (list: string) => {
        if (origin?.list === list) {
          end();
        }
      };
      const entry: RegisteredListType = { accepts: options.accepts, isEnabled, focusItem, adopt, releaseFrom };
      lists.set(name, entry);
      onCleanup(() => {
        // A list remounting under the same name registers before the old one cleans up.
        if (lists.get(name) === entry) {
          lists.delete(name);
        }
        if (!lists.size && listsByGroup.get(group) === lists) {
          listsByGroup.delete(group);
        }
      });
    },
    { immediate: true },
  );

  // A list unmounting with an item held ends that grab: no blur is coming if focus is elsewhere.
  onScopeDispose(() => {
    end();
    stopAcceptingDrops();
  });

  return { grabbedId: readonly(grabbedId), isGrabbed, itemAttrs, handleAttrs, release: end };
}
