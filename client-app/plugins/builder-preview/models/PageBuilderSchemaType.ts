import type { PageBuilderDescriptorType } from "./PageBuilderComponentType";

export type PageBuilderSchemaItemType = { [key: string]: PageBuilderDescriptorType };

export type PageBuilderSchemasStructureType<T> = {
  blocks: T;
  sections: T;
  shared: T;
  objects: T;
  templates: T;
  settingsSchema: T;
};

export type PageBuilderSchemaType = PageBuilderSchemasStructureType<PageBuilderSchemaItemType>;
