import type { WhiteLabelingSettingsType } from "@/core/api/graphql/types";
import type { EventBusKey } from "@vueuse/core";

export const WHITE_LABELING_FETCHED_SETTINGS_EVENT: EventBusKey<WhiteLabelingSettingsType> = Symbol("symbol-key");
