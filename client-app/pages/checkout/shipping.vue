<template>
  <VcSectionWidget :title="'Specify shipping details'" icon="truck">
    <div>Shipping</div>
  </VcSectionWidget>

  <!-- Comment -->
  <VcSectionWidget
    :title="'Order comment'"
    icon="document-text"
    content-classes="px-6 pb-1 pt-4 lg:px-7 lg:pb-2"
  >
    <div class="text-base leading-5 font-bold lg:text-15">
      {{ $t("pages.account.quote_details.remarks_field_label") }}
    </div>

    <VcTextArea
      :max-length="1000"
      :rows="4"
      class="mt-2 py-2 px-3 text-15 leading-5 font-medium resize-none lg:mt-1"
      counter
    />
  </VcSectionWidget>
</template>

<script setup lang="ts"></script>
