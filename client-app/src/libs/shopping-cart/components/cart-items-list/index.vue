<template>
  <div>
    <div v-for="item in items"
         :key="item.id">
      <cart-item
        :item="item"
        @item-deleted="onItemDeleted"
        @quantity-changed="onQuantityChanged">
      </cart-item>
      <div class="border-top my-3"></div>
    </div>
  </div>
</template>

<script lang="ts" src="./cart-items-list.ts"></script>
