<template>
  <div v-if="searchCriteria">
    <div class="d-flex flex-wrap flex-sm-row flex-column">
      <div class="flex-grow-1 mr-sm-2">
        <label for="keyword-search">{{ $t("account.users.keyword") }}</label>
        <b-form-input
          id="keyword-search"
          type="text"
          :debounce="1000"
          :placeholder="$t('account.users.keyword')"
          :value="searchCriteria.keyword"
          @update="changeKeyword($event)"></b-form-input>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./users-filter.ts">


