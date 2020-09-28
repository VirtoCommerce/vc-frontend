import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import i18n from "@i18n";
import { ShoppingCart, CartLineItem, ChangeCartItemQty } from "core/api/api-clients";
import CartHeader from "libs/shopping-cart/components/cart-header/index.vue";
import CartItemsList from "libs/shopping-cart/components/cart-items-list/index.vue";
import CartSummary from "libs/shopping-cart/components/cart-summary/index.vue";
import {
  FETCH_CART,
  DELETE_ITEM_FROM_CART,
  CHANGE_ITEM_QUANTITY,
  CLEAR_CART,
  HIDE_CART_SIDEBAR,
  CHECKOUT
} from "libs/shopping-cart/store/cart/definitions";

const cartModule = namespace("cart");

@Component({
  name: "ActiveOrderSidebar",
  components: {
    CartHeader,
    CartSummary,
    CartItemsList
  }
})
export default class ActiveOrderSidebar extends Vue {
  @cartModule.Getter("sidebarVisible")
  visible!: boolean;

  @cartModule.Action(HIDE_CART_SIDEBAR)
  hideCartSidebar!: () => void;

  @cartModule.Getter("isLoading")
  private isLoading!: boolean;

  @cartModule.Getter("cart")
  cart!: ShoppingCart;

  @cartModule.Action(FETCH_CART)
  fetchCart!: () => void;

  @cartModule.Action(DELETE_ITEM_FROM_CART)
  deleteLineItem!: (id: string) => void;

  @cartModule.Action(CHANGE_ITEM_QUANTITY)
  changeLineItemQuantity!: (payload: ChangeCartItemQty) => void;

  @cartModule.Action(CLEAR_CART)
  clearCart!: () => void;

  @cartModule.Action(CHECKOUT)
  checkout!: () => void;

  mounted() {
    this.fetchCart();
  }

  get canCheckout() {
    return !!this.cart && this.cart!.isValid && this.cart!.itemsCount! > 0;
  }

  public async confirmDeleteItem(item: CartLineItem): Promise<void> {
    const result = await this.$bvModal.msgBoxConfirm(
      i18n.t("shopping-cart.confirm-delete-modal.message", [item.sku]) as string,
      {
        size: "md",
        buttonSize: "md",
        title: i18n.t("shopping-cart.confirm-delete-modal.title") as string,
        okTitle: i18n.t("shopping-cart.confirm-delete-modal.ok") as string,
        cancelTitle: i18n.t("shopping-cart.confirm-delete-modal.cancel") as string,
        footerClass: ["p-2", "flex-row-reverse justify-content-start"],
        hideHeaderClose: false,
        centered: true
      }
    );

    if (result) {
      this.deleteLineItem(item.id!);
    }
  }

  public async confirmClearCart(): Promise<void> {
    const result = await this.$bvModal.msgBoxConfirm(i18n.t("shopping-cart.confirm-clear-modal.message") as string, {
      size: "md",
      buttonSize: "md",
      title: i18n.t("shopping-cart.confirm-clear-modal.title") as string,
      okTitle: i18n.t("shopping-cart.confirm-clear-modal.ok") as string,
      cancelTitle: i18n.t("shopping-cart.confirm-clear-modal.cancel") as string,
      footerClass: ["p-2", "flex-row-reverse justify-content-start"],
      hideHeaderClose: false,
      centered: true
    });

    if (result) {
      this.clearCart();
    }
  }

  public async confirmCheckout(): Promise<void> {
    const result = await this.$bvModal.msgBoxConfirm(
      i18n.t("shopping-cart.confirm-checkout-modal.message", [
        this.cart!.total!.formattedAmount,
        this.cart!.itemsQuantity
      ]) as string,
      {
        size: "md",
        buttonSize: "md",
        title: i18n.t("shopping-cart.confirm-checkout-modal.title") as string,
        okTitle: i18n.t("shopping-cart.confirm-checkout-modal.ok") as string,
        cancelTitle: i18n.t("shopping-cart.confirm-checkout-modal.cancel") as string,
        footerClass: ["p-2", "flex-row-reverse justify-content-start"],
        hideHeaderClose: false,
        centered: true
      }
    );

    if (result) {
      this.checkout();
    }
  }

  public changeQuantity(item: CartLineItem, quantity: number): void {
    const changeItemQty = new ChangeCartItemQty();
    changeItemQty.lineItemId = item.id;
    changeItemQty.quantity = quantity;
    this.changeLineItemQuantity(changeItemQty);
  }

  public hide(): void {
    this.hideCartSidebar();
  }
}
