// Which blocks exist on a dashboard and which region each lives in; the saved document only adds order and
// hidden flags. Registering here is all a widget needs to join drag-and-drop, hiding and persistence.
//
// The mechanism only: each dashboard's owner registers its own blocks (the account dashboard from
// `app-runner.ts`, a plugin from its `init()`). Not built on `useExtensionRegistry`, whose categories are a closed compile-time map with
// `{ component, condition }` entries — no region, order or title, and a stat block has no component at all.
import { createGlobalState } from "@vueuse/core";
import { shallowRef } from "vue";
import { Logger } from "@/core/utilities";
import type { BlockType } from "./types";

const useBlockRegistries = createGlobalState(() => shallowRef<Readonly<Record<string, readonly BlockType[]>>>({}));

/**
 * Adds a block to a dashboard; the dashboard (`scope`) is created by its first block. Rules for a contributor:
 * - register synchronously in the module's `init()`, which runs before the app mounts, so a dashboard's first
 *   render (its skeleton included) already knows every block;
 * - prefix the id with the module's name: ids are persisted as `block.type`, so two modules registering the
 *   same id into one dashboard collide in every saved document;
 * - pick `order` in multiples of 10, so a later block can slot in between.
 *
 * A block registered only while its feature is on (a setting, a permission, an optional module) is unknown to
 * a layout saved while it is off: that save drops the block's position, hidden flag and settings, and once
 * registered again the block comes back at its defaults, at the end of its region.
 *
 * A second block with a taken id is ignored with a warning.
 */
export function registerBlock(scope: string, block: BlockType): void {
  const registries = useBlockRegistries();
  const blocks = registries.value[scope] ?? [];

  if (blocks.some((registered) => registered.id === block.id)) {
    Logger.warn(`registerBlock: the block "${block.id}" is already registered on "${scope}"; ignoring.`);
    return;
  }

  // Replace rather than push: a shallowRef only tracks assignment to `.value`.
  registries.value = { ...registries.value, [scope]: [...blocks, block] };
}

/** Removes a block from a dashboard. A saved document that names it keeps working: reconciliation drops it. */
export function unregisterBlock(scope: string, id: string): void {
  const registries = useBlockRegistries();
  const blocks = registries.value[scope] ?? [];

  if (blocks.some((block) => block.id === id)) {
    registries.value = { ...registries.value, [scope]: blocks.filter((block) => block.id !== id) };
  }
}

/** Reactive: read inside a `computed` or a render, a dashboard follows blocks registered later. */
export function getBlockRegistry(scope: string): readonly BlockType[] {
  return useBlockRegistries().value[scope] ?? [];
}

export function getBlock(scope: string, id: string): BlockType | undefined {
  return getBlockRegistry(scope).find((block) => block.id === id);
}
