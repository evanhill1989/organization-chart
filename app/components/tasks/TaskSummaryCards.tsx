// app/components/tasks/TaskSummaryCards.tsx
import type { EnrichedTask } from "../../lib/taskEnrichmentUtils";

interface TaskSummaryCardsProps {
  tasks: EnrichedTask[];
}

export default function TaskSummaryCards({ tasks }: TaskSummaryCardsProps) {
  const highUrgencyCount = tasks.filter((t) => t.urgencyLevel >= 7).length;
  const highImportanceCount = tasks.filter(
    (t) => (t.importance || 1) >= 7
  ).length;
  const totalTime = tasks.reduce((sum, t) => sum + (t.completion_time || 0), 0);

  return (
    <div className="mb-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded border-l-4 border-red-500">
          <div className="text-sm text-red-700">High Urgency</div>
          <div className="text-2xl font-bold text-red-800">
            {highUrgencyCount}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded border-l-4 border-purple-500">
          <div className="text-sm text-purple-700">High Importance</div>
          <div className="text-2xl font-bold text-purple-800">
            {highImportanceCount}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded border-l-4 border-gray-500">
          <div className="text-sm text-gray-700">Total Time</div>
          <div className="text-2xl font-bold text-gray-800">
            {totalTime.toFixed(1)}h
          </div>
        </div>
      </div>
    </div>
  );
}
