export interface PageTemplate {
  settings: PageContent;
  content: PageContent[];
}

export interface PageContent {
  id: string;
  name?: string;
  type: string;
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
