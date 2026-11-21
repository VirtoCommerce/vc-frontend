import type { PageBuilderSettingsType } from "./PageBuilderSettingsType";
import type { IThemeSchemaField } from "@/core/theme-snapshot";
import type { Component } from "vue";

type ComponentType = Component | { __name: string };

export type PageBuilderDescriptorType = {
  name?: string;
  type: string;
  component?: ComponentType;
  /** A theme's custom section type declares its fields as the snapshot holds them. */
  settings?: PageBuilderSettingsType[] | IThemeSchemaField[];
  targetTemplates?: string[];
  limit?: number;
  icon?: string;
  /** A section type the theme defines. */
  custom?: boolean;
};

export type PageBuilderComponentDescriptorType =
  PageBuilderDescriptorType | string | ComponentType | [ComponentType, string];
