"use client";

import React, { useState } from 'react';
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker styles

const TrackingPage = () => {
  // State to manage expanded/collapsed tasks
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  // State to manage checked subtasks
  const [checkedSubtasks, setCheckedSubtasks] = useState<Record<string, boolean>>({});
  // State to manage the selected date
  const [selectedDate, setSelectedDate] = useState<Record<string, Date | null>>({});

  // Toggle task expansion
  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Toggle subtask checkbox
  const toggleSubtask = (subtaskId: string) => {
    setCheckedSubtasks((prev) => ({
      ...prev,
      [subtaskId]: !prev[subtaskId],
    }));
  };

  // Task data
  const tasks = [
    {
      id: 'task-1',
      name: 'Submit data for verification',
      status: 'Done',
      deadline: 'Add date',
      subtasks: [],
    },
    {
      id: 'task-2',
      name: 'Undergo Data Verification by ACV',
      status: 'Pending',
      deadline: 'Add date',
    },
    {
      id: 'task-3',
      name: 'Prepare Evidence & Documentation',
      status: 'Pending',
      deadline: 'Add date',
      subtasks: [],
    },
    {
      id: 'task-4',
      name: 'Submit Application',
      status: 'Pending',
      deadline: 'Add date',
      subtasks: [],
    },
    {
      id: 'task-5',
      name: 'Final Review & Certificate Issuance',
      status: 'Pending',
      deadline: 'Add date',
      subtasks: [],
    },
  ];

  // Handle the date change
  const handleDateChange = (taskId: string, date: Date) => {
    setSelectedDate((prev) => ({
      ...prev,
      [taskId]: date,
    }));
  };

  return (
    <div>
      <br/>
    <section className="p-6 rounded-lg bg-white shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Track My Certification</h1>
      <table className="min-w-full table-auto">
        <thead>
          <tr className="text-left border-b">
            <th className="py-3 px-4 text-gray-700 font-semibold">Task</th>
            <th className="py-3 px-4 text-gray-700 font-semibold">Status</th>
            <th className="py-3 px-4 text-gray-700 font-semibold">Deadline</th>
            <th className="py-3 px-4 text-gray-700 font-semibold">Progress Rate</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <React.Fragment key={task.id}>
              {/* Main Task Row */}
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-700">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center focus:outline-none"
                  >
                    <span className="mr-2">{expandedTasks[task.id] ? '▼' : '►'}</span>
                    {task.name}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      task.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500">
                  {/* DatePicker for selecting the deadline */}
                  <DatePicker
                    selected={selectedDate[task.id]} // Pass selected date for this task
                    onChange={(date) => handleDateChange(task.id, date!)} // Handle date change
                    dateFormat="dd/MM/yyyy"
                    className="border px-2 py-1 rounded-lg"
                    placeholderText="Select a date"
                  />
                </td>
                <td className="py-3 px-4 text-gray-500"></td>
              </tr>

            
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </section>
    </div>
  );
};

export default TrackingPage;