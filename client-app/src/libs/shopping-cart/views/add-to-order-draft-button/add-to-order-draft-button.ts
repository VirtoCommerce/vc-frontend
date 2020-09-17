import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { ShoppingCartSearchResult, AddCartItem, ShoppingCart } from "core/api/api-clients";
import { orderDraftType } from "core/constants";
import AddDraftModal from "libs/order-draft/components/add-draft-modal/index.vue";
import { ADD_DRAFT, ADD_ITEM_TO_DRAFT } from "libs/order-draft/store/drafts-list/definitions";

const draftModule = namespace("draftsListModule");

@Component({
  name: "AddToDraftButton",
  components: {
    AddDraftModal
  }
})
export default class AddToDraftButton extends Vue {

  plusIcon = faPlusCircle;

  @draftModule.Getter("isLoading")
  isLoading!: boolean;

  @Prop()
  productId!: string;

  @Prop()
  textVisible!: boolean;

  @draftModule.Getter("drafts")
  drafts!: ShoppingCartSearchResult[];

  @draftModule.Action(ADD_DRAFT)
  addNewDraft!: (draftName: string) => void;

  @draftModule.Action(ADD_ITEM_TO_DRAFT)
  addItemToDraft!: (criteria: AddCartItem) => void;


  public async addToNewDraft(draftName: string): Promise<void> {
    (this.$refs.dropdown as any).hide();
    await this.addNewDraft(draftName);
    const addItemToDraft = new AddCartItem();
    addItemToDraft.type = orderDraftType;
    addItemToDraft.productId = this.productId;
    addItemToDraft.listName = draftName;
    addItemToDraft.quantity = 1;
    await this.addItemToDraft(addItemToDraft);
  }

  public async addToDraft(draft: ShoppingCart): Promise<void> {
    const addItemToDraft = new AddCartItem();
    addItemToDraft.type = draft.type;
    addItemToDraft.productId = this.productId;
    addItemToDraft.listName = draft.name;
    addItemToDraft.quantity = 1;
    await this.addItemToDraft(addItemToDraft);
  }

  public isItemDisabled(draft: ShoppingCart): boolean | undefined {
    return draft.items?.some(x => x.productId == this.productId);
  }

}
