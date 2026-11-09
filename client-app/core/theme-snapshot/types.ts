/**
 * The theme snapshot, as the Page Builder module publishes it (`docs/contracts/theme-snapshot.md` in
 * vc-module-pagebuilder).
 */

export type ThemePageType = "product" | "category" | "page";

/** A section, or a block of a section. */
export interface IThemeItem {
  id: string;
  /** The schema type; never renamed once it is stored. */
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
  /** The condition names the rules use: writers always write it, readers never need it, so a file may lack it. */
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

/** The parts of the theme the designer sends as its unsaved draft; a part it leaves out comes from the snapshot. */
export interface IThemeDraft {
  rules?: ITemplateRules;
  templates?: Record<string, IThemePageDocument>;
  header?: IThemeSectionGroup;
  footer?: IThemeSectionGroup;
  brand?: IThemeBrand;
  palette?: IThemePalette;
}

/** A published snapshot the storefront accepted, with the links of the menus it names. */
export interface IPublishedTheme {
  storeId: string;
  /** The language the snapshot is in: the store default when the publication has no file in the requested one. */
  cultureName: string;
  /** The language the request asked for. */
  requestedCultureName?: string;
  publication: number;
  snapshot: IThemeSnapshot;
  menus: IThemeMenu[];
}

/** What the storefront renders with: the draft over the published snapshot. */
export interface IThemeView {
  rules?: ITemplateRules;
  templates: Record<string, IThemePageDocument>;
  header?: IThemeSectionGroup;
  footer?: IThemeSectionGroup;
  brand: IThemeBrand;
  palette?: IThemePalette;
  menus: IThemeMenu[];
  /** Whether a part comes from the designer's draft, which may hold translatable dictionaries. */
  isDraft: boolean;
}
