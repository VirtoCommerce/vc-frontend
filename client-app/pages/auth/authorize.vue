<template>
  <VcLoaderOverlay />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFetch } from "@/core/api/common";
import { toSameOriginPath } from "@/core/utilities";

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const returnUrl = typeof route.query.returnUrl === "string" ? toSameOriginPath(route.query.returnUrl) : "";
  if (!/^\/connect\/authorize\?[^#]*$/.test(returnUrl)) {
    await router.replace("/400");
    return;
  }

  const { data, error: tokenError } = await useFetch("/connect/session", { headers: {} })
    .get()
    .json<{ requestToken: string }>();
  if (tokenError.value || !data.value?.requestToken) {
    await router.replace("/400");
    return;
  }

  const query = new URLSearchParams({ returnUrl });
  const { error } = await useFetch(`/connect/session?${query}`, {
    headers: { RequestVerificationToken: data.value.requestToken },
  }).post();
  if (error.value) {
    await router.replace("/400");
    return;
  }

  location.replace(returnUrl);
});
</script>
