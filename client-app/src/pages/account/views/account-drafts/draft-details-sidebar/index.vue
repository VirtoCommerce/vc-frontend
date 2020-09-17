<template>
  <b-sidebar id="draft-details"
             :visible="showSidebar"
             body-class="pr-4"
             right
             shadow
             @hidden="closeSidebar">
    <b-overlay :show="isLoading"
               rounded="sm"
               :opacity="0.33"
               class="h-100">
      <div v-if="selectedDraft">
        <div v-if="selectedDraft.items.length > 0" class="cart-header  pl-4">
          <cart-header
            :cart="selectedDraft"
            :title="selectedDraft.name"
            @clear-cart-clicked="confirmClearDraft"></cart-header>
        </div>

        <div class="cart-list pl-4 pr-4">
          <cart-items-list
            :items="selectedDraft.items"
            @item-deleted="confirmDeleteItem"
            @quantity-changed="changeQuantity">
          </cart-items-list>
        </div>

        <div v-if="selectedDraft.items.length == 0" class="d-flex flex-column">
          <span class="align-self-center">{{ $t("account.drafts.empty-draft") }}</span>
        </div>

        <div class="cart-footer pl-4 pr-4">
          <cart-summary
            :cart="selectedDraft">
          </cart-summary>
          <div class="d-flex justify-content-center">
            <button class="btn btn-primary w-75 text-center mt-3 checkout-button"
                    :disabled="!canCheckout"
                    @click="confirmCheckout">
              {{ $t("shopping-cart.checkout") }}
            </button>
          </div>
        </div>
      </div>
    </b-overlay>
  </b-sidebar>
</template>

<script lang="ts" src="./draft-details-sidebar.ts"></script>
