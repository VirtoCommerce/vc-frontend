<template>
  <div class="mt-3">
    <invoices-filter :search-criteria="searchCriteria"
                     :available-invoices-statuses="availableInvoicesStatuses"
                     @searchCriteriaChanged="searchCriteriaChanged"></invoices-filter>
    <div class="mt-3">
      <p>{{ $t("account.invoices.grid.text-above") }}</p>
      <b-overlay :show="isLoading"
                 rounded="sm"
                 :variant="'white'"
                 :opacity="0.69">
        <b-table
          id="invoices-table"
          stacked="md"
          striped
          borderless
          hover
          tbody-tr-class="text-break"
          :show-empty="true"
          :empty-text="$t('account.invoices.no-invoices')"
          :items="invoices.results"
          :fields="columns"
          no-local-sorting
          @sort-changed="sortChanged">
          <template v-slot:cell(createdDate)="data">
            <span>{{ data.value | moment("LL") }}</span>
          </template>
          <template v-slot:cell(actions)="row">
            <font-awesome-layers v-b-tooltip.hover
                                 :title="$t('account.invoices.download-invoice')"
                                 class="btn"
                                 @click="getInvoicePdf(row.item.orderId)">
              <font-awesome-icon :icon="downloadIcon" size="lg"></font-awesome-icon>
            </font-awesome-layers>
          </template>
        </b-table>

        <div class="d-flex justify-content-between">
          <b-pagination
            :value="searchCriteria.pageNumber"
            aria-controls="invoices-table"
            :total-rows="invoices.totalCount"
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
      <p>{{ $t("account.invoices.grid.text-below") }}</p>
    </div>
  </div>
</template>

<script lang="ts" src="./account-invoices.ts"></script>
