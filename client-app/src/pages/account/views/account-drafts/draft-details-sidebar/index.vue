<template>
  <b-sidebar id="draft-details"
             :visible="showSidebar"
             body-class="pl-3 pr-3"
             right
             shadow
             @hidden="closeSidebar">
    <b-overlay :show="isLoading"
               rounded="sm"
               :opacity="0.33">
      <div v-if="selectedDraft">
        <div v-if="selectedDraft.items.length > 0">
          <cart-header
            :cart="selectedDraft"
            :title="selectedDraft.name"
            @clear-cart-clicked="confirmClearDraft"></cart-header>
          <cart-summary :cart="selectedDraft"></cart-summary>
          <div class="d-flex justify-content-center">
            <button class="btn btn-outline-primary text-center w-75 mt-3"
                    :disabled="!canCheckout"
                    @click="confirmCheckout">
              {{ $t("shopping-cart.checkout") }}
            </button>
          </div>
          <div class="border-top my-3"></div>
          <cart-items-list
            :items="selectedDraft.items"
            @item-deleted="confirmDeleteItem"
            @quantity-changed="changeQuantity">
          </cart-items-list>
        </div>
        <div v-if="selectedDraft.items.length == 0" class="d-flex flex-column">
          <span class="align-self-center">{{ $t("account.drafts.empty-draft") }}</span>
        </div>
      </div>
    </b-overlay>
  </b-sidebar>
</template>

<script lang="ts" src="./draft-details-sidebar.ts"></script>
