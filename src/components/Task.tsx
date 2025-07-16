import React, { useState } from "react";
import type { Task, TaskLabel, User } from "../types";
import { Draggable } from "@hello-pangea/dnd";

const LABEL_COLORS: Record<string, string> = {
  Bug: "bg-red-500",
  Feature: "bg-blue-500",
  Urgent: "bg-yellow-500",
  Improvement: "bg-green-500"
};

type TaskCardProps = {
  task: Task;
  index: number;
  users: User[];
  onEdit?: (
    id: string,
    newTitle: string,
    newDesc: string,
    label: TaskLabel,
    assigneeId: string,
    dueDate: string
  ) => void;
  onDelete?: (id: string) => void;
};

export default function TaskCard({ task, index, users, onEdit, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description);
  const [label, setLabel] = useState<TaskLabel>(task.label || "");
  const [assigneeId, setAssigneeId] = useState<string>(task.assigneeId || "");
  const [dueDate, setDueDate] = useState<string>(task.dueDate || "");

  const assignedUser = users.find(u => u.id === task.assigneeId);

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onEdit && title.trim() && desc.trim()) {
      onEdit(task.id, title, desc, label, assigneeId, dueDate);
      setIsEditing(false);
    }
  };

  const isOverdue =
    !!task.dueDate &&
    new Date(task.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 mb-2 ${
            snapshot.isDragging ? "ring-2 ring-blue-400" : ""
          }`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
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
              <select
                value={label}
                onChange={e => setLabel(e.target.value as TaskLabel)}
                className="w-full p-1 border rounded"
              >
                <option value="">No label</option>
                <option value="Bug">Bug</option>
                <option value="Feature">Feature</option>
                <option value="Urgent">Urgent</option>
                <option value="Improvement">Improvement</option>
              </select>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full p-1 border rounded"
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full p-1 border rounded"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">Save</button>
                <button type="button" className="bg-gray-300 px-2 py-1 rounded" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              {typeof task.label === "string" && task.label.length > 0 && (
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded ${LABEL_COLORS[task.label] || "bg-gray-400"} mb-2`}
                >
                  {task.label}
                </span>
              )}

              {task.dueDate && (
                <div className={`text-xs rounded px-2 py-0.5 inline-block mb-1
                  ${isOverdue ? "bg-red-500 text-white" : "bg-yellow-200 text-gray-700"}`}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                  {isOverdue && "  (Overdue)"}
                </div>
              )}

              {assignedUser && (
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={assignedUser.avatar}
                    alt={assignedUser.name}
                    className="w-6 h-6 rounded-full border"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-200">{assignedUser.name}</span>
                </div>
              )}

              <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
              <div className="text-xs text-gray-400 dark:text-gray-300 mt-2">
                Created: {task.createdAt.toLocaleDateString()}
              </div>

              <div className="mt-2 flex gap-2">
                <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:underline text-xs">Edit</button>
                <button onClick={() => onDelete && onDelete(task.id)} className="text-red-500 hover:underline text-xs">Delete</button>
              </div>

              {/* Activity Log */}
              {task.activity && task.activity.length > 0 && (
                <details className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <summary className="font-semibold cursor-pointer">History</summary>
                  <ul>
                    {task.activity.map((a, i) => (
                      <li key={i} className="text-xs mt-1">
                        [{new Date(a.timestamp).toLocaleString()}] {a.user}: {a.detail}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </div>
      )}
    </Draggable>
  );
}
