import Vue from "vue";
import Component from "vue-class-component";
import { Route, RawLocation } from 'vue-router';
import { namespace } from "vuex-class";
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { BvTableFieldArray } from "bootstrap-vue";
import i18n from "@i18n";
import AddDraftModal from "libs/order-draft/components/add-draft-modal/index.vue";
import DraftsFilter from "libs/order-draft/components/drafts-filter/index.vue";
import { SET_DRAFTS_SEARCH_CRITERIA, ADD_DRAFT, DELETE_DRAFT, SET_SELECTED_DRAFT } from "libs/order-draft/store/drafts-list/definitions";
import DraftDetailsSidebar from '@account/views/account-drafts/draft-details-sidebar/index.vue';
import { ICartSearchCriteria, IShoppingCartSearchResult, CartSearchCriteria, ShoppingCart, IShoppingCart } from "@core/api/api-clients";
import { pageSizes, startPageNumber } from "@core/constants";
import { CartSearchQuery } from '@core/models/search/extensions/cart-search-query';
import { QueryBuilder } from "@core/services/query-builder.service";

const draftsListModule = namespace("draftsListModule");

@Component({
  components: {
    AddDraftModal,
    DraftsFilter,
    DraftDetailsSidebar
  },
  beforeRouteUpdate: function (to: Route, from: Route, next: (to?: RawLocation | false | ((vm: AccountDrafts) => any) | void) => void) {
    (this as AccountDrafts).buildSearchCriteria(to);
    next();
  }
})
export default class AccountDrafts extends Vue {
  @draftsListModule.Getter("isLoading")
  private isLoading!: boolean;

  @draftsListModule.Getter("columns")
  private columns!: BvTableFieldArray;

  @draftsListModule.Getter("searchCriteria")
  private searchCriteria!: ICartSearchCriteria;

  @draftsListModule.Action(SET_DRAFTS_SEARCH_CRITERIA)
  private setSearchCriteria!: (searchCriteria: ICartSearchCriteria) => void;

  @draftsListModule.Getter("drafts")
  private drafts!: IShoppingCartSearchResult;

  @draftsListModule.Action(SET_SELECTED_DRAFT)
  private selectDraft!: (draft: IShoppingCart) => void;

  @draftsListModule.Action(ADD_DRAFT)
  private addDraft!: (draftName: string) => void;

  @draftsListModule.Action(DELETE_DRAFT)
  private deleteDraft!: (draftId: string[]) => void;

  pageSizes = pageSizes;

  showDraftDetailsSidebar = false;

  deleteIcon = faTrashAlt;

  queryBuilder = new QueryBuilder(CartSearchCriteria, CartSearchQuery);

  mounted() {
    this.buildSearchCriteria(this.$route, this.searchCriteria);
  }

  public pageChanged(pageNumber: number): void {
    this.searchCriteriaChanged({
      ...this.searchCriteria,
      pageNumber
    });
  }

  public pageSizeChanged(pageSize: number): void {
    this.searchCriteriaChanged({
      ...this.searchCriteria,
      pageNumber: startPageNumber,
      pageSize
    });
  }

  public checkActivePageSize(pageSize: number): boolean {
    return pageSize == this.searchCriteria.pageSize ? true : false;
  }

  public searchCriteriaChanged(searchCriteria: ICartSearchCriteria): void {
    const query = this.queryBuilder.buildQuery(new CartSearchCriteria(searchCriteria));
    this.$router.push({
      ...this.$route,
      // Workaround for miscompatibility in vue router types
      name: this.$route.name || undefined,
      query
    });
  }

  public showDraftDetails(draft: ShoppingCart): void {
    this.selectDraft(draft);
    this.showDraftDetailsSidebar = true;
  }

  public sidebarClosed(): void {
    this.showDraftDetailsSidebar = false;
  }

  public draftAdded(draftName: string): void {
    this.addDraft(draftName);
  }

  public async confirmDeleteDraft(draft: ShoppingCart): Promise<void> {
    const value = await this.$bvModal.msgBoxConfirm(i18n.t('account.drafts.confirm-delete-modal.message', [ draft.name ]) as string, {
      size: 'md',
      buttonSize: 'md',
      title: i18n.t('account.drafts.confirm-delete-modal.title') as string,
      okTitle: i18n.t('account.drafts.confirm-delete-modal.ok') as string,
      cancelTitle: i18n.t('account.drafts.confirm-delete-modal.cancel') as string,
      footerClass: ['p-2', 'flex-row-reverse justify-content-start'],
      hideHeaderClose: false,
      centered: true
    });
    if (value) {
      this.showDraftDetailsSidebar = false;
      this.deleteDraft([draft.id!]);
    }
  }

  private buildSearchCriteria(route: Route, initialSearchCriteria?: ICartSearchCriteria): void {
    const searchCriteria = this.queryBuilder.parseQuery(route.query);
    this.setSearchCriteria({
      ...initialSearchCriteria,
      ...searchCriteria
    });
  }

}
