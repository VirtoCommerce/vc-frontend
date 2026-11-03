import type { IThemeItem } from "@/core/theme-snapshot";

export interface ITemplateParts {
  /** Sections above the main one. */
  before: IThemeItem[];
  /** The page's main section: the product info, the product listing, the page's content. */
  main?: IThemeItem;
  /** Sections the page shows beside or inside its main one, in template order. */
  column: IThemeItem[];
  /** Sections below the main one. */
  after: IThemeItem[];
}

/** A template's visible sections around its main section; hidden ones are left out, the main one excepted. */
export function splitTemplate(
  content: readonly IThemeItem[],
  mainType: string,
  columnTypes: ReadonlySet<string> = new Set(),
): ITemplateParts {
  const mainIndex = content.findIndex((item) => item.type === mainType);
  const isAround = (item: IThemeItem) => !item.hidden && item.type !== mainType && !columnTypes.has(item.type);

  return {
    before: mainIndex > 0 ? content.slice(0, mainIndex).filter(isAround) : [],
    main: mainIndex >= 0 ? content[mainIndex] : undefined,
    column: content.filter((item) => !item.hidden && columnTypes.has(item.type)),
    after: content.slice(Math.max(mainIndex, 0)).filter(isAround),
  };
}
