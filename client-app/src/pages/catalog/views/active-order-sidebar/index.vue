<template>
  <b-sidebar id="draft-details"
             :visible="visible"
             body-class="pl-3 pr-3"
             right
             shadow
             @hidden="hide">
    <b-overlay :show="isLoading"
               rounded="sm"
               :opacity="0.33"
               class="h-100">
      <div v-if="cart">
        <div v-if="cart.itemsCount > 0">
          <cart-header
            :cart="cart"
            :title="$t('shopping-cart.title')"
            @clear-cart-clicked="confirmClearCart"></cart-header>
          <cart-summary :cart="cart"></cart-summary>
          <div class="d-flex justify-content-center">
            <button
              class="btn btn-outline-primary w-75 text-center mt-3"
              :disabled="!canCheckout"
              @click="confirmCheckout()">
              {{ $t("shopping-cart.checkout") }}
            </button>
          </div>
          <div class="border-top my-3"></div>
          <cart-items-list :items="cart.items"
                           @item-deleted="confirmDeleteItem"
                           @quantity-changed="changeQuantity">
          </cart-items-list>
        </div>
        <div v-if="cart.itemsCount == 0" class="d-flex flex-column">
          <span class="align-self-center">
            {{ $t("shopping-cart.empty-message") }}
          </span>
        </div>
      </div>
    </b-overlay>
  </b-sidebar>
</template>

<script lang="ts" src="./active-order-sidebar.ts"></script>
