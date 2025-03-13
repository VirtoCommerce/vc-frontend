import type { VueHeadClient, MergeHead } from "@unhead/vue";

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
