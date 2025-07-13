export type Task = {
  id: string;
  title: string;
  description: string;
  status: string; // e.g., "todo", "in-progress", "done"
  createdAt: Date;
};

export type ColumnType = {
  id: string;
  title: string;
  taskIds: string[];
};
