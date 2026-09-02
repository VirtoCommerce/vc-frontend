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

/** What a single calendar day carries, for the dots: presence of each condition, never a count. */
export type SalesRepTaskDayMarkersType = Record<string, SalesRepTaskStatusType[]>;

export type SalesRepTaskCountsType = {
  all: number;
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
