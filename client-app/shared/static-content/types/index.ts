export interface PageTemplate {
  settings: PageContent;
  content: PageContent[];
}

export interface PageContent {
  id: string;
  name?: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [propertyName: string]: any;
}
