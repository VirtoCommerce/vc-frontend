import Vue from "vue";
import Component from "vue-class-component";
import { namespace } from "vuex-class";
import { FETCH_CART_ITEMS_COUNT, SHOW_CART_SIDEBAR } from 'libs/shopping-cart/store/cart/definitions';


const cartModule = namespace("cart");


@Component({
  name: "CartButton"
})
export default class CartButton extends Vue {

  @cartModule.Getter("itemsQuantity")
  itemsQuantity!: number;

  @cartModule.Action(FETCH_CART_ITEMS_COUNT)
  fetchItemsQuantity!: () => void;

  @cartModule.Action(SHOW_CART_SIDEBAR)
  showCartSidebar!: () => void;

  mounted(){
    this.fetchItemsQuantity();
  }

  public onClick(): void {
    this.showCartSidebar();
  }
}
