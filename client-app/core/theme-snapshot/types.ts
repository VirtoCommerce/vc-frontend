/** Mirrors the theme snapshot contract of the Site Builder backend module. */

export type ThemePageType = "product" | "category" | "page";

export interface IThemeItem {
  id: string;
  /** Never renamed once it is stored. */
  type: string;
  hidden?: boolean;
  blocks?: IThemeItem[];
  [setting: string]: unknown;
}

export interface IThemePageDocument {
  settings: Record<string, unknown>;
  content: IThemeItem[];
}

export interface IThemeSectionGroup {
  content: IThemeItem[];
}

export interface ITemplateRule {
  /** Stable: kept when the rule changes or moves. */
  id: string;
  /** A template key of the same page type. */
  template: string;
  /** Condition name → value; every condition must hold; none means always. */
  when?: Record<string, unknown>;
  disabled?: boolean;
}

export interface ITemplateRules {
  version: 2;
  /** Writers always write it, but readers never need it, so a file may lack it. */
  conditions?: string[];
  product?: ITemplateRule[];
  category?: ITemplateRule[];
  page?: ITemplateRule[];
}

export interface IThemeBrand {
  /** The logo on light backgrounds: the header in the light theme. */
  logoUrl?: string;
  /** The logo on dark backgrounds: the footer, and the header in the dark theme. */
  secondaryLogoUrl?: string;
  faviconUrl?: string;
}

export interface IThemePalette {
  light: Record<string, string>;
  /** Without it, the storefront has no dark theme. */
  dark?: Record<string, string>;
}

/** A setting of a section schema, as the designer builds its form from it. */
export interface IThemeSchemaField {
  id?: string;
  type?: string;
  format?: string;
  translatable?: boolean;
  multiline?: boolean;
  /** The fields of a `list` row or an `object`. */
  element?: IThemeSchemaField[];
  [key: string]: unknown;
}

/** A section type the theme defines: rendered from its template, with no code of its own. */
export interface ICustomSectionDefinition {
  format: 1;
  /** The name in the designer's section picker; a draft may hold it per language. */
  name: string | Record<string, string>;
  schema: {
    settings: IThemeSchemaField[];
    /** Any template when left out. */
    targetTemplates?: string[];
    limit?: number;
    icon?: string;
  };
  /** HTML with one root element and `{{ settings.<id> }}` bindings. */
  template: string;
  css: string;
}

export interface IThemeSnapshot {
  format: 1;
  publication: number;
  publishedDate?: string;
  theme?: string;
  cultureName: string;
  catalogHash?: string;
  rules?: ITemplateRules;
  templates: Record<string, IThemePageDocument>;
  header?: IThemeSectionGroup;
  footer?: IThemeSectionGroup;
  brand?: IThemeBrand;
  palette?: IThemePalette;
  /** Keyed by section type. */
  customSections?: Record<string, ICustomSectionDefinition>;
  /** The asset library's public base URL: a custom section's images come only from under it. */
  assetsBaseUrl?: string;
  menus?: string[];
}

export interface IThemeMenuLink {
  title: string;
  url?: string;
  priority?: number;
  childItems?: IThemeMenuLink[];
}

export interface IThemeMenu {
  name: string;
  items: IThemeMenuLink[];
}

/** A part the draft leaves out comes from the snapshot. */
export interface IThemeDraft {
  rules?: ITemplateRules;
  templates?: Record<string, IThemePageDocument>;
  header?: IThemeSectionGroup;
  footer?: IThemeSectionGroup;
  brand?: IThemeBrand;
  /** `null`: the theme has no palette (the preset shows), as its next publication will have none. */
  palette?: IThemePalette | null;
  /** Every custom section type of the theme: replaces the published ones. */
  customSections?: Record<string, ICustomSectionDefinition>;
  /** The asset library's base, for a store whose published snapshot names none yet; the published one wins. */
  assetsBaseUrl?: string;
}

export interface IThemeSlugPage {
  /** A page from the database: its document's source (`page-builder`, `builder.io`). Absent for a file page. */
  source?: string;
  permalink?: string;
  /** Only `layout`, `template` and what the rules' `setting` conditions name; absent for a page without settings. */
  settings?: Record<string, unknown>;
}

/** As the slug lookup finds it for an anonymous visitor. */
export interface IThemeSlug {
  permalink: string;
  objectType: string;
  objectId: string;
  /** Absent for other object types and a page the server could not read. */
  page?: IThemeSlugPage;
}

export interface IPublishedTheme {
  storeId: string;
  /** The store default when the publication has no file in the requested language. */
  cultureName: string;
  requestedCultureName?: string;
  publication: number;
  snapshot: IThemeSnapshot;
  menus: IThemeMenu[];
  /** Chooses the layout of the page the visitor lands on. */
  slug?: IThemeSlug;
}

export interface IThemeView {
  rules?: ITemplateRules;
  templates: Record<string, IThemePageDocument>;
  header?: IThemeSectionGroup;
  footer?: IThemeSectionGroup;
  brand: IThemeBrand;
  palette?: IThemePalette;
  customSections: Record<string, ICustomSectionDefinition>;
  /** The published snapshot's; while it names none, the draft's, so a draft cannot widen where images come from. */
  assetsBaseUrl?: string;
  menus: IThemeMenu[];
  isDraft: boolean;
}
