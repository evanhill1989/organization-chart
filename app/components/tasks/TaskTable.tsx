import type { CompleteTaskData } from "../../lib/tasks/fetchAllTasks";

interface TaskTableProps {
  tasks: CompleteTaskData[];
  onTaskSelect: (task: CompleteTaskData) => void;
}

export default function TaskTable({ tasks, onTaskSelect }: TaskTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              "Task",
              "Category",
              "Deadline",
              "Days Left",
              "Time Required",
              "Unique Days",
              "Urgency",
              "Importance",
            ].map((header) => (
              <th
                key={header}
                className="px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr
              key={task.id}
              className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} ${
                task.isOverdue ? "bg-red-50" : ""
              } hover:bg-blue-50 cursor-pointer transition-colors`}
              onClick={() => onTaskSelect(task)}
              title="Click to view/edit task details"
            >
              <td className="px-3 py-2 text-sm">
                <div className="font-medium text-gray-800 hover:text-blue-600">
                  {task.name}
                </div>
                {task.details && (
                  <div
                    className="text-xs text-gray-500 mt-1 max-w-xs truncate"
                    title={task.details}
                  >
                    {task.details}
                  </div>
                )}
              </td>
              <td className="px-3 py-2 text-sm text-gray-600">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {task.category_name}
                </span>
              </td>
              <td className="px-3 py-2 text-sm text-gray-600">
                {task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "No deadline"}
              </td>
              <td
                className={`px-3 py-2 text-sm font-medium ${
                  task.isOverdue
                    ? "text-red-600"
                    : task.daysUntilDeadline <= 7
                      ? "text-orange-600"
                      : task.daysUntilDeadline <= 30
                        ? "text-yellow-600"
                        : "text-gray-600"
                }`}
              >
                {task.isOverdue
                  ? `${Math.abs(task.daysUntilDeadline)} overdue`
                  : `${task.daysUntilDeadline} days`}
              </td>
              <td className="px-3 py-2 text-sm text-gray-600">
                {task.completion_time?.toFixed(1) || 0}h
              </td>
              <td className="px-3 py-2 text-sm text-gray-600">
                {task.unique_days_required?.toFixed(1) || 0}
              </td>
              <td className="px-3 py-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      task.urgencyLevel <= 3
                        ? "bg-green-400"
                        : task.urgencyLevel <= 6
                          ? "bg-yellow-400"
                          : task.urgencyLevel <= 8
                            ? "bg-orange-400"
                            : "bg-red-500"
                    }`}
                  />
                  <span className="text-xs font-medium">
                    Level {task.urgencyLevel}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      (task.importance || 1) <= 3
                        ? "bg-gray-300"
                        : (task.importance || 1) <= 6
                          ? "bg-blue-400"
                          : (task.importance || 1) <= 8
                            ? "bg-purple-400"
                            : "bg-purple-600"
                    }`}
                  />
                  <span className="text-xs font-medium">
                    Level {task.importance || 1}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
