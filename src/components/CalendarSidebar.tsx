// src/components/CalendarSidebar.tsx
import React from "react";
import type { Task } from "../types";

type CalendarProps = { tasks: Task[], onDateSelect?: (date: string) => void };

export default function CalendarSidebar({ tasks, onDateSelect }: CalendarProps) {
  const todayISO = new Date().toISOString().slice(0, 10);

  function getTasksForDay(date: string) {
    return tasks.filter(t => t.dueDate === date);
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  return (
    <div className="w-64 p-4 bg-gray-100 dark:bg-gray-900 rounded-xl shadow">
      <h3 className="mb-2 text-lg font-bold">This Week</h3>
      <ul>
        {days.map(date => (
          <li key={date} className="mb-2">
            <button
              className={`w-full flex justify-between items-center p-2 rounded ${
                date === todayISO ? "bg-yellow-200" : "hover:bg-gray-200"
              }`}
              onClick={() => onDateSelect?.(date)}
            >
              <span>
                {new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                {date === todayISO && " (Today)"}
              </span>
              {getTasksForDay(date).length > 0 && (
                <span className="bg-blue-500 text-white px-2 rounded">
                  {getTasksForDay(date).length}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 text-sm text-red-500 font-bold">
        {tasks.some(t => t.dueDate === todayISO || (t.dueDate && new Date(t.dueDate) < new Date(todayISO)))
          && "You have tasks due today or overdue!"}
      </div>
    </div>
  );
}
