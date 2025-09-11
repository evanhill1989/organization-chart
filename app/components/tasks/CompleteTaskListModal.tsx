// app/components/CompleteTaskListModal.tsx
import { useState } from "react";

import TaskDetailsModal from "./TaskDetailsModal";
import EmptyState from "../ui/EmptyState";
import TaskSummaryCards from "./TaskSummaryCards";
import { useAllTasks } from "../../hooks/useAllTasks";
import type { CompleteTaskData } from "../../lib/tasks/fetchAllTasks";
import TaskTable from "./TaskTable";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";

interface CompleteTaskListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CompleteTaskListModal({
  isOpen,
  onClose,
}: CompleteTaskListModalProps) {
  // ✅ Use the hook with proper typing
  const {
    tasks: allTasks = [],
    isLoading,
    error,
    reload, // Use reload instead of refetch for consistency with your hook
  } = useAllTasks(isOpen);

  const [selectedTask, setSelectedTask] = useState<CompleteTaskData | null>(
    null,
  );

  // ✅ Handle task details close and refresh
  const handleTaskDetailsClose = () => {
    setSelectedTask(null);
    reload(); // Use reload from your hook
  };

  if (!isOpen) return null;

  // const ErrorState = () => (
  //   <div className="text-center py-8 text-red-600">
  //     <p className="mt-2">Error: {error}</p>
  //     <button
  //       onClick={() => reload()}
  //       className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  //     >
  //       Try Again
  //     </button>
  //   </div>
  // );

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-start justify-center bg-black pt-20">
      <div className="mx-4 max-h-[calc(90vh-5rem)] w-full max-w-6xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Complete Task List
            </h2>
            <p className="text-sm text-gray-600">
              All tasks sorted by deadline • Total: {allTasks.length} tasks
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>

        {isLoading && <LoadingState />}
        {error && <ErrorState error={error} onClick={() => reload()} />}
        {!isLoading && !error && allTasks.length === 0 && (
          <EmptyState title="No tasks found with deadlines" />
        )}
        {!isLoading && !error && allTasks.length > 0 && (
          <>
            <TaskSummaryCards tasks={allTasks} />
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-800">
                Task Details
              </h3>
              <p className="mb-3 text-sm text-gray-600">
                Click on any task to view or edit its details
              </p>
              <TaskTable tasks={allTasks} onTaskSelect={setSelectedTask} />
            </div>
          </>
        )}

        {/* Task Details Modal */}
        <TaskDetailsModal
          task={selectedTask}
          onClose={handleTaskDetailsClose}
        />
      </div>
    </div>
  );
}
