<template>
  <b-overlay
    :show="busy"
    rounded
    opacity="0.6"
    spinner-small
    spinner-variant="primary"
    class="app-add-item-to-cart d-inline-block w-100 h-100">
    <button
      class="btn btn-outline-primary w-100 h-100"
      :title="$t('products.general.add_to_cart')"
      @click.prevent="onClick">
      <i class="fas fa-shopping-cart"></i>
      <span v-if="textVisible">{{ $t("products.general.add_to_cart") }}</span>
    </button>
  </b-overlay>
</template>

<script lang="ts" src="./add-to-cart-button.ts"></script>
