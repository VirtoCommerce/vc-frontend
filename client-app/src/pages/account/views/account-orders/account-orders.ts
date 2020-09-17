import Vue from "vue";
import Component from "vue-class-component";
import { Route, RawLocation } from 'vue-router';
import { namespace } from "vuex-class";
import { BvTableCtxObject, BvTableFieldArray } from "bootstrap-vue";
import { ICustomerOrderSearchResult, IOrderSearchCriteria, ICustomerOrder, OrderSearchCriteria } from "core/api/api-clients";
import { pageSizes, ordersStatuses, sortDescending, sortAscending, startPageNumber } from "core/constants";
import { OrderSearchQuery } from "core/models/search/extensions/order-search-query";
import { QueryBuilder } from 'core/services/query-builder.service';
import OrderDetailsModal from "libs/order/components/order-details-modal/index.vue";
import OrderFilter from "libs/order/components/orders-filter/index.vue";
import { SET_ORDERS_SEARCH_CRITERIA, FETCH_SELECTED_ORDER, CLEAR_SELECTED_ORDER } from "libs/order/store/orders-list/definitions";
import "core/models/search/extensions/order-search-criteria";

const ordersListModule = namespace("ordersListModule");

@Component({
  components: {
    OrderDetailsModal,
    OrderFilter
  },
  beforeRouteUpdate: function (to: Route, from: Route, next: (to?: RawLocation | false | ((vm: AccountOrders) => any) | void) => void) {
    (this as AccountOrders).buildSearchCriteria(to);
    next();
  }
})
export default class AccountOrders extends Vue {
  @ordersListModule.Getter("isLoading")
  private isLoading!: boolean;

  @ordersListModule.Getter("columns")
  private columns!: BvTableFieldArray;

  @ordersListModule.Getter("searchCriteria")
  private searchCriteria!: IOrderSearchCriteria;

  @ordersListModule.Action(SET_ORDERS_SEARCH_CRITERIA)
  private setSearchCriteria!: (searchCriteria: IOrderSearchCriteria) => void;

  @ordersListModule.Getter("orders")
  private orders!: ICustomerOrderSearchResult;

  @ordersListModule.Getter("selectedOrder")
  private selectedOrder!: ICustomerOrder | null;

  @ordersListModule.Action(FETCH_SELECTED_ORDER)
  private fetchSelectedOrder!: (orderId: string) => ICustomerOrder;

  @ordersListModule.Action(CLEAR_SELECTED_ORDER)
  private clearSelectedOrder!: () => void;

  pageSizes = pageSizes;

  availableOrderStatuses = ordersStatuses;

  queryBuilder = new QueryBuilder(OrderSearchCriteria, OrderSearchQuery);

  mounted() {
    this.buildSearchCriteria(this.$route, this.searchCriteria);
  }

  public orderDetailsModalHided(): void {
    this.clearSelectedOrder();
  }

  public pageChanged(pageNumber: number): void {
    this.searchCriteriaChanged({ ...this.searchCriteria, pageNumber });
  }

  public pageSizeChanged(pageSize: number): void {
    this.searchCriteriaChanged({ ...this.searchCriteria, pageNumber: startPageNumber, pageSize });
  }

  public sortChanged(ctx: BvTableCtxObject): void {
    const sortDirection = ctx.sortDesc ? sortDescending : sortAscending;
    const sortExpression = `${ctx.sortBy}:${sortDirection}`;
    const searchCriteria = { ...this.searchCriteria, pageNumber: startPageNumber, sort: sortExpression };
    this.searchCriteriaChanged(searchCriteria);
  }

  public checkActivePageSize(pageSize: number): boolean {
    return pageSize == this.searchCriteria.pageSize ? true : false;
  }

  public searchCriteriaChanged(searchCriteria: IOrderSearchCriteria): void {
    const query = this.queryBuilder.buildQuery(new OrderSearchCriteria(searchCriteria));
    this.$router.push({
      ...this.$route,
      // Workaround for miscompatibility in vue router types
      name: this.$route.name || undefined,
      query
    });
  }

  public openOrderDetails(orderId: string): void {
    this.fetchSelectedOrder(orderId);
    this.$bvModal.show("orderDetailsModal");
  }

  private buildSearchCriteria(route: Route, initialSearchCriteria?: IOrderSearchCriteria): void {
    const searchCriteria = this.queryBuilder.parseQuery(route.query);
    this.setSearchCriteria({
      ...initialSearchCriteria,
      ...searchCriteria
    });
  }
}
