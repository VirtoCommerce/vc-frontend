<template>
  <div class="min-h-screen">
    <VcLoaderOverlay no-bg />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useMarkPushMessageRead } from "@/core/api/graphql/push-messages/mutations/markPushMessageRead";
import { useRouteQueryParam } from "@/core/composables";

const props = withDefaults(defineProps<IProps>(), {
  messageId: "",
});

interface IProps {
  messageId?: string;
}

const { mutate: markRead } = useMarkPushMessageRead();
const redirectQueryParam = useRouteQueryParam<string>("redirect", {
  defaultValue: "/",
});

onMounted(async () => {
  await markRead({ command: { messageId: props.messageId } });
  window.open(redirectQueryParam.value, "_self");
});
</script>
