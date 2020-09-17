<template>
  <div>
    <div class="d-flex">
      <div>
        <div class="mr-4 mb-2">
          {{ item.name }}
        </div>
        <div>SKU: {{ item.sku }}</div>
      </div>
      <font-awesome-layers class="btn ml-auto" @click="onItemDeleted">
        <font-awesome-icon :icon="deleteIcon" size="lg"></font-awesome-icon>
      </font-awesome-layers>
    </div>
    <div class="d-flex">
      <div class="font-weight-bold align-self-center cart-row-price">
        {{ item.extendedPrice.formattedAmount }}
      </div>
      <div class="ml-auto item-number rr">
        <change-item-quantity :quantity="item.quantity" @quantity-changed="quantityChanged"></change-item-quantity>
      </div>
    </div>
    <b-form-invalid-feedback v-for="error in item.validationErrors"
                             :key="error.errorCode"
                             :state="false"
                             :force-show="true">
      {{ $t('shopping-cart.errors.'+error.errorCode) }}
    </b-form-invalid-feedback>
  </div>
</template>

<script lang="ts" src="./cart-item.ts"></script>
