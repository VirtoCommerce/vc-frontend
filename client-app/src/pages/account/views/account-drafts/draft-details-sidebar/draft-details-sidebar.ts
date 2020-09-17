import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from 'vue-property-decorator';
import { namespace } from "vuex-class";
import i18n from "@i18n";
import { ChangeListItem } from 'libs/order-draft/models/change-list-item';
import { DeleteDraftLineItem } from 'libs/order-draft/models/delete-draft-line-item';
import { DELETE_ITEM_FROM_DRAFT, CLEAR_SELECTED_DRAFT, CHANGE_DRAFT_ITEM_QUANTITY, CHECKOUT } from "libs/order-draft/store/drafts-list/definitions";
import CartHeader from "libs/shopping-cart/components/cart-header/index.vue";
import CartItemsList from "libs/shopping-cart/components/cart-items-list/index.vue";
import CartSummary from "libs/shopping-cart/components/cart-summary/index.vue";
import { ShoppingCart, IShoppingCart, CartLineItem, ChangeCartItemQty } from "@core/api/api-clients";

const draftsListModule = namespace("draftsListModule");

@Component({
  components: {
    CartHeader,
    CartSummary,
    CartItemsList
  }
})
export default class DraftDetailsSidebar extends Vue {
  @Prop()
  showSidebar!: boolean;

  @draftsListModule.Getter("isLoading")
  private isLoading!: boolean;

  @draftsListModule.Getter("selectedDraft")
  private selectedDraft!: ShoppingCart;

  @draftsListModule.Action(CLEAR_SELECTED_DRAFT)
  private clearDraft!: (draft: IShoppingCart) => void;

  @draftsListModule.Action(CHANGE_DRAFT_ITEM_QUANTITY)
  private changeDraftItemQuantity!: (payload: ChangeListItem) => void;

  @draftsListModule.Action(DELETE_ITEM_FROM_DRAFT)
  private deleteDraftLineItem!: (draftLineItem: DeleteDraftLineItem) => void;

  @draftsListModule.Action(CHECKOUT)
  private checkout!: (draftName: string) => void;

  public async confirmDeleteItem(item: CartLineItem): Promise<void> {
    const value = await this.$bvModal.msgBoxConfirm(i18n.t('shopping-cart.confirm-delete-modal.message', [ item.sku ]) as string, {
      size: 'md',
      buttonSize: 'md',
      title: i18n.t('account.drafts.confirm-delete-modal.title') as string,
      cancelTitle: i18n.t('account.drafts.confirm-delete-modal.cancel') as string,
      okTitle: i18n.t('account.drafts.confirm-delete-modal.ok') as string,
      footerClass: ['p-2', 'justify-content-end'],
      hideHeaderClose: false,
      centered: true
    });
    if (value) {
      const payload = new DeleteDraftLineItem(item.id!, this.selectedDraft.name!);
      this.deleteDraftLineItem(payload);
    }
  }

  public async confirmClearDraft(): Promise<void> {
    const value = await this.$bvModal.msgBoxConfirm(i18n.t('account.drafts.confirm-clear-modal.message') as string, {
      size: 'md',
      buttonSize: 'md',
      title: i18n.t('account.drafts.confirm-clear-modal.title') as string,
      cancelTitle: i18n.t('account.drafts.confirm-clear-modal.cancel') as string,
      okTitle: i18n.t('account.drafts.confirm-clear-modal.ok') as string,
      footerClass: ['p-2', 'justify-content-end'],
      hideHeaderClose: false,
      centered: true
    });
    if(value) {
      this.clearDraft(this.selectedDraft);
    }
  }

  public changeQuantity(lineItem: CartLineItem, quantity: number): void {
    const changeItemQty = new ChangeCartItemQty({
      lineItemId: lineItem.id,
      quantity
    });
    const payload = new ChangeListItem(this.selectedDraft.name!, changeItemQty);
    this.changeDraftItemQuantity(payload);
  }

  public closeSidebar(): void {
    this.$emit("sidebar-closed", false);
  }

  public canCheckout(): boolean | undefined {
    return !!this.selectedDraft && this.selectedDraft.isValid && this.selectedDraft.itemsCount! > 0;
  }

  public async confirmCheckout(): Promise<void> {
    const result = await this.$bvModal.msgBoxConfirm(
      i18n.t("shopping-cart.confirm-checkout-modal.message", [
        this.selectedDraft.total!.formattedAmount,
        this.selectedDraft.itemsQuantity
      ]) as string,
      {
        size: "md",
        buttonSize: "md",
        title: i18n.t("shopping-cart.confirm-checkout-modal.title") as string,
        cancelTitle: i18n.t("shopping-cart.confirm-checkout-modal.cancel") as string,
        okTitle: i18n.t("shopping-cart.confirm-checkout-modal.ok") as string,
        footerClass: ["p-2", "justify-content-end"],
        hideHeaderClose: false,
        centered: true
      }
    );

    if (result) {
      this.checkout(this.selectedDraft.name!);
      this.closeSidebar();
    }
  }

}
