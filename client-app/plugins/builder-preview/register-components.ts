import { Logger } from "@/core/utilities";
import { PageBuilderComponents } from "./page-builder-components";
import type { PageBuilderDescriptorType } from "./models/PageBuilderComponentType";
import type { PageBuilderSchemasStructureType, PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { Component } from "vue";

type PageBuilderJsonModulesType = Record<string, () => Promise<{ default: PageBuilderDescriptorType }>>;

const blocks = import.meta.glob("./schemas/blocks/*.json") as PageBuilderJsonModulesType;
const sections = import.meta.glob("./schemas/sections/*.json") as PageBuilderJsonModulesType;
const shared = import.meta.glob("./schemas/shared/*.json") as PageBuilderJsonModulesType;
const objects = import.meta.glob("./schemas/objects/*.json") as PageBuilderJsonModulesType;
const templates = import.meta.glob("./schemas/templates/*.json") as PageBuilderJsonModulesType;
const settingsSchema = import.meta.glob("./schemas/settings_schema.json") as PageBuilderJsonModulesType;

type SchemaKeysType = keyof PageBuilderSchemaType;

async function loadAllJsonFiles(): Promise<PageBuilderSchemaType> {
  const allModules: PageBuilderSchemasStructureType<PageBuilderJsonModulesType> = {
    blocks,
    sections,
    shared,
    objects,
    templates,
    settingsSchema,
  };

  const result: PageBuilderSchemaType = {
    blocks: {},
    sections: {},
    shared: {},
    objects: {},
    templates: {},
    settingsSchema: {},
  };

  for (const jsonModulesName of Object.keys(allModules) as SchemaKeysType[]) {
    const jsonModules = allModules[jsonModulesName];
    for (const path in jsonModules) {
      const module = await jsonModules[path]();
      const name = path.split("/").pop()?.split(".")[0];
      if (name) {
        result[jsonModulesName][name] = module.default;
      } else {
        Logger.warn(`Could not load ${jsonModulesName} file: ${path}`);
      }
    }
  }

  return result;
}

async function loadFile(componentName: string): Promise<PageBuilderDescriptorType> {
  const module = (await import(`./schemas/sections/${componentName}.json`)) as {
    default: PageBuilderDescriptorType;
  };

  return module.default;
}

export async function getRegisteredComponents(): Promise<PageBuilderSchemaType> {
  const allSettings = await loadAllJsonFiles();
  const sectionsList = (await Promise.all(
    PageBuilderComponents.map(async (x) => {
      if (typeof x === "string") {
        // load settings by name
        const result = await loadFile(x);
        result.type = x;
        return result;
      } else if (Array.isArray(x) && x.length === 2 && typeof x[1] === "string" && typeof x[0] === "object") {
        // load settings by name and set type as component name
        const [{ name }, filename] = x as [Component, string];
        const result = await loadFile(filename);
        result.type = name ?? filename;
        return result;
      } else if (typeof x === "object" && "__name" in x) {
        // load settings by component name
        const result = await loadFile(x.__name!);
        result.type = x.__name!;
        return result;
      } else if (typeof x === "object") {
        // just set type as component name and return result
        const descriptor = x as PageBuilderDescriptorType;
        if ("component" in descriptor) {
          const { component, ...rest } = descriptor;
          const componentName = (component as { __name: string }).__name;
          return {
            ...rest,
            name: rest.name ?? componentName,
            type: componentName,
          };
        }
        return x;
      }
      return null;
    }),
  )) as PageBuilderDescriptorType[];

  for (const section of sectionsList) {
    if (allSettings.sections[section.type]) {
      allSettings.sections[section.type] = {
        ...allSettings.sections[section.type],
        ...section,
      };
    }
  }

  return allSettings;
}
