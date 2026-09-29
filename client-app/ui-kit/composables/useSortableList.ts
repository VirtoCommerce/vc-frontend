import Sortable from "sortablejs";
import { nextTick, readonly, ref, toValue, watch } from "vue";
import type { MaybeRefOrGetter } from "vue";

export type SortableOrientationType = "vertical" | "horizontal";

/** An item leaving this list for another one in its group. `index` is absent for a keyboard move — it appends. */
export type SortableMovePayloadType = {
  id: string;
  from: string;
  to: string;
  index?: number;
};

/** What a sort just did, unlocalized: the consumer owns the wording and the `aria-live` region. */
export type SortableSignalType =
  /** `canChangeList`: the cross-axis arrows move the item to a sibling list (see `ring`). */
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

/** Spread onto the element that takes the keyboard in a list with a separate `handle`. */
export type SortableHandleAttrsType = {
  class: string;
  tabindex: "0";
  "aria-pressed": "true" | "false";
  onKeydown: (event: KeyboardEvent) => void;
  onBlur: () => void;
};

export interface ISortableListOptions {
  /** Names this list in move payloads, in `accepts` and in a sibling's `ring`. */
  name: MaybeRefOrGetter<string>;
  /** Ids in render order. The single source of truth — the DOM is only a projection of it. */
  items: () => readonly string[];
  /** Lists sharing a group exchange items. */
  group?: MaybeRefOrGetter<string | undefined>;
  /**
   * Ordered names of this list and its siblings in the group. The cross-axis arrows walk it one list at a
   * time, skipping lists that are not mounted or refuse the item, and stop at either end.
   */
  ring?: MaybeRefOrGetter<readonly string[] | undefined>;
  /** Per-item acceptance, asked on the pointer path (SortableJS `put`) AND the keyboard path. Read once. */
  accepts?: (id: string, from: string) => boolean;
  /** Which children are items. Anything else in the container is ignored and keeps its place. Read once. */
  itemSelector?: string;
  /**
   * Pointer handle inside an item. Without one the whole item drags and takes the keyboard itself;
   * with one, the keyboard goes through `handleAttrs`. Read once.
   */
  handle?: string;
  /** Elements inside an item that must never start a drag — controls sitting inside the handle. Read once. */
  filter?: string;
  orientation?: MaybeRefOrGetter<SortableOrientationType>;
  /** While false the list is inert and its items keep their own behaviour. */
  enabled?: MaybeRefOrGetter<boolean>;
  /** Same-list reorder, as the full new order. */
  onReorder: (ids: string[]) => void;
  /** Cross-list move. Whoever owns both arrays applies it — never this list alone. */
  onMove?: (payload: SortableMovePayloadType) => void;
  onAnnounce?: (signal: SortableSignalType) => void;
}

export const SORTABLE_ITEM_ATTRIBUTE = "data-sortable-id";
export const SORTABLE_NAME_ATTRIBUTE = "data-sortable-name";

type RegisteredListType = {
  accepts?: (id: string, from: string) => boolean;
  isEnabled: () => boolean;
  focusItem: (id: string) => void;
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
 * cancels, and the cross-axis arrows move the item along `ring` — focus follows it into the sibling list
 * unless the owner has already moved focus elsewhere.
 */
export function useSortableList(
  container: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: ISortableListOptions,
) {
  const itemSelector = options.itemSelector ?? `[${SORTABLE_ITEM_ATTRIBUTE}]`;
  const whole = !options.handle;

  const grabbedId = ref<string>();
  let originIndex = -1;

  const nameOf = () => toValue(options.name);
  const groupOf = () => toValue(options.group);
  const isEnabled = () => toValue(options.enabled) ?? true;

  function announce(signal: SortableSignalType): void {
    options.onAnnounce?.(signal);
  }

  function isGrabbed(id: string): boolean {
    return grabbedId.value === id;
  }

  // Let go without moving anything back: the UI is going away, or a pointer drag is taking over.
  function release(): void {
    grabbedId.value = undefined;
    originIndex = -1;
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
    originIndex = index;
    const ring = toValue(options.ring);
    announce({ kind: "grabbed", id, index, total: items.length, canChangeList: Boolean(ring && ring.length > 1) });
  }

  function drop(id: string): void {
    const items = options.items();
    release();
    announce({ kind: "dropped", id, index: items.indexOf(id), total: items.length });
  }

  // `target` only from Escape: putting the item back blurs it, so focus needs restoring. Blur-cancel
  // passes none — the user is tabbing away, and pulling focus back would trap them.
  function cancel(id: string, target?: HTMLElement | null): void {
    const index = originIndex;
    release();
    options.onReorder(moveWithin(options.items(), id, index));
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
    const ring = toValue(options.ring) ?? [];
    const name = nameOf();
    const siblings = listsByGroup.get(groupOf() ?? "");

    for (let index = ring.indexOf(name) + delta; index >= 0 && index < ring.length; index += delta) {
      const target = ring[index];
      const sibling = siblings?.get(target);
      // Refused as the pointer would be: SortableJS drops nothing into a disabled list either.
      if (target === name || !sibling?.isEnabled() || sibling.accepts?.(id, name) === false) {
        continue;
      }
      // The item leaves this list, so the grab is released rather than followed across containers.
      release();
      options.onMove?.({ id, from: name, to: target });
      announce({ kind: "movedList", id, from: name, to: target });
      // Its control unmounts here and mounts there, which drops focus to <body>; the owner has applied the
      // move by the next render, so focus follows it into the sibling — unless the owner placed it already.
      void nextTick(() => {
        if (!document.activeElement || document.activeElement === document.body) {
          sibling.focusItem(id);
        }
      });
      return;
    }

    announce({ kind: "noTarget", id });
  }

  function focusItem(id: string): void {
    const item = [...(toValue(container)?.querySelectorAll<HTMLElement>(`[${SORTABLE_ITEM_ATTRIBUTE}]`) ?? [])].find(
      (candidate) => candidate.getAttribute(SORTABLE_ITEM_ATTRIBUTE) === id,
    );
    const target = whole ? item : item?.querySelector<HTMLElement>(".vc-sortable__handle");
    target?.focus({ preventScroll: true });
  }

  function onKeydown(event: KeyboardEvent, id: string): void {
    if (!isEnabled()) {
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

    const ring = toValue(options.ring);
    if (ring && ring.length > 1 && (event.key === listBack || event.key === listForward)) {
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

  function create(el: HTMLElement): Sortable {
    return new Sortable(el, {
      group: groupOption(groupOf()),
      handle: options.handle,
      filter: options.filter,
      // Without it the filter preventDefaults the mousedown and the control inside the handle loses its click.
      preventOnFilter: false,
      draggable: itemSelector,
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
      onChoose: () => release(),

      onStart: (event: Sortable.SortableEvent) => {
        originSibling = event.item.nextSibling;
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
        if (event.from === event.to) {
          return;
        }

        // Back into the source list — state is what moves the item across.
        restore(event);

        const id = event.item.getAttribute(SORTABLE_ITEM_ATTRIBUTE);
        const to = event.to.getAttribute(SORTABLE_NAME_ATTRIBUTE);
        if (id && to) {
          options.onMove?.({ id, from: nameOf(), to, index: event.newDraggableIndex ?? undefined });
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

  watch(isEnabled, (enabled) => {
    sortable?.option("disabled", !enabled);
    if (!enabled) {
      release();
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
      const entry: RegisteredListType = { accepts: options.accepts, isEnabled, focusItem };
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

  return { grabbedId: readonly(grabbedId), isGrabbed, itemAttrs, handleAttrs, release };
}
