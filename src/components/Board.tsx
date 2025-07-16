// src/components/Board.tsx

import React, { useState, useEffect } from "react";
import Column from "./Column";
import CalendarSidebar from "./CalendarSidebar";
import type { Task, ColumnType, TaskLabel } from "../types";
import { USERS } from "../users";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";

const initialValues = {
  columns: [
    { id: "todo", title: "To-Do", taskIds: ["1", "2"] },
    { id: "in-progress", title: "In-Progress", taskIds: ["3"] },
    { id: "done", title: "Done", taskIds: [] }
  ],
  tasks: {
    "1": {
      id: "1",
      title: "Design UI",
      description: "Sketch the first version of the board UI.",
      status: "todo",
      createdAt: new Date(),
      label: "Feature" as TaskLabel,
      assigneeId: "u1",
      dueDate: "2025-07-28",
      activity: []
    },
    "2": {
      id: "2",
      title: "Set up project",
      description: "Initialize Vite + React + TypeScript + Tailwind.",
      status: "todo",
      createdAt: new Date(),
      label: "Improvement" as TaskLabel,
      assigneeId: "u2",
      dueDate: "",
      activity: []
    },
    "3": {
      id: "3",
      title: "Write types",
      description: "Define TypeScript types for tasks and columns.",
      status: "in-progress",
      createdAt: new Date(),
      label: "Bug" as TaskLabel,
      assigneeId: "u3",
      dueDate: "2025-08-01",
      activity: []
    }
  }
};

export default function Board() {
  // Dark mode
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Search & Filters
  const [q, setQ] = useState("");
  const [labelFilter, setLabelFilter] = useState<TaskLabel | "">("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");
  const [dueDateFilter, setDueDateFilter] = useState<string>("");

  // Board State
  const [columns, setColumns] = useState<ColumnType[]>(initialValues.columns);
  const [tasks, setTasks] = useState<{ [id: string]: Task }>(initialValues.tasks);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // Filtered Tasks
  function filteredTasks(ids: string[]): Task[] {
    return ids
      .map(id => tasks[id])
      .filter(
        t =>
          t &&
          t.title.toLowerCase().includes(q.toLowerCase()) &&
          (labelFilter === "" || t.label === labelFilter) &&
          (assigneeFilter === "" || t.assigneeId === assigneeFilter) &&
          (dueDateFilter === "" || t.dueDate === dueDateFilter)
      );
  }

  // Activity logger
  function logTaskActivity(id: string, entry: Omit<NonNullable<Task["activity"]>[number], "timestamp">) {
    setTasks(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        activity: [...(prev[id].activity || []), { ...entry, timestamp: new Date().toISOString() }]
      }
    }));
  }

  // Task Events
  function handleAddTask(
    title: string,
    description: string,
    label: TaskLabel = "",
    assigneeId: string = "",
    dueDate: string = ""
  ) {
    const newId = Date.now().toString();
    const newTask: Task = {
      id: newId,
      title,
      description,
      status: "todo",
      createdAt: new Date(),
      label,
      assigneeId,
      dueDate,
      activity: []
    };
    setTasks(prev => ({ ...prev, [newId]: newTask }));
    setColumns(prev =>
      prev.map(col =>
        col.id === "todo"
          ? { ...col, taskIds: [...col.taskIds, newId] }
          : col
      )
    );
    logTaskActivity(newId, {
      type: "created",
      detail: "Task created",
      user: assigneeId ? assigneeId : "system"
    });
  }

  function handleEditTask(
    id: string,
    newTitle: string,
    newDesc: string,
    label: TaskLabel = "",
    assigneeId: string = "",
    dueDate: string = ""
  ) {
    const current = tasks[id];
    setTasks(prev => ({
      ...prev,
      [id]: { ...prev[id], title: newTitle, description: newDesc, label, assigneeId, dueDate }
    }));
    logTaskActivity(id, {
      type: "edited",
      detail: "Task edited",
      user: assigneeId
    });
    if (current.label !== label)
      logTaskActivity(id, { type: "labelChanged", detail: `Label changed to ${label}`, user: assigneeId });
    if (current.dueDate !== dueDate)
      logTaskActivity(id, { type: "dueDateChanged", detail: `Due date changed to ${dueDate}`, user: assigneeId });
    if (current.assigneeId !== assigneeId)
      logTaskActivity(id, { type: "assigned", detail: `Assigned to ${assigneeId}`, user: assigneeId });
  }

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

  function handleAddColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    const newId = Date.now().toString();
    setColumns(prev => [
      ...prev,
      { id: newId, title: newColumnTitle.trim(), taskIds: [] }
    ]);
    setNewColumnTitle("");
  }

  function handleDeleteColumn(id: string) {
    const col = columns.find(c => c.id === id);
    if (col) {
      setTasks(prev => {
        const updated = { ...prev };
        col.taskIds.forEach(tid => delete updated[tid]);
        return updated;
      });
    }
    setColumns(prev => prev.filter(c => c.id !== id));
  }

  function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    setColumns(prevColumns => {
      const sourceColIdx = prevColumns.findIndex(col => col.id === source.droppableId);
      const destColIdx = prevColumns.findIndex(col => col.id === destination.droppableId);
      if (sourceColIdx === -1 || destColIdx === -1) return prevColumns;

      const sourceCol = prevColumns[sourceColIdx];
      const destCol = prevColumns[destColIdx];

      const newSourceTaskIds = Array.from(sourceCol.taskIds);
      newSourceTaskIds.splice(source.index, 1);

      const newDestTaskIds = Array.from(destCol.taskIds);
      newDestTaskIds.splice(destination.index, 0, draggableId);

      const newColumns = [...prevColumns];
      newColumns[sourceColIdx] = { ...sourceCol, taskIds: newSourceTaskIds };
      newColumns[destColIdx] = { ...destCol, taskIds: newDestTaskIds };

      // Activity log for moving
      const movedTask = tasks[draggableId];
      if (sourceCol.id !== destCol.id) {
        setTasks(prevTasks => ({
          ...prevTasks,
          [draggableId]: {
            ...prevTasks[draggableId],
            status: destCol.id
          }
        }));
        logTaskActivity(draggableId, {
          type: "moved",
          detail: `Moved to ${destCol.title}`,
          user: movedTask.assigneeId || "system"
        });
      }
      return newColumns;
    });
  }

  // Calendar: Filter by date
  function handleCalendarDate(date: string) {
    setDueDateFilter(date);
  }

  return (
    <div className="flex">
      {/* Dark Mode Toggle */}
      <button
        className="fixed top-2 right-2 z-50 p-2 rounded bg-gray-300 dark:bg-gray-700"
        onClick={() => setDarkMode(dm => !dm)}
        aria-label="Toggle dark mode"
      >
        {darkMode ? "🌙" : "☀️"}
      </button>

      {/* Calendar Sidebar */}
      <CalendarSidebar tasks={Object.values(tasks)} onDateSelect={handleCalendarDate} />
      
      <div className="flex-grow">
        {/* Filter Controls */}
        <form className="flex gap-2 mb-4 p-4 items-center">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by title"
            className="p-2 border rounded"
          />
          <select
            value={labelFilter}
            onChange={e => setLabelFilter(e.target.value as TaskLabel)}
            className="p-2 border rounded"
          >
            <option value="">All labels</option>
            <option value="Bug">Bug</option>
            <option value="Feature">Feature</option>
            <option value="Urgent">Urgent</option>
            <option value="Improvement">Improvement</option>
          </select>
          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All assignees</option>
            {USERS.map(user => (
              <option value={user.id} key={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dueDateFilter}
            onChange={e => setDueDateFilter(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            type="button"
            className="ml-2 text-xs"
            onClick={() => {
              setDueDateFilter("");
              setQ(""); setLabelFilter(""); setAssigneeFilter("");
            }}>
            Clear filters
          </button>
        </form>

        {/* Add Column */}
        <form onSubmit={handleAddColumn} className="flex gap-2 mb-4 p-4">
          <input
            type="text"
            value={newColumnTitle}
            onChange={e => setNewColumnTitle(e.target.value)}
            placeholder="New column title"
            className="p-2 border rounded"
            required
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Add Column
          </button>
        </form>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 p-4 min-h-screen bg-gray-100 dark:bg-gray-900">
            {columns.map(col => (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-shrink-0"
                  >
                    <Column
                      id={col.id}
                      title={col.title}
                      tasks={filteredTasks(col.taskIds)}
                      users={USERS}
                      onAddTask={col.id === "todo" ? handleAddTask : undefined}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onDeleteColumn={columns.length > 1 ? handleDeleteColumn : undefined}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
