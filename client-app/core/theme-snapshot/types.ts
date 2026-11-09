/** The contract is `docs/contracts/theme-snapshot.md` in vc-module-pagebuilder. */

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
  menus: IThemeMenu[];
  isDraft: boolean;
}
