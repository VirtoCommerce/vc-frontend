export interface IMenuItem {
  id?: string;
  title: string;
  url?: string;
  onClick?: (event: Event) => void;
}
