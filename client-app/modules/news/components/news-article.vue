<template>
  <div v-if="newsArticle">
    <div>
      {{ newsArticle.title }}
    </div>
    <div>
      {{ newsArticle.content }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRef } from "vue";
import type { NewsArticleContent } from "../api/graphql/types";

interface IProps {
  newsArticle: NewsArticleContent;
}
const props = defineProps<IProps>();
const newsArticle = toRef(props, "newsArticle");
</script>
