import { useState, useEffect } from "react";
import { supabase } from "../lib/db/supabaseClient";
import type { OrgNodeRow } from "../types/orgChart";
import type { TimeReportData, ImportanceFilter } from "../lib/timeReportUtils";

import {
  getDateRange,
  matchesImportanceFilter,
  calculateAvailableTime,
  getRatioColor,
  getRatioStatus,
  formatDateForInput,
  calculateRequiredTime,
  processTasksWithPartialInfo,
} from "../lib/timeReportUtils";
import CompleteTaskListModal from "./CompleteTaskListModal";

export default function TimeAvailabilityReport() {
  const [reportData, setReportData] = useState<TimeReportData>({
    totalRequiredTime: 0,
    totalAvailableTime: 0,
    taskCount: 0,
    ratio: 0,
    tasks: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCompleteTaskList, setShowCompleteTaskList] = useState(false);

  // Filter states
  const [dateFilter, setDateFilter] = useState<string>("28-days");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [importanceFilter, setImportanceFilter] =
    useState<ImportanceFilter>("All levels");

  // Fetch and calculate report data
  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange(dateFilter, customEndDate);
      const timeWindowDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Fetch ALL tasks with deadlines (not just within the time window)
      const { data: allTasks, error: fetchError } = await supabase
        .from("org_nodes")
        .select("*")
        .eq("type", "task")
        .gte("deadline", startDate.toISOString().split("T")[0])
        .not("deadline", "is", null)
        .not("completion_time", "is", null);

      if (fetchError) throw fetchError;

      const filteredTasks = (allTasks as OrgNodeRow[]).filter((task) =>
        matchesImportanceFilter(task.importance, importanceFilter)
      );

      // Calculate required time with partial allocation for long-term tasks
      const { totalRequiredTime, tasksInWindow, tasksWithPartialTime } =
        calculateRequiredTime(filteredTasks, timeWindowDays, endDate);

      const totalAvailableTime = calculateAvailableTime(startDate, endDate);
      const ratio =
        totalAvailableTime > 0 ? totalRequiredTime / totalAvailableTime : 0;

      // Process tasks with partial time information for display
      const processedTasks = processTasksWithPartialInfo(
        tasksInWindow,
        tasksWithPartialTime
      );

      setReportData({
        totalRequiredTime,
        totalAvailableTime,
        taskCount: filteredTasks.length,
        ratio,
        tasks: processedTasks,
      });
    } catch (err) {
      console.error("Error fetching time report data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateFilter, customEndDate, importanceFilter]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-white text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>Loading...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return <div className="text-red-400 text-sm">Error: {error}</div>;
  }

  // Component renders
  const DateFilter = () => (
    <div className="flex flex-col space-y-1">
      <label className="text-xs text-gray-300">Time Window:</label>
      <select
        className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
      >
        <option value="28-days">Next 28 days</option>
        <option value="custom">Custom date</option>
      </select>
      {dateFilter === "custom" && (
        <input
          type="date"
          className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 mt-1"
          value={customEndDate}
          onChange={(e) => setCustomEndDate(e.target.value)}
          min={formatDateForInput(new Date())}
        />
      )}
    </div>
  );

  const ImportanceFilter = () => (
    <div className="flex flex-col space-y-1">
      <label className="text-xs text-gray-300">Importance:</label>
      <select
        className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600"
        value={importanceFilter}
        onChange={(e) =>
          setImportanceFilter(e.target.value as ImportanceFilter)
        }
      >
        <option value="All levels">All levels</option>
        <option value="1">Level 1</option>
        <option value="2-4">Levels 2-4</option>
        <option value="5-6">Levels 5-6</option>
        <option value="7-9">Levels 7-9</option>
        <option value="10">Level 10</option>
      </select>
    </div>
  );

  const QuickStats = () => (
    <button
      onClick={() => setShowDetailModal(true)}
      className="flex flex-col space-y-1 border-l border-gray-600 pl-4 hover:bg-gray-800 p-2 rounded transition-colors"
    >
      <div className="text-xs text-gray-300">Time Analysis:</div>
      <div className="flex items-center space-x-2">
        <div className={`font-bold ${getRatioColor(reportData.ratio)}`}>
          {(reportData.ratio * 100).toFixed(1)}%
        </div>
        <div className="text-xs text-gray-400">
          ({reportData.totalRequiredTime.toFixed(1)}h /{" "}
          {reportData.totalAvailableTime.toFixed(1)}h)
        </div>
      </div>
      <div className="text-xs text-gray-400">
        {reportData.taskCount} tasks • {getRatioStatus(reportData.ratio)}
      </div>
    </button>
  );

  const TaskListButton = () => (
    <button
      onClick={() => setShowCompleteTaskList(true)}
      className="text-gray-400 hover:text-white transition-colors"
      title="View all tasks"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    </button>
  );

  const RefreshButton = () => (
    <button
      onClick={fetchReportData}
      className="text-gray-400 hover:text-white transition-colors"
      title="Refresh report"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>
  );

  const SummaryCards = () => {
    const cards = [
      {
        label: "Total Required Time",
        value: `${reportData.totalRequiredTime.toFixed(1)}h`,
        color: "text-gray-800",
      },
      {
        label: "Available Time",
        value: `${reportData.totalAvailableTime.toFixed(1)}h`,
        color: "text-gray-800",
      },
      {
        label: "Utilization",
        value: `${(reportData.ratio * 100).toFixed(1)}%`,
        color: getRatioColor(reportData.ratio).replace("text-", "text-"),
      },
      {
        label: "Task Count",
        value: `${reportData.taskCount}`,
        color: "text-gray-800",
      },
    ];

    return (
      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded">
            <div className="text-sm text-gray-600">{card.label}</div>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const TaskTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              "Task",
              "Deadline",
              "Days Left",
              "Time Required",
              "Effective Time",
              "Importance",
              "Category",
            ].map((header) => (
              <th
                key={header}
                className="px-4 py-2 text-left text-sm font-medium text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reportData.tasks.map((task, index) => (
            <tr
              key={task.id}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="px-4 py-2 text-sm text-gray-800">
                {task.name}
                {task.isPartialTime && (
                  <span className="ml-2 text-xs text-blue-600 font-medium">
                    (Partial)
                  </span>
                )}
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "No deadline"}
              </td>
              <td
                className={`px-4 py-2 text-sm ${
                  task.isOverdue
                    ? "text-red-600 font-bold"
                    : task.daysUntilDeadline <= 7
                    ? "text-orange-600"
                    : "text-gray-600"
                }`}
              >
                {task.isOverdue
                  ? `${Math.abs(task.daysUntilDeadline)} overdue`
                  : `${task.daysUntilDeadline} days`}
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {task.completion_time?.toFixed(1) || 0}h
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                <span
                  className={
                    task.isPartialTime ? "text-blue-600 font-medium" : ""
                  }
                >
                  {task.effectiveRequiredTime?.toFixed(1) ||
                    task.completion_time?.toFixed(1) ||
                    0}
                  h
                </span>
                {task.isPartialTime && (
                  <div className="text-xs text-gray-500">
                    (
                    {(
                      ((task.partialRequiredTime || 0) /
                        (task.completion_time || 1)) *
                      100
                    ).toFixed(1)}
                    % of total)
                  </div>
                )}
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                Level {task.importance || 1}
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {task.root_category}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const DetailModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full mx-4 max-h-[calc(80vh-5rem)] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Time Availability Report
          </h2>
          <button
            onClick={() => setShowDetailModal(false)}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <SummaryCards />

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Task Breakdown
          </h3>
          <TaskTable />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center space-x-4 text-white text-sm">
        <DateFilter />
        <ImportanceFilter />
        <QuickStats />
        <TaskListButton />
        <RefreshButton />
      </div>
      {showDetailModal && <DetailModal />}
      <CompleteTaskListModal
        isOpen={showCompleteTaskList}
        onClose={() => setShowCompleteTaskList(false)}
      />
    </>
  );
}
