<template>
  <VcLoaderOverlay />
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useMarkPushMessageRead } from "@/core/api/graphql/push-messages/mutations/markPushMessageRead";
import { useRouteQueryParam } from "@/core/composables";

const props = withDefaults(defineProps<IProps>(), {
  messageId: "",
});

interface IProps {
  messageId?: string;
}

const router = useRouter();
const { mutate: markRead } = useMarkPushMessageRead();
const redirectQueryParam = useRouteQueryParam<string>("redirect", {
  defaultValue: "/",
});

onMounted(async () => {
  await markRead({ command: { messageId: props.messageId } });
  await router.push({ path: redirectQueryParam.value });
});
</script>
