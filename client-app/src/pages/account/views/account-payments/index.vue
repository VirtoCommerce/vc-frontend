<template>
  <div class="mt-3">
    <payments-filter :search-criteria="searchCriteria" @searchCriteriaChanged="searchCriteriaChanged"></payments-filter>
    <div class="mt-3">
      <p>{{ $t("account.payments.grid.text-above") }}</p>
      <b-overlay id="payments-table"
                 :show="isLoading"
                 rounded="sm"
                 :variant="'white'"
                 :opacity="0.69">
        <b-table
          stacked="md"
          striped
          borderless
          hover
          tbody-tr-class="text-break"
          :show-empty="true"
          :empty-text="$t('account.payments.no-payments')"
          :items="payments.results"
          :fields="columns"
          no-local-sorting
          @sort-changed="sortChanged">
          <template v-slot:cell(capturedDate)="data">
            <span>{{ data.value | moment("LL") }}</span>
          </template>
        </b-table>

        <div class="d-flex justify-content-between">
          <b-pagination
            :value="searchCriteria.pageNumber"
            aria-controls="payments-table"
            :total-rows="payments.totalCount"
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
              <b-dropdown-item
                v-for="pageSize in pageSizes"
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
      <p>{{ $t("account.payments.grid.text-below") }}</p>
    </div>
  </div>
</template>

<script lang="ts" src="./account-payments.ts"></script>
