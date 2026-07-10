// View model for the table; mapped from the GraphQL SalesRepContact (see useSalesReps).
// Only active reps ever reach the client — filtering is server-side (AC#5).
export type SalesRepType = { id: string; name: string; email: string; phone: string };
export type SalesRepSortColumnType = "name" | "email" | "phone";
export type SalesRepSortType = { column: SalesRepSortColumnType; direction: "asc" | "desc" };
