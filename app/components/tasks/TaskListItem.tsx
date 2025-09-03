// app/components/tasks/TaskListItem.tsx
import type { EnrichedTask } from "../../lib/taskEnrichmentUtils";

interface TaskListItemProps {
  task: EnrichedTask;
  onClick: (task: EnrichedTask) => void;
}

export default function TaskListItem({ task, onClick }: TaskListItemProps) {
  const getUrgencyColor = (urgencyLevel: number) => {
    if (urgencyLevel <= 3)
      return { dot: "bg-green-400", text: "text-green-600" };
    if (urgencyLevel <= 6)
      return { dot: "bg-yellow-400", text: "text-yellow-600" };
    if (urgencyLevel <= 8)
      return { dot: "bg-orange-400", text: "text-orange-600" };
    return { dot: "bg-red-500", text: "text-red-600" };
  };

  const getImportanceColor = (importance: number) => {
    if (importance <= 3) return { dot: "bg-gray-300", text: "text-gray-600" };
    if (importance <= 6) return { dot: "bg-blue-400", text: "text-blue-600" };
    if (importance <= 8)
      return { dot: "bg-purple-400", text: "text-purple-600" };
    return { dot: "bg-purple-600", text: "text-purple-800" };
  };

  const urgencyColors = getUrgencyColor(task.urgencyLevel);
  const importanceColors = getImportanceColor(task.importance || 1);

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm"
      onClick={() => onClick(task)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {task.name}
          </h3>
          {task.details && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {task.details}
            </p>
          )}
          <div className="flex items-center space-x-4 mt-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {task.root_category}
            </span>
            {task.completion_time && (
              <span className="text-xs text-gray-500">
                {task.completion_time}h estimated
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2 ml-4">
          {/* Urgency */}
          <div className="flex items-center space-x-2">
            <span
              className={`inline-block w-3 h-3 rounded-full ${urgencyColors.dot}`}
            />
            <span className={`text-xs font-medium ${urgencyColors.text}`}>
              U{task.urgencyLevel}
            </span>
          </div>

          {/* Importance */}
          <div className="flex items-center space-x-2">
            <span
              className={`inline-block w-3 h-3 rounded-full ${importanceColors.dot}`}
            />
            <span className={`text-xs font-medium ${importanceColors.text}`}>
              I{task.importance || 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
