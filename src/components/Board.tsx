// src/components/Board.tsx
import React, { useState } from "react";
import Column from "./Column";
import type { Task, ColumnType } from "../types";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";

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
  const [newColumnTitle, setNewColumnTitle] = useState("");

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

  // Add Column
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

  // Delete Column
  function handleDeleteColumn(id: string) {
    // Remove all tasks in this column
    const col = columns.find(c => c.id === id);
    if (col) {
      setTasks(prev => {
        const updated = { ...prev };
        col.taskIds.forEach(tid => delete updated[tid]);
        return updated;
      });
    }
    // Remove the column
    setColumns(prev => prev.filter(c => c.id !== id));
  }

  // Drag and Drop Handler
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

      // Remove from source
      const newSourceTaskIds = Array.from(sourceCol.taskIds);
      newSourceTaskIds.splice(source.index, 1);

      // Add to destination
      const newDestTaskIds = Array.from(destCol.taskIds);
      newDestTaskIds.splice(destination.index, 0, draggableId);

      const newColumns = [...prevColumns];
      newColumns[sourceColIdx] = { ...sourceCol, taskIds: newSourceTaskIds };
      newColumns[destColIdx] = { ...destCol, taskIds: newDestTaskIds };

      // Update task status if moved between columns
      if (sourceCol.id !== destCol.id) {
        setTasks(prevTasks => ({
          ...prevTasks,
          [draggableId]: {
            ...prevTasks[draggableId],
            status: destCol.id,
          },
        }));
      }

      return newColumns;
    });
  }

  return (
    <div>
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
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 p-4 min-h-screen bg-gray-100 dark:bg-gray-900">
          {columns.map(col => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-shrink-0"
                >
                  <Column
                    id={col.id}
                    title={col.title}
                    tasks={col.taskIds
                      .map(taskId => tasks[taskId])
                      .filter((task): task is Task => Boolean(task))}
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
  );
}
