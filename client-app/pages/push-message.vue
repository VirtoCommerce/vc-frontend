<template>
  <VcLoaderOverlay />
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useMarkPushMessageRead } from "@/core/api/graphql/push-messages/mutations/markPushMessageRead";
import { getReturnUrlValue } from "@/core/utilities";

const props = withDefaults(defineProps<IProps>(), {
  messageId: "",
});

interface IProps {
  messageId?: string;
}

const router = useRouter();
const { mutate: markRead } = useMarkPushMessageRead();
const returnUrl = getReturnUrlValue() ?? "/";

onMounted(async () => {
  await markRead({ command: { messageId: props.messageId } });
  await router.push({ path: returnUrl });
});
</script>
