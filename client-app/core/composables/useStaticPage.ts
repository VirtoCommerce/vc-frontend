import { ref } from "vue";

const pageTemplate = ref<any>({});

export default function useStaticPage(data: any = null) {
  if (data) {
    pageTemplate.value = data;
  }
  return pageTemplate;
}
