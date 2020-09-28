<template>
  <div class="d-flex">
    <button class="btn btn-sm text-primary" @click="decrement()">
      <font-awesome-icon :icon="minusIcon" size="lg"></font-awesome-icon>
    </button>
    <div>
      <input v-only-number
             type="text"
             class="form-control form-control-sm text-center"
             :value="model"
             @blur="textChanged($event.target.value)"
             @keyup.enter="textChanged($event.target.value)">
    </div>
    <button class="btn btn-sm text-primary" @click="increment()">
      <font-awesome-icon :icon="plusIcon" size="lg"></font-awesome-icon>
    </button>
  </div>
</template>

<script lang="ts" src="./change-item-quantity.ts"></script>
