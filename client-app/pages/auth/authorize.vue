<template>
  <VcEmptyPage v-if="failed" icon="outline-pass-fail" image="lock.jpg">
    <VcTypography tag="h1">{{ $t("common.ucp.authorization_failed") }}</VcTypography>

    <p>{{ $t("common.ucp.authorization_retry") }}</p>

    <VcButton to="/">{{ $t("common.buttons.home") }}</VcButton>
  </VcEmptyPage>

  <VcLoaderOverlay v-else />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFetch } from "@/core/api/common";
import { toSameOriginPath } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import type { OnFetchErrorContext } from "@vueuse/core";

const route = useRoute();
const router = useRouter();
const failed = ref(false);
const localError = (context: OnFetchErrorContext) => context;

async function handleFailure(status: number | null) {
  if (status === 401) {
    await router.replace({
      name: ROUTES.SIGN_IN.NAME,
      query: { returnUrl: route.fullPath, reauthenticate: "1" },
    });
  } else {
    failed.value = true;
  }
}

onMounted(async () => {
  const returnUrl = typeof route.query.returnUrl === "string" ? toSameOriginPath(route.query.returnUrl) : "";
  if (!/^\/connect\/authorize\?[^#]*$/.test(returnUrl)) {
    failed.value = true;
    return;
  }

  const {
    data,
    error: tokenError,
    statusCode: tokenStatus,
  } = await useFetch("/connect/session", { headers: {} }, { onFetchError: localError })
    .get()
    .json<{ requestToken: string }>();
  if (tokenError.value || !data.value?.requestToken) {
    await handleFailure(tokenStatus.value);
    return;
  }

  const query = new URLSearchParams({ returnUrl });
  const { error, statusCode } = await useFetch(
    `/connect/session?${query}`,
    {
      headers: { RequestVerificationToken: data.value.requestToken },
    },
    { onFetchError: localError },
  ).post();
  if (error.value) {
    await handleFailure(statusCode.value);
    return;
  }

  location.replace(returnUrl);
});
</script>
