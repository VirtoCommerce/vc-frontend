export interface IPageTemplate {
  settings: IPageContent;
  content: IPageContent[];
}

export interface IPageContent {
  id: string;
  name?: string;
  type: string;
  hidden?: boolean;
  blocks?: {
    id: string;
    name?: string;
    type?: string;
    model?: string;
    hidden?: boolean;
  }[];
  seoInfo?: {
    pageTitle?: string;
    metaKeywords?: string;
    metaDescription?: string;
  };
  [propertyName: string]: unknown;
}
