<template>
  <VcButton target="_blank" :size="size" prepend-icon="location-marker" :external-link="link">{{
    $t("pages.account.order_details.bopis.get_directions")
  }}</VcButton>
</template>

<script setup lang="ts">
type IProps = {
  size?: VcButtonSizeType;
  link: string;
};

withDefaults(defineProps<IProps>(), {
  size: "xs",
});
</script>
