<template>
  <div v-if="searchCriteria">
    <div class="row flex-sm-row flex-column">
      <div class="col col-sm-6 col-md-5 col-lg-4">
        <label for="begin-date">{{ $t("account.payments.date-filter.from") }}</label>
        <b-form-datepicker
          id="begin-date"
          :value="searchCriteria.startDate"
          value-as-date
          reset-button
          :label-reset-button="$t('account.payments.date-filter.reset')"
          :date-format-options="{ year: 'numeric', month: 'long', day: 'numeric' }"
          :max="new Date()"
          :class="{ 'is-invalid': !isDateValid && isDateValid != null }"
          :locale="locale"
          v-bind="datepickerLabels"
          class="mb-2"
          @input="changeStartDate($event)"></b-form-datepicker>
      </div>
      <div class="col col-sm-6 col-md-5 col-lg-4">
        <label for="end-date">{{ $t("account.payments.date-filter.to") }}</label>
        <b-form-datepicker
          id="end-date"
          :value="searchCriteria.endDate"
          value-as-date
          reset-button
          :label-reset-button="$t('account.payments.date-filter.reset')"
          :date-format-options="{ year: 'numeric', month: 'long', day: 'numeric' }"
          :max="new Date()"
          :class="{ 'is-invalid': !isDateValid && isDateValid != null }"
          :locale="locale"
          v-bind="datepickerLabels"
          class="mb-2"
          @input="changeEndDate($event)"></b-form-datepicker>
      </div>
      <div v-if="!isDateValid && isDateValid != null" class="col col-sm-12 col-md-12 col-lg-12">
        <span class="text-danger">{{ $t("account.payments.date-filter.date-error") }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./payments-filter.ts"></script>
