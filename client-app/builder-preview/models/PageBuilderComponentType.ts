import type { PageBuilderSettingsType } from "./PageBuilderSettingsType";
import type { Component } from "vue";

type ComponentType = Component | { __name: string };

export type PageBuilderDescriptorType = {
  name?: string;
  type: string;
  component?: ComponentType;
  settings?: PageBuilderSettingsType[];
};

export type PageBuilderComponentDescriptorType =
  | PageBuilderDescriptorType
  | string
  | ComponentType
  | [ComponentType, string];
