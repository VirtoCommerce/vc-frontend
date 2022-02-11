<template>
  <div>
    <img :src="model.img" />
  </div>
</template>

<script lang="ts">
// import { ref, reactive, onMounted, watch, unref, watchEffect, Ref, shallowRef } from "vue";
export default {
  props: {
    model: Object,
  },
  methods: {
    onMounted() {
      console.log("image started");
    },
  },
};
</script>
