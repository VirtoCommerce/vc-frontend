import guide from "../guide.md?raw";
import { getSectionBehaviors, getSectionTags } from "./registry";
import type { ICustomSectionField } from "../types";

/** What the designer's catalog says of the kit, for the agent and the server: no components, no loaders. */
export interface ICustomSectionKitCatalog {
  tags: Record<string, { description: string; attributes: Record<string, ICustomSectionField> }>;
  behaviors: Record<
    string,
    {
      description: string;
      value?: ICustomSectionField;
      options?: Record<string, ICustomSectionField>;
      writes?: string[];
      /** The renderer repeats the element's children once; such a behavior is not nested in another. */
      repeatsChildren?: boolean;
    }
  >;
  design: typeof __SB_DESIGN_FACTS__ & {
    /** The container every custom section stands in, for `@container sb-section (min-width: …)`. */
    containerName: string;
  };
  /** Every icon name `VcIcon` draws, sorted: the values of a `select` with `optionsFrom: "icons"`. */
  icons: string[];
  /** How to write a section that fits the storefront, in Markdown, for the agent that writes them. */
  guide: string;
}

/** The name `.sb-section` in `sb-section.vue` gives its container. */
const SECTION_CONTAINER_NAME = "sb-section";

/** Copies only data, so the catalog can be posted and hashed. */
export function getKitCatalog(): ICustomSectionKitCatalog {
  const tags = Object.entries(getSectionTags()).map(([name, { description, attributes }]) => [
    name,
    { description, attributes },
  ]);
  const behaviors = Object.entries(getSectionBehaviors()).map(
    ([name, { description, value, options, writes, repeatsChildren }]) => [
      name,
      { description, value, options, writes, repeatsChildren },
    ],
  );
  const catalog = {
    tags: Object.fromEntries(tags),
    behaviors: Object.fromEntries(behaviors),
    design: { ...__SB_DESIGN_FACTS__, containerName: SECTION_CONTAINER_NAME },
    icons: __SB_ICON_NAMES__,
    guide,
  };

  return JSON.parse(JSON.stringify(catalog)) as ICustomSectionKitCatalog;
}
