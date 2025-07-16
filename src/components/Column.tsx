// src/components/Column.tsx

import React, { useState } from "react";
import TaskCard from "./Task";
import type { Task, TaskLabel, User } from "../types";

type ColumnProps = {
  id: string;
  title: string;
  tasks: Task[];
  users: User[];
  onAddTask?: (
    title: string,
    description: string,
    label: TaskLabel,
    assigneeId: string,
    dueDate: string
  ) => void;
  onEditTask?: (
    id: string,
    newTitle: string,
    newDesc: string,
    label: TaskLabel,
    assigneeId: string,
    dueDate: string
  ) => void;
  onDeleteTask?: (id: string) => void;
  onDeleteColumn?: (id: string) => void;
};

export default function Column({
  id,
  title,
  tasks,
  users,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDeleteColumn
}: ColumnProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskLabel, setNewTaskLabel] = useState<TaskLabel>("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>("");

  const isTodoColumn = id === "todo";

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddTask && newTaskTitle.trim() && newTaskDesc.trim()) {
      onAddTask(
        newTaskTitle,
        newTaskDesc,
        newTaskLabel,
        newTaskAssignee,
        newTaskDueDate
      );
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskLabel("");
      setNewTaskAssignee("");
      setNewTaskDueDate("");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow w-80 p-4 min-h-[200px] flex flex-col">
      {/* Column header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg dark:text-white">{title}</h2>
        {onDeleteColumn && (
          <button
            className="text-red-600 hover:underline text-xs"
            onClick={() => onDeleteColumn(id)}
            title="Delete column"
          >
            Delete
          </button>
        )}
      </div>

      {/* Add Task Form */}
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
          <select
            value={newTaskLabel}
            onChange={e => setNewTaskLabel(e.target.value as TaskLabel)}
            className="w-full p-2 border rounded"
          >
            <option value="">No label</option>
            <option value="Bug">Bug</option>
            <option value="Feature">Feature</option>
            <option value="Urgent">Urgent</option>
            <option value="Improvement">Improvement</option>
          </select>
          <select
            value={newTaskAssignee}
            onChange={e => setNewTaskAssignee(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Unassigned</option>
            {users.map(user => (
              <option value={user.id} key={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={newTaskDueDate}
            onChange={e => setNewTaskDueDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700 transition"
          >
            Add Task
          </button>
        </form>
      )}

      {/* Task Cards */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {tasks.map((task, idx) => (
          <TaskCard
            key={task.id}
            task={task}
            index={idx}
            users={users}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}
