<template>
  <div class="app-add-item-to-draft w-100 h-100" @click.stop.prevent>
    <add-draft-modal @draftAdded="addToNewDraft($event)"></add-draft-modal>
    <b-dropdown ref="dropdown"
                class="w-100 h-100"
                :title="$t('products.general.add_to_order_draft')"
                right
                variant="outline-primary">
      <template v-slot:button-content>
        <i class="fas fa-file-alt"></i>
        <span v-if="textVisible">{{ $t('products.general.add_to_order_draft') }}</span>
      </template>
      <b-overlay :show="isLoading"
                 rounded="sm"
                 :variant="'white'"
                 :opacity="0.69">
        <b-dropdown-item v-b-modal.addDraftModal>
          <font-awesome-icon :icon="plusIcon"></font-awesome-icon> {{ $t('products.general.add_to_new_order_draft') }}
        </b-dropdown-item>
        <b-dropdown-divider v-if="drafts.results.length > 0"></b-dropdown-divider>
        <b-dropdown-item v-for="draft in drafts.results"
                         :key="draft.name"
                         :disabled="isItemDisabled(draft)"
                         @click="addToDraft(draft)">
          {{ draft.name }}
        </b-dropdown-item>
      </b-overlay>
    </b-dropdown>
  </div>
</template>
<script lang="ts" src="./add-to-order-draft-button.ts"></script>
