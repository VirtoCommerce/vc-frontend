import type { VueHeadClient, MergeHead, Meta } from "@unhead/vue";
import type { ComputedRef } from "vue";

let headInstance: VueHeadClient<MergeHead>;

export function setHeadInstance(head: VueHeadClient<MergeHead>) {
  headInstance = head;
}

export function getHeadInstance() {
  if (!headInstance) {
    throw new Error("Head is not initialized yet. Ensure runner is called first.");
  }
  return headInstance;
}

export function setSeoMeta(seoData: {
  title?: string;
  description?: string;
  ogTitle?: string | ComputedRef<string | undefined>;
  ogDescription?: string | ComputedRef<string | undefined>;
  ogImage?: string | ComputedRef<string | undefined>;
  ogUrl?: string | ComputedRef<string>;
  ogType?: string;
}) {
  const head = getHeadInstance();

  const meta: Meta[] = [];
  if (seoData.description) {
    meta.push({ name: "description", content: seoData.description });
  }
  if (seoData.ogTitle) {
    meta.push({ property: "og:title", content: seoData.ogTitle });
  }
  if (seoData.ogDescription) {
    meta.push({ property: "og:description", content: seoData.ogDescription });
  }
  if (seoData.ogImage) {
    meta.push({ property: "og:image", content: seoData.ogImage });
  }
  if (seoData.ogUrl) {
    meta.push({ property: "og:url", content: seoData.ogUrl });
  }
  if (seoData.ogType) {
    meta.push({ property: "og:type", content: seoData.ogType });
  }

  head.push({
    title: seoData.title,
    meta,
  });
}
