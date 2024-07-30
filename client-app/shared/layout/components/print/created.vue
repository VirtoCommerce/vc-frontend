<template>
  <div class="hidden border border-neutral-100 p-2 text-xs print:block">
    <div class="font-black">{{ $t("common.labels.created_date") }}</div>
    <div class="mt-1">{{ $d(new Date()) }}</div>
  </div>
</template>
