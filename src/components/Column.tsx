// src/components/Column.tsx
import React, { useState } from "react";
import TaskCard from "./Task";
import type { Task } from "../types";

type ColumnProps = {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask?: (title: string, description: string) => void;
  onEditTask?: (id: string, newTitle: string, newDesc: string) => void;
  onDeleteTask?: (id: string) => void;
};

export default function Column({
  id,
  title,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask
}: ColumnProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  const isTodoColumn = id === "todo";

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddTask && newTaskTitle.trim() && newTaskDesc.trim()) {
      onAddTask(newTaskTitle, newTaskDesc);
      setNewTaskTitle("");
      setNewTaskDesc("");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow w-80 p-4">
      <h2 className="font-bold text-lg mb-4 dark:text-white">{title}</h2>
      {isTodoColumn && (
        <form onSubmit={handleAddTask} className="mb-4 space-y-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Task title"
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            value={newTaskDesc}
            onChange={e => setNewTaskDesc(e.target.value)}
            placeholder="Description"
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add Task
          </button>
        </form>
      )}
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}
