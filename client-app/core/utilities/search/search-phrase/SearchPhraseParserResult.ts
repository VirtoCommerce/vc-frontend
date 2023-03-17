import type { Filters } from "@/core/types/search/filtering";

export class SearchPhraseParseResult {
  constructor(public keyword: string, public filters: Filters) {}
}
