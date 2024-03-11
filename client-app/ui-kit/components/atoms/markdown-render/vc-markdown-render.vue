<template>
  <div v-html-safe="markdown" class="vc-markdown-render" />
</template>

<script setup lang="ts">
import DOMPurify from "dompurify";
import { marked } from "marked";
import { computed } from "vue";

interface IProps {
  src: string;
}

const props = defineProps<IProps>();

const markdown = computed(() => DOMPurify.sanitize(marked(props.src) as string, { USE_PROFILES: { html: true } }));
</script>

<style lang="scss">
.vc-markdown-render {
  font-size: 1rem;
  line-height: 1.5rem;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  img,
  blockquote,
  pre,
  ul,
  ol,
  dl,
  hr {
    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }

  li,
  dt,
  dd {
    &:not(:last-child) {
      margin-bottom: 8px;
    }

    & > ul,
    & > ol,
    & > dl {
      margin-top: 8px;
    }
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    line-height: 2.75rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;

    @media (screen(lg)) {
      font-size: 2.25rem;
      line-height: 2.875rem;
    }
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 2.25rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;

    @media (screen(lg)) {
      font-size: 1.875rem;
      line-height: 2.5rem;
    }
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;

    @media (screen(lg)) {
      font-size: 1.625rem;
      line-height: 2.375rem;
    }
  }

  h4 {
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.675rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;

    @media (screen(lg)) {
      font-size: 1.5rem;
      line-height: 2rem;
    }
  }

  h5 {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.75rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  h6 {
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  a[href] {
    color: var(--color-accent-600);

    &:hover {
      color: var(--color-accent-700);
    }
  }

  ul {
    margin-left: 20px;
    list-style-type: disc;

    ul {
      list-style-type: circle;
    }
  }

  ol {
    margin-left: 16px;
    list-style-type: decimal;

    li {
      padding-left: 4px;
    }
  }

  dt {
    font-weight: 700;
  }

  dd {
    margin-left: 16px;
  }

  blockquote {
    padding: 12px 24px;
    border-left: 4px solid theme("colors.gray.400");
    border-radius: 0 4px 4px 0;
    background-color: theme("colors.gray.100");
  }

  pre {
    overflow: auto;
    padding: 16px;
    font-size: 85%;
    line-height: 1.45;
    background-color: theme("colors.gray.100");
    border-radius: 4px;
  }

  code {
    background-color: theme("colors.gray.100");
    border-radius: 3px;
    font-family: monospace;
    padding: 0 3px;
  }

  img {
    display: block;
    max-width: 100%;
    border-radius: 4px;
    object-position: 50% 50%;
    object-fit: contain;
  }

  table {
    table-layout: auto;
    width: 100%;

    th {
      padding: 8px 12px;
      background: theme("colors.gray.100");
      font-weight: 700;
      text-align: left;
    }

    td {
      width: 50%;
      padding: 8px 12px;
      border-bottom: 1px solid theme("colors.gray.100");
      vertical-align: top;

      &:first-child {
        width: 40%;
      }

      &:not(:first-child) {
        border-left: 1px solid theme("colors.gray.100");
      }
    }
  }
}
</style>
