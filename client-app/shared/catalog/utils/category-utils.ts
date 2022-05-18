import { Category } from "@core/api/graphql/types";

export function getCategoryLink(category: Category): string {
  return `/${category.slug ? category.slug : category.seoInfo?.semanticUrl}`;
}
