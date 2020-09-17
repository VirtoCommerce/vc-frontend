import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Emit } from "vue-property-decorator";
import { CartLineItem } from 'core/api/api-clients';
import CartItem from "libs/shopping-cart/components/cart-item/index.vue";


@Component({
  name: "CartItemsList",
  components: {
    CartItem
  }
})
export default class CartItemsList extends Vue {
  @Prop()
  items!: CartLineItem[];

  public onItemDeleted(item: CartLineItem): void {
    this.$emit("item-deleted", item);
  }

  public onQuantityChanged(item: CartLineItem, quantity: number): void {
    this.$emit("quantity-changed", item, quantity);
  }

}
