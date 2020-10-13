import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { AddCartItem } from 'libs/shopping-cart/models/types';
import { ADD_ITEM_TO_CART, SHOW_CART_SIDEBAR } from 'libs/shopping-cart/store/cart/definitions';

const cartModule = namespace("cart");

@Component({
  name: "AddToCartButton"
})
export default class AddToCartButton extends Vue {
  @Prop()
  productId!: string;

  @Prop()
  textVisible!: boolean;

  @cartModule.Action(ADD_ITEM_TO_CART)
  addItemToCart!: (addItem: AddCartItem) => void;

  @cartModule.Action(SHOW_CART_SIDEBAR)
  showCartSidebar!: () => void;

  @cartModule.Getter("changeProductIdSet")
  changeProductIdSet!: string[];

  public onClick(): void {
    const addItem = new AddCartItem();
    addItem.productId = this.productId;
    addItem.quantity = 1;
    this.addItemToCart(addItem);
    this.showCartSidebar();
  }

  get busy(): boolean {
    const result = this.changeProductIdSet.indexOf(this.productId) > -1;
    return result;
  }

}
