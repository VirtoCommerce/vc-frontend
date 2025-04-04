<template>
  <div v-if="pageBuilderContent">
    <template v-for="item in pageBuilderContent.content">
      <component
        :is="item.type"
        v-if="!item.hidden"
        :key="item.id"
        v-bind="item"
        :model="item"
        :settings="pageBuilderContent.settings"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, shallowRef } from "vue";

interface IProps {
  content?: string;
}

type BlockType = { [key: string]: unknown };

interface IPageBuilderContent {
  settings: BlockType;
  content: BlockType[];
}

const props = defineProps<IProps>();

const canShowContent = shallowRef(false);
const pageBuilderContent = shallowRef<IPageBuilderContent | null>(null);

function clearState() {
  pageBuilderContent.value = null;
  canShowContent.value = false;
}

onBeforeMount(() => {
  if (props.content) {
    trySetContent();
  } else {
    clearState();
  }
});

function trySetContent() {
  if (!props.content) {
    return;
  }
  const blocks = <IPageBuilderContent>JSON.parse(props.content);
  pageBuilderContent.value = blocks;
  canShowContent.value = true;
}
</script>
