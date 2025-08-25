import { useState, useEffect } from "react";
import { supabase } from "../lib/db/supabaseClient";
import type { OrgNodeRow } from "../types/orgChart";

interface TimeReportData {
  totalRequiredTime: number;
  totalAvailableTime: number;
  taskCount: number;
  ratio: number;
  tasks: TaskWithDeadlineInfo[];
}

interface TaskWithDeadlineInfo extends OrgNodeRow {
  daysUntilDeadline: number;
  isOverdue: boolean;
}

type ImportanceFilter = "1" | "2-4" | "5-6" | "7-9" | "10" | "All levels";

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

  // Filter states
  const [dateFilter, setDateFilter] = useState<string>("28-days");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [importanceFilter, setImportanceFilter] =
    useState<ImportanceFilter>("All levels");

  // Utility functions
  const utils = {
    getDateRange: () => {
      const today = new Date();
      const endDate =
        dateFilter === "28-days"
          ? new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000)
          : customEndDate
          ? new Date(customEndDate)
          : new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000);

      return { startDate: today, endDate };
    },

    matchesImportanceFilter: (importance: number | undefined): boolean => {
      if (importanceFilter === "All levels") return true;
      const imp = importance || 1;

      const filterMap: Record<ImportanceFilter, (imp: number) => boolean> = {
        "1": (imp) => imp === 1,
        "2-4": (imp) => imp >= 2 && imp <= 4,
        "5-6": (imp) => imp >= 5 && imp <= 6,
        "7-9": (imp) => imp >= 7 && imp <= 9,
        "10": (imp) => imp === 10,
        "All levels": () => true,
      };

      return filterMap[importanceFilter](imp);
    },

    calculateAvailableTime: (startDate: Date, endDate: Date): number => {
      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const weeksDiff = daysDiff / 7;
      return weeksDiff * 25; // 25 hours per week baseline
    },

    getDaysUntilDeadline: (deadline: string): number => {
      const today = new Date();
      const deadlineDate = new Date(deadline);
      const timeDiff = deadlineDate.getTime() - today.getTime();
      return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    },

    getRatioColor: (ratio: number): string => {
      if (ratio <= 0.5) return "text-green-600";
      if (ratio <= 0.8) return "text-yellow-600";
      if (ratio <= 1.0) return "text-orange-600";
      return "text-red-600";
    },

    getRatioStatus: (ratio: number): string => {
      if (ratio <= 0.5) return "Light load";
      if (ratio <= 0.8) return "Moderate load";
      if (ratio <= 1.0) return "Heavy load";
      return "Overloaded";
    },

    formatDateForInput: (date: Date): string => {
      return date.toISOString().split("T")[0];
    },

    enrichTasksWithDeadlineInfo: (
      tasks: OrgNodeRow[]
    ): TaskWithDeadlineInfo[] => {
      return tasks
        .map((task) => ({
          ...task,
          daysUntilDeadline: task.deadline
            ? utils.getDaysUntilDeadline(task.deadline)
            : 0,
          isOverdue: task.deadline
            ? utils.getDaysUntilDeadline(task.deadline) < 0
            : false,
        }))
        .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);
    },
  };

  // Fetch and calculate report data
  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { startDate, endDate } = utils.getDateRange();

      const { data: tasks, error: fetchError } = await supabase
        .from("org_nodes")
        .select("*")
        .eq("type", "task")
        .gte("deadline", startDate.toISOString().split("T")[0])
        .lte("deadline", endDate.toISOString().split("T")[0])
        .not("deadline", "is", null)
        .not("completion_time", "is", null);

      if (fetchError) throw fetchError;

      const typedTasks = (tasks as OrgNodeRow[]).filter((task) =>
        utils.matchesImportanceFilter(task.importance)
      );

      const totalRequiredTime = typedTasks.reduce(
        (sum, task) => sum + (task.completion_time || 0),
        0
      );

      const totalAvailableTime = utils.calculateAvailableTime(
        startDate,
        endDate
      );
      const ratio =
        totalAvailableTime > 0 ? totalRequiredTime / totalAvailableTime : 0;
      const enrichedTasks = utils.enrichTasksWithDeadlineInfo(typedTasks);

      setReportData({
        totalRequiredTime,
        totalAvailableTime,
        taskCount: typedTasks.length,
        ratio,
        tasks: enrichedTasks,
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

  // Render components
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
          min={utils.formatDateForInput(new Date())}
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
        <div className={`font-bold ${utils.getRatioColor(reportData.ratio)}`}>
          {(reportData.ratio * 100).toFixed(1)}%
        </div>
        <div className="text-xs text-gray-400">
          ({reportData.totalRequiredTime.toFixed(1)}h /{" "}
          {reportData.totalAvailableTime.toFixed(1)}h)
        </div>
      </div>
      <div className="text-xs text-gray-400">
        {reportData.taskCount} tasks • {utils.getRatioStatus(reportData.ratio)}
      </div>
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
        color: utils.getRatioColor(reportData.ratio).replace("text-", "text-"),
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
              <td className="px-4 py-2 text-sm text-gray-800">{task.name}</td>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
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
        <RefreshButton />
      </div>
      {showDetailModal && <DetailModal />}
    </>
  );
}
