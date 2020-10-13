

export class AddCartItem {

    id?: string;
    productId?: string;
    quantity?: number;
    type?: string;
    listName?: string;
    price?: number;
    comment?: string;

    constructor(data: {
      id?: string;
      productId?: string;
      quantity?: number;
      type?: string;
      listName?: string;
      price?: number;
      comment?: string;
    } = {}) {
      Object.assign(this, data);
    }
}

export class ChangeCartItemQty {

    lineItemId?: string;
    quantity?: number;

    constructor(data: {
      lineItemId?: string;
      quantity?: number;
    } = {}) {
      Object.assign(this, data);
    }

}
