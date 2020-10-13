import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { currentUserId, storeName } from "core/constants";
import { ADD_ITEM_TO_CART, SHOW_CART_SIDEBAR } from 'libs/shopping-cart/store/cart/definitions';
import { InputAddItemType } from '@core/api/graphql/types';
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
  addItemToCart!: (addItem: InputAddItemType) => void;

  @cartModule.Action(SHOW_CART_SIDEBAR)
  showCartSidebar!: () => void;

  @cartModule.Getter("isLoading")
  isLoading!: boolean;

  public onClick(): void {
    const addItem: InputAddItemType =  {
      productId: this.productId,
      quantity: 1,
      storeId : storeName,
      userId : currentUserId
    };

    this.addItemToCart(addItem);
    this.showCartSidebar();
  }

  get busy(): boolean {
    return this.isLoading;
  }

}
