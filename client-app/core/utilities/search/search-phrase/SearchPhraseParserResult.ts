import type { Filter } from "@/core/types";

export class SearchPhraseParseResult {
  constructor(public keyword: string, public filters: Filter[]) {}
}
