import { getCurrentInstance } from "vue";

export default function useComponentId(prefix = ""): string {
  const uid = getCurrentInstance()!.uid.toString();
  return prefix ? prefix + "-" + uid : uid;
}
