import Vue from "vue";
import Component from "vue-class-component";
import { Route, RawLocation } from 'vue-router';
import { namespace } from "vuex-class";
import { BvTableCtxObject } from "bootstrap-vue";
import { IPaymentSearchCriteria, IPaymentSearchResult, PaymentSearchCriteria } from 'core/api/api-clients';
import { pageSizes, sortDescending, sortAscending, startPageNumber } from "core/constants";
import { PaymentSearchQuery } from 'core/models/search/extensions/payment-search-query';
import { QueryBuilder } from 'core/services/query-builder.service';
import PaymentsFilter from "libs/payment/components/payments-filter/index.vue";
import { SET_PAYMENTS_SEARCH_CRITERIA } from 'libs/payment/store/payments-list/definitions';
import "core/models/search/extensions/payment-search-criteria";

const paymentsListModule = namespace('paymentsListModule');

@Component({
  components: {
    PaymentsFilter
  },
  beforeRouteUpdate: function (to: Route, from: Route, next: (to?: RawLocation | false | ((vm: AccountPayments) => any) | void) => void) {
    (this as AccountPayments).buildSearchCriteria(to);
    next();
  }
})
export default class AccountPayments extends Vue {
  @paymentsListModule.Getter("isLoading")
  private isLoading!: boolean;

  @paymentsListModule.Getter("columns")
  private columns!: boolean;

  @paymentsListModule.Getter("searchCriteria")
  private searchCriteria!: IPaymentSearchCriteria;

  @paymentsListModule.Action(SET_PAYMENTS_SEARCH_CRITERIA)
  private setSearchCriteria!: (searchCriteria: IPaymentSearchCriteria) => void;

  @paymentsListModule.Getter("payments")
  private payments!: IPaymentSearchResult;

  pageSizes = pageSizes;

  queryBuilder = new QueryBuilder(PaymentSearchCriteria, PaymentSearchQuery);

  mounted() {
    this.buildSearchCriteria(this.$route, this.searchCriteria);
  }

  public pageChanged(pageNumber: number): void {
    this.searchCriteriaChanged({ ...this.searchCriteria, pageNumber });
  }

  public ageSizeChanged(pageSize: number): void {
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

  public searchCriteriaChanged(searchCriteria: IPaymentSearchCriteria): void {
    const query = this.queryBuilder.buildQuery(new PaymentSearchCriteria(searchCriteria));
    this.$router.push({
      ...this.$route,
      // Workaround for miscompatibility in vue router types
      name: this.$route.name || undefined,
      query
    });
  }

  private buildSearchCriteria(route: Route, initialSearchCriteria?: IPaymentSearchCriteria): void {
    const searchCriteria = this.queryBuilder.parseQuery(route.query);
    this.setSearchCriteria({
      ...initialSearchCriteria,
      ...searchCriteria
    });
  }

}
