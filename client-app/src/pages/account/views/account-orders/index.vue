<template>
  <div class="mt-3">
    <order-details-modal :order="selectedOrder"
                         :show-details="true"
                         :show-order-details="false"
                         @hide="orderDetailsModalHided()">
    </order-details-modal>
    <order-filter :search-criteria="searchCriteria"
                  :available-order-statuses="availableOrderStatuses"
                  @searchCriteriaChanged="searchCriteriaChanged"></order-filter>
    <div>
      <p>{{ $t("account.orders.grid.text-above") }}</p>
      <b-overlay :show="isLoading"
                 rounded="sm"
                 :variant="'white'"
                 :opacity="0.69">
        <b-table
          id="orders-table"
          stacked="md"
          striped
          borderless
          hover
          tbody-tr-class="text-break"
          :show-empty="true"
          :empty-text="$t('account.orders.no-orders')"
          :items="orders.results"
          :fields="columns"
          no-local-sorting
          @sort-changed="sortChanged">
          <template v-slot:cell(number)="data">
            <a class="text-primary btn d-inline p-0" @click="openOrderDetails(data.value)">
              {{ data.value }}
            </a>
          </template>
          <template v-slot:cell(createdDate)="data">
            <span>{{ data.value | moment("LL") }}</span>
          </template>
        </b-table>

        <div class="d-flex justify-content-between">
          <b-pagination
            :value="searchCriteria.pageNumber"
            aria-controls="orders-table"
            :total-rows="orders.totalCount"
            :per-page="searchCriteria.pageSize"
            @change="pageChanged($event)"></b-pagination>
          <div>
            <b-dropdown
              id="page-sizes"
              class="form-control p-0"
              right
              variant="outline"
              menu-class="pt-0 pb-0"
              toggle-class="d-flex justify-content-between align-items-center">
              <template v-slot:button-content>
                {{ searchCriteria.pageSize }}
              </template>
              <b-dropdown-item v-for="pageSize in pageSizes"
                               :key="pageSize"
                               :active="checkActivePageSize(pageSize)"
                               link-class="pr-0"
                               @click="pageSizeChanged(pageSize)">
                {{ pageSize }}
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </b-overlay>
      <p>{{ $t("account.orders.grid.text-below") }}</p>
    </div>
  </div>
</template>

<script lang="ts" src="./account-orders.ts"></script>
