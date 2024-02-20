export interface PageTemplateRequest {
  template: string;
}

export interface PageTemplate {
  settings: PageContent;
  content: PageContent[];
}

export interface PageContent {
  id: string;
  name?: string;
  type: string;
  // FIXME: https://virtocommerce.atlassian.net/browse/ST-4911
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [propertyName: string]: any;
}
