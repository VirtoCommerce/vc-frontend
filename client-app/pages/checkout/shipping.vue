<template>
  <VcSectionWidget :title="'Specify shipping details'" icon="truck"></VcSectionWidget>

  <VcSectionWidget :title="'Order comment'" icon="document-text" content-classes="px-6 pb-1 pt-3 lg:px-7 lg:pb-2">
    <VcTextArea :max-length="1000" :rows="4" class="py-2 px-3 text-15 leading-5 font-medium resize-none" counter />
  </VcSectionWidget>
</template>

<script setup lang="ts"></script>
