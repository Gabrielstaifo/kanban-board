// src/components/Task.tsx
import React, { useState } from "react";
import type { Task } from "../types";

type TaskCardProps = {
  task: Task;
  onEdit?: (id: string, newTitle: string, newDesc: string) => void;
  onDelete?: (id: string) => void;
};

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description);

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onEdit && title.trim() && desc.trim()) {
      onEdit(task.id, title, desc);
      setIsEditing(false);
    }
  };

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-600">
      {isEditing ? (
        <form onSubmit={handleEdit} className="space-y-2">
          <input
            className="w-full p-1 border rounded"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full p-1 border rounded"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">Save</button>
            <button type="button" className="bg-gray-300 px-2 py-1 rounded" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
          <div className="text-xs text-gray-400 dark:text-gray-300 mt-2">
            {task.createdAt.toLocaleDateString()}
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:underline text-xs">Edit</button>
            <button onClick={() => onDelete && onDelete(task.id)} className="text-red-500 hover:underline text-xs">Delete</button>
          </div>
        </>
      )}
    </div>
  );
}
