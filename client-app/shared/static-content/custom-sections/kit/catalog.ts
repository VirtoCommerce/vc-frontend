import guide from "../guide.md?raw";
import { getKitBehaviors, getKitTags } from "./index";
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
    }
  >;
  design: typeof __SB_DESIGN_FACTS__ & {
    /** The container every custom section stands in, for `@container sb-section (min-width: …)`. */
    containerName: string;
  };
  /** How to write a section that fits the storefront, in Markdown, for the agent that writes them. */
  guide: string;
}

/** The name `.sb-section` in `custom-section.vue` gives its container. */
const SECTION_CONTAINER_NAME = "sb-section";

/** Copies only data, so the catalog can be posted and hashed. */
export function getKitCatalog(): ICustomSectionKitCatalog {
  const tags = Object.entries(getKitTags()).map(([name, { description, attributes }]) => [
    name,
    { description, attributes: withOptions(attributes) },
  ]);
  const behaviors = Object.entries(getKitBehaviors()).map(([name, { description, value, options, writes }]) => [
    name,
    { description, value: value && toCatalogField(value), options: options && withOptions(options), writes },
  ]);
  const catalog = {
    tags: Object.fromEntries(tags),
    behaviors: Object.fromEntries(behaviors),
    design: { ...__SB_DESIGN_FACTS__, containerName: SECTION_CONTAINER_NAME },
    guide,
  };

  return JSON.parse(JSON.stringify(catalog)) as ICustomSectionKitCatalog;
}

function withOptions(fields: Record<string, ICustomSectionField>): Record<string, ICustomSectionField> {
  return Object.fromEntries(Object.entries(fields).map(([name, field]) => [name, toCatalogField(field)]));
}

/** A field as the agent and the server read it: a `select` of icon names lists them. */
function toCatalogField({ optionsFrom, ...field }: ICustomSectionField): ICustomSectionField {
  return optionsFrom === "icons" ? { ...field, options: __SB_ICON_NAMES__ } : field;
}
