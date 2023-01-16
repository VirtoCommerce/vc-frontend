<template>
  <VcSectionWidget :title="'Specify shipping details'" icon="truck"></VcSectionWidget>

  <VcSectionWidget :title="'Order comment'" icon="document-text">
    <VcTextarea label="Normal input" placeholder="Please enter value" :max-length="1000" :rows="4" counter />
  </VcSectionWidget>
</template>

<script setup lang="ts"></script>
