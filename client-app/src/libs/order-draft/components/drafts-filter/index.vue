<template>
  <div v-if="searchCriteria">
    <div class="d-flex flex-wrap flex-sm-row flex-column">
      <div class="flex-grow-1 mr-sm-2">
        <label for="keyword-search">{{ $t("account.drafts.search-label") }}</label>
        <b-input-group>
          <b-form-input
            id="keyword-search"
            class="border-right-0"
            type="text"
            :debounce="1000"
            :placeholder="$t('account.drafts.search-placeholder')"
            :value="searchCriteria.keyword"
            @update="changeKeyword($event)"></b-form-input>
          <b-input-group-append>
            <span class="input-group-text bg-white text-primary">
              <font-awesome-icon :icon="searchIcon"></font-awesome-icon>
            </span>
          </b-input-group-append>
        </b-input-group>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./drafts-filter.ts">
