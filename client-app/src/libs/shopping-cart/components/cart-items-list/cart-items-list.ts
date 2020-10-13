import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Emit } from "vue-property-decorator";
import { LineItemType } from "core/api/graphql/types";
import CartItem from "libs/shopping-cart/components/cart-item/index.vue";


@Component({
  name: "CartItemsList",
  components: {
    CartItem
  }
})
export default class CartItemsList extends Vue {
  @Prop()
  items!: LineItemType[];

  public onItemDeleted(item: LineItemType): void {
    this.$emit("item-deleted", item);
  }

  public onQuantityChanged(item: LineItemType, quantity: number): void {
    this.$emit("quantity-changed", item, quantity);
  }

}
