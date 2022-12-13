<template>
  <div class="vc-markdown" v-html="markdown"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const markdown = computed(() => DOMPurify.sanitize(marked(props.src), { USE_PROFILES: { html: true } }));
</script>

<style lang="scss">
.vc-markdown {
  font-size: 1rem;
  line-height: 1.5rem;

  *:not(a, li, dt) {
    margin-bottom: 20px;

    &:first-child {
      margin-bottom: 0;
    }
  }

  hr {
    margin: 20px 0;
  }

  table {
    & + table {
      margin-top: -20px;
    }
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    line-height: 2.75rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;

    @media (min-width: theme("screens.lg")) {
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

    @media (min-width: theme("screens.lg")) {
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

    @media (min-width: theme("screens.lg")) {
      font-size: 1.625rem;
      line-height: 2.375rem;
    }
  }

  h4 {
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.675rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;

    @media (min-width: theme("screens.lg")) {
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
    color: var(--color-link);

    &:hover {
      color: var(--color-link-hover);
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
    border-left: 4px solid var(--color-markdown-dark);
    border-radius: 0 4px 4px 0;
    background-color: var(--color-markdown-light);

    *::before {
      content: "\201C";
      color: var(--color-markdown-dark);
      font-size: 150%;
      font-weight: 700;
    }

    *::after {
      content: "\201D";
      color: var(--color-markdown-dark);
      font-size: 150%;
      font-weight: 700;
    }
  }

  pre {
    overflow: auto;
    padding: 16px;
    font-size: 85%;
    line-height: 1.45;
    background-color: var(--color-markdown-light);
    border-radius: 4px;
  }

  code {
    background-color: var(--color-markdown-light);
    color: var(--color-secondary);
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
      background: var(--color-markdown-light);
      color: var(--color-secondary);
      font-weight: 700;
      text-align: left;
    }

    td {
      width: 50%;
      padding: 8px 12px;
      border-bottom: 1px solid var(--color-markdown-light);
      vertical-align: top;

      &:first-child {
        width: 40%;
      }

      &:not(:first-child) {
        border-left: 1px solid var(--color-markdown-light);
      }
    }
  }
}
</style>
