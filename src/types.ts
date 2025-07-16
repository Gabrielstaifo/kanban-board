// src/types.ts

export type TaskLabel = "Bug" | "Feature" | "Urgent" | "Improvement" | "";

export type User = {
  id: string;
  name: string;
  avatar: string;
};

export type ActivityEntry = {
  timestamp: string; // ISO date
  type: "created" | "edited" | "moved" | "assigned" | "labelChanged" | "dueDateChanged";
  detail: string;
  user: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  dueDate?: string;
  label?: TaskLabel;
  assigneeId?: string;
  activity?: ActivityEntry[];
};

export type ColumnType = {
  id: string;
  title: string;
  taskIds: string[];
};
