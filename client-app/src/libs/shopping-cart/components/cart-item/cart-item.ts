import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Emit } from "vue-property-decorator";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { LineItemType } from "core/api/graphql/types";
import ChangeItemQuantity from "libs/shopping-cart/components/change-item-quantity/index.vue";


@Component({
  name: "CartItem",
  components: {
    ChangeItemQuantity
  }
})
export default class CartItem extends Vue {
  @Prop()
  item!: LineItemType;

  deleteIcon = faTrashAlt;

  public onItemDeleted(): void {
    this.$emit("item-deleted", this.item);
  }

  public onQuantityChanged(quantity: number): void {
    this.$emit("quantity-changed", this.item, quantity);
  }

  public quantityChanged(quantity: number): void {
    this.onQuantityChanged(quantity);
  }

}
