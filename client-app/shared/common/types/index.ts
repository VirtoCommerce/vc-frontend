export type EntityInfoType = {
  id: string;
  objectId: string;
  objectType: string;
  slug: string;
  isActive: boolean;
  language: {
    cultureName: string;
    threeLetterLanguageName: string;
    twoLetterLanguageName: string;
    twoLetterRegionName: string;
    threeLetterRegionName: string;
  };
};

export type ContentItemType = {
  type: "page" | "blog" | "html";
  name: string;
  permalink: string;
  content: string;
};

export type SlugInfoResultType = {
  contentItem?: ContentItemType;
  entityInfo?: EntityInfoType;
};
