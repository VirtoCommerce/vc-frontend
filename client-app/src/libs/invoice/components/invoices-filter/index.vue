<template>
  <div v-if="searchCriteria && availableInvoicesStatuses">
    <div class="row flex-sm-row flex-column">
      <div class="col col-sm-6 col-md-5 col-lg-4">
        <label for="begin-date">{{ $t("account.invoices.date-filter.from") }}</label>
        <b-form-datepicker
          id="begin-date"
          :value="searchCriteria.startDate"
          value-as-date
          reset-button
          :label-reset-button="$t('account.invoices.date-filter.reset')"
          :date-format-options="{ year: 'numeric', month: 'long', day: 'numeric' }"
          :max="new Date()"
          :class="{ 'is-invalid': !isDateValid && isDateValid != null }"
          :locale="locale"
          v-bind="datepickerLabels"
          class="mb-2"
          @input="changeStartDate($event)"></b-form-datepicker>
      </div>
      <div class="col col-sm-6 col-md-5 col-lg-4">
        <label for="end-date">{{ $t("account.invoices.date-filter.to") }}</label>
        <b-form-datepicker
          id="end-date"
          :value="searchCriteria.endDate"
          value-as-date
          reset-button
          :label-reset-button="$t('account.invoices.date-filter.reset')"
          :date-format-options="{ year: 'numeric', month: 'long', day: 'numeric' }"
          :max="new Date()"
          :class="{ 'is-invalid': !isDateValid && isDateValid != null }"
          :locale="locale"
          v-bind="datepickerLabels"
          class="mb-2"
          @input="changeEndDate($event)"></b-form-datepicker>
      </div>
      <div class="d-flex flex-column justify-content-center col-sm-3 col-md-2 col-lg-2">
        <label for="dropdown-filters">{{ $t("account.invoices.status-filter.title") }}</label>
        <b-dropdown
          id="dropdown-filters"
          class="mb-2 form-control rounded p-0"
          variant="outline"
          toggle-class="d-flex justify-content-between align-items-center"
          menu-class="p-2">
          <template v-slot:button-content>
            {{ getCurrentStatusLabel() }}
          </template>
          <b-form-checkbox v-model="allStatusesSelected" @change="toggleAllStatuses">
            {{ $t("account.invoices.status-filter.select-all") }}
          </b-form-checkbox>
          <b-dropdown-divider></b-dropdown-divider>
          <b-form-checkbox-group
            v-model="searchCriteria.statuses"
            :options="availableInvoicesStatuses"
            stacked
            @change="selectedStatusesChanged($event)"></b-form-checkbox-group>
        </b-dropdown>
      </div>
      <div v-if="!isDateValid && isDateValid != null" class="col col-sm-12 col-md-12 col-lg-12">
        <span class="text-danger">{{ $t("account.invoices.date-filter.date-error") }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./invoices-filter"></script>
