<template>
  <div>
    <router-link :to="{ name: 'NewsArticle', params: { articleId: newsArticle.id } }">
      {{ newsArticle.title }}
    </router-link>
  </div>
  <div>
    {{ newsArticle.contentPreview }}
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
