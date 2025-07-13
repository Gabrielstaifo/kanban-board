// src/components/Board.tsx
import React, { useState } from "react";
import Column from "./Column";
import type { Task, ColumnType } from "../types";

// Initial columns and tasks
const initialColumns: ColumnType[] = [
  { id: "todo", title: "To-Do", taskIds: ["1", "2"] },
  { id: "in-progress", title: "In-Progress", taskIds: ["3"] },
  { id: "done", title: "Done", taskIds: [] },
];

const initialTasks: { [id: string]: Task } = {
  "1": {
    id: "1",
    title: "Design UI",
    description: "Sketch the first version of the board UI.",
    status: "todo",
    createdAt: new Date(),
  },
  "2": {
    id: "2",
    title: "Set up project",
    description: "Initialize Vite + React + TypeScript + Tailwind.",
    status: "todo",
    createdAt: new Date(),
  },
  "3": {
    id: "3",
    title: "Write types",
    description: "Define TypeScript types for tasks and columns.",
    status: "in-progress",
    createdAt: new Date(),
  },
};

export default function Board() {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [tasks, setTasks] = useState<{ [id: string]: Task }>(initialTasks);

  // Add Task
  function handleAddTask(title: string, description: string) {
    const newId = Date.now().toString();
    const newTask: Task = {
      id: newId,
      title,
      description,
      status: "todo",
      createdAt: new Date(),
    };

    setTasks(prev => ({
      ...prev,
      [newId]: newTask,
    }));

    setColumns(prev =>
      prev.map(col =>
        col.id === "todo"
          ? { ...col, taskIds: [...col.taskIds, newId] }
          : col
      )
    );
  }

  // Edit Task
  function handleEditTask(id: string, newTitle: string, newDesc: string) {
    setTasks(prev => ({
      ...prev,
      [id]: { ...prev[id], title: newTitle, description: newDesc }
    }));
  }

  // Delete Task
  function handleDeleteTask(id: string) {
    setTasks(prev => {
      const newTasks = { ...prev };
      delete newTasks[id];
      return newTasks;
    });
    setColumns(prev =>
      prev.map(col => ({
        ...col,
        taskIds: col.taskIds.filter(tid => tid !== id)
      }))
    );
  }

  return (
    <div className="flex gap-4 p-4 min-h-screen bg-gray-100 dark:bg-gray-900">
      {columns.map(col => (
        <Column
          key={col.id}
          id={col.id}
          title={col.title}
          tasks={col.taskIds
            .map(taskId => tasks[taskId])
            .filter((task): task is Task => Boolean(task))}
          onAddTask={col.id === "todo" ? handleAddTask : undefined}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      ))}
    </div>
  );
}
