<template>
  <button class="btn btn-primary p-2"
          @click="onClick">
    <i class="fas fa-shopping-cart"></i> Cart <span class="badge badge-info">{{ itemsQuantity >0? itemsQuantity : "" }}</span>
  </button>
</template>

<script lang="ts" src="./cart-button.ts"></script>

