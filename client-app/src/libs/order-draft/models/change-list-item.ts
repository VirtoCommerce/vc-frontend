import { ChangeCartItemQty } from 'core/api/api-clients';

export class ChangeListItem {
  constructor(
        public listName: string,
        public changeQty: ChangeCartItemQty | null | undefined) {
  }
}
