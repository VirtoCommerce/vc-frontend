export interface PageTemplate {
  settings: PageContent;
  content: PageContent[];
}

export interface PageContent {
  id: string;
  name: string;
  type: string;
}
