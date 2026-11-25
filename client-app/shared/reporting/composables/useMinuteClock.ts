import { createSharedComposable, useNow } from "@vueuse/core";

// One minute clock for every report on the page: it moves the date windows on at midnight. A minute is the finest
// unit the report needs.
export const useMinuteClock = createSharedComposable(() => useNow({ interval: 60_000 }));
