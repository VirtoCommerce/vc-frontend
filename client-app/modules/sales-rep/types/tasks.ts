/** Derived, never stored. The backend exposes isActive/completed/dueDate and leaves the reading to us. */
export type SalesRepTaskStatusType = "upcoming" | "overdue" | "completed" | "canceled";

export type SalesRepTaskType = {
  id: string;
  name: string;
  description: string;
  type: string;
  priority: string;
  /** ISO instant. Always present on a task a rep created — the create/update inputs declare it non-null. */
  dueDate?: string;
  isActive: boolean;
  completed?: boolean;
  status: SalesRepTaskStatusType;
};

/** What a calendar day carries: which conditions to dot, and how many tasks are due on it. */
export type SalesRepTaskDayType = {
  /** Presence of each condition, never a count — ten overdue tasks on a day carry one "overdue". */
  kinds: SalesRepTaskStatusType[];
  /** Announced, not drawn: there is no room for a dot per task, but plenty in the description. */
  count: number;
};

export type SalesRepTaskDayMarkersType = Record<string, SalesRepTaskDayType>;

export type SalesRepTaskCountsType = {
  /** Tasks due on the selected day — what the baseline chip lists, unlike the status tabs spanning every date. */
  day: number;
  upcoming: number;
  overdue: number;
  completed: number;
};

export type SalesRepTaskInputType = {
  name: string;
  dueDate: string;
  description?: string;
  type?: string;
  priority?: string;
};
