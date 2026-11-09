import type { IThemeItem } from "@/core/theme-snapshot";

export interface ITemplateParts {
  before: IThemeItem[];
  main?: IThemeItem;
  column: IThemeItem[];
  after: IThemeItem[];
}

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
