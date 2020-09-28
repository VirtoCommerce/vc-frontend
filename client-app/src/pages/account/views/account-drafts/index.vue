<template>
  <div class="mt-3">
    <draft-details-sidebar :show-sidebar="showDraftDetailsSidebar" @sidebar-closed="sidebarClosed"></draft-details-sidebar>
    <add-draft-modal @draftAdded="draftAdded($event)"></add-draft-modal>
    <div class="row flex-sm-row flex-column justify-content-between">
      <drafts-filter
        class="col col-sm-6 col-md-5 col-lg-3"
        :search-criteria="searchCriteria"
        @searchCriteriaChanged="searchCriteriaChanged"></drafts-filter>
      <div class="col col-sm-auto col-md-auto col-lg-auto align-self-sm-end mt-3">
        <b-button
          v-b-modal.addDraftModal
          variant="outline-primary">
          {{ $t("account.drafts.add-draft.add-draft") }}
        </b-button>
      </div>
    </div>
    <div class="mt-3">
      <p>{{ $t("account.drafts.grid.text-above") }}</p>
      <b-overlay :show="isLoading"
                 rounded="sm"
                 :variant="'white'"
                 :opacity="0.69">
        <b-table
          id="drafts-table"
          stacked="md"
          striped
          borderless
          selectable
          hover
          :select-mode="'single'"
          selected-variant="primary"
          :show-empty="true"
          tbody-tr-class="text-break"
          :empty-text="$t('account.drafts.no-drafts')"
          :items="drafts.results"
          :fields="columns"
          aria-controls="draft-details"
          :aria-expanded="showDraftDetailsSidebar"
          no-local-sorting
          @row-clicked="showDraftDetails">
          <template v-slot:cell(actions)="row">
            <font-awesome-layers
              v-b-tooltip.hover
              :title="$t('account.drafts.delete-draft-tooltip')"
              class="btn"
              @click.stop="confirmDeleteDraft(row.item)">
              <font-awesome-icon :icon="deleteIcon" size="lg"></font-awesome-icon>
            </font-awesome-layers>
          </template>
        </b-table>
        <div class="d-flex justify-content-between">
          <b-pagination
            :value="searchCriteria.pageNumber"
            aria-controls="drafts-table"
            :total-rows="drafts.totalCount"
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
      <p>{{ $t("account.drafts.grid.text-below") }}</p>
    </div>
  </div>
</template>

<script lang="ts" src="./account-drafts.ts"></script>
