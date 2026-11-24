import guide from "../guide.md?raw";
import { DEFAULT_TAG_COST } from "../limits";
import { getCustomSectionBehaviors, getCustomSectionTags } from "./registry";
import type { IDesignFacts } from "../design-facts";
import type { ICustomSectionBehavior, ICustomSectionTag } from "../types";

/** What the designer's catalog says of the kit, for the agent and the server: no components, no loaders. */
export interface ICustomSectionKitCatalog {
  tags: Record<string, Pick<ICustomSectionTag, "description" | "attributes" | "cost" | "hasSideEffects">>;
  behaviors: Record<
    string,
    Pick<ICustomSectionBehavior, "description" | "value" | "options" | "writes" | "repeatsChildren" | "textAttributes">
  >;
  design: IDesignFacts & {
    /** The container every custom section stands in, for `@container sb-section (min-width: …)`. */
    containerName: string;
  };
  /** Every icon name `VcIcon` draws, sorted: the values of a `select` with `optionsFrom: "icons"`. */
  icons: string[];
  /** Every icon name `VcShape` takes as its mask, sorted: the values of a `select` with `optionsFrom: "masks"`. */
  masks: string[];
  /** How to write a section that fits the storefront, in Markdown, for the agent that writes them. */
  guide: string;
}

/** The name `.sb-section` in `sb-section.vue` gives its container. */
const SECTION_CONTAINER_NAME = "sb-section";

/** Copies only data, by name, so the same kit hashes alike whatever order it registered in. */
export function getKitCatalog(): ICustomSectionKitCatalog {
  const tags = toSortedEntries(getCustomSectionTags()).map(
    ([name, { description, attributes, cost, hasSideEffects }]) => [
      name,
      { description, attributes, cost: cost ?? DEFAULT_TAG_COST, hasSideEffects: !!hasSideEffects },
    ],
  );
  const behaviors = toSortedEntries(getCustomSectionBehaviors()).map(
    ([name, { description, value, options, writes, repeatsChildren, textAttributes }]) => [
      name,
      { description, value, options, writes, repeatsChildren, textAttributes },
    ],
  );
  const catalog = {
    tags: Object.fromEntries(tags),
    behaviors: Object.fromEntries(behaviors),
    design: { ...__SB_DESIGN_FACTS__, containerName: SECTION_CONTAINER_NAME },
    icons: __SB_ICON_NAMES__,
    masks: __SB_MASK_NAMES__,
    guide,
  };

  return JSON.parse(JSON.stringify(catalog)) as ICustomSectionKitCatalog;
}

function toSortedEntries<T>(entries: Readonly<Record<string, T>>): [string, T][] {
  return Object.entries(entries).sort(([a], [b]) => (a < b ? -1 : 1));
}
