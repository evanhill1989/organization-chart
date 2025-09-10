import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { OrgNode, OrgNodeRow } from "../types/orgChart";
import { useEditOrgNode } from "../hooks/useEditOrgNode";
import { useDeleteOrgNode } from "../hooks/useDeleteOrgNode";
import { calculateUrgencyLevel } from "../lib/urgencyUtils";
import RecurrenceDisplay from "./RecurrenceDisplay";
import { createRecurringInstance } from "../lib/createRecurringInstance";

interface TaskDetailsModalProps {
  task: OrgNodeRow | null;
  onClose: () => void;
}

export default function TaskDetailsModal({
  task,
  onClose,
}: TaskDetailsModalProps) {
  const [details, setDetails] = useState("");
  const [importance, setImportance] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [completionTime, setCompletionTime] = useState(1);
  const [uniqueDaysRequired, setUniqueDaysRequired] = useState(1);

  // Completion tracking states
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionComment, setCompletionComment] = useState("");
  const [completedAt, setCompletedAt] = useState<string | null>(null);

  // 🔥 ADD THIS: Track if we've already created a recurring instance
  const hasCreatedRecurringInstanceRef = useRef(false);

  const editNodeMutation = useEditOrgNode(task?.root_category || "");
  const deleteNodeMutation = useDeleteOrgNode(task?.root_category || "");

  // Ref for modal GSAP animation
  const modalRef = useRef<HTMLDivElement>(null);

  // Helper to format date for input[type="date"]
  const formatDateForInput = (date?: string) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  // Calculate current urgency level for modal animation
  const currentUrgencyLevel =
    task?.type === "task"
      ? calculateUrgencyLevel(deadline, completionTime, uniqueDaysRequired)
      : 1;

  // GSAP animation for modal urgency or importance level 10
  useGSAP(() => {
    if (
      task?.type === "task" &&
      (currentUrgencyLevel === 10 || importance === 10) &&
      !isCompleted
    ) {
      gsap.to(modalRef.current, {
        scale: 1.02,
        duration: 1,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      });
    } else {
      gsap.killTweensOf(modalRef.current);
      gsap.set(modalRef.current, { scale: 1 });
    }
  }, [task, currentUrgencyLevel, importance, isCompleted]);

  // Initialize form values when task changes
  useEffect(() => {
    if (task) {
      setDetails(task.details ?? "");
      setImportance(task.importance ?? 1);
      setDeadline(task.deadline ?? "");
      setCompletionTime(task.completion_time ?? 1);
      setUniqueDaysRequired(task.unique_days_required ?? 1);
      setIsCompleted(task.is_completed ?? false);
      setCompletionComment(task.completion_comment ?? "");
      setCompletedAt(task.completed_at ?? null);

      // 🔥 RESET THE FLAG when a new task is loaded
      hasCreatedRecurringInstanceRef.current = false;
    }
  }, [task]);

  // Add a ref to track if we're currently processing
  const isProcessingCompletionRef = useRef(false);

  // Replace the completion useEffect with this:
  useEffect(() => {
    if (!task || task.type !== "task") return;

    // Prevent multiple simultaneous executions
    if (isProcessingCompletionRef.current) {
      console.log("🔄 Already processing completion, skipping...");
      return;
    }

    const handleCompletionChange = async () => {
      // Only process if completion status actually changed
      if (isCompleted === (task.is_completed ?? false)) {
        return;
      }

      // Prevent duplicate processing
      isProcessingCompletionRef.current = true;

      console.log("🔄 Completion status changed:", {
        from: task.is_completed ?? false,
        to: isCompleted,
        taskName: task.name,
      });

      try {
        // Prepare the update data
        const updateData: Partial<OrgNode> = {
          id: task.id,
          is_completed: isCompleted,
        };

        // If marking as complete for the first time
        if (isCompleted && !task.is_completed) {
          updateData.completed_at = new Date().toISOString();
          updateData.completion_comment = completionComment;

          console.log(
            "🔄 Marking task as completed, will create recurring instance if applicable"
          );

          // First, update the task completion status and WAIT for it to complete
          await editNodeMutation.mutateAsync(updateData);
          console.log("✅ Task completion update finished");

          // Then create the recurring instance if needed
          if (
            !hasCreatedRecurringInstanceRef.current &&
            task.recurrence_type !== "none" &&
            task.recurrence_type
          ) {
            console.log("🔄 Task has recurrence, creating next instance...");
            hasCreatedRecurringInstanceRef.current = true;

            try {
              // Create the updated task object for the recurrence function
              const updatedTask = {
                ...task,
                is_completed: true,
                completed_at: updateData.completed_at,
                completion_comment: updateData.completion_comment,
              };

              console.log("🔍 PARENT ID DEBUG:", {
                originalTaskParentId: task.parent_id,
                updatedTaskParentId: updatedTask.parent_id,
                originalTask: task,
                updatedTask: updatedTask,
              });

              const nextInstance = await createRecurringInstance(updatedTask);
              if (nextInstance) {
                console.log(
                  "✅ Successfully created recurring instance:",
                  nextInstance.name
                );
              }
            } catch (error) {
              console.error("❌ Failed to create recurring instance:", error);
              hasCreatedRecurringInstanceRef.current = false;
            }
          }
        }
        // If unmarking as complete
        else if (!isCompleted && task.is_completed) {
          updateData.completed_at = undefined;
          updateData.completion_comment = undefined;
          console.log("🔄 Unmarking task as completed");

          await editNodeMutation.mutateAsync(updateData);
        }
      } catch (error) {
        console.error("❌ Error updating task completion:", error);
      } finally {
        // Always reset the processing flag
        isProcessingCompletionRef.current = false;
      }
    };

    const timeout = setTimeout(handleCompletionChange, 1000);
    return () => {
      clearTimeout(timeout);
      // Reset processing flag if component unmounts
      isProcessingCompletionRef.current = false;
    };
  }, [isCompleted, task?.id, task?.is_completed]); // 🔥 More specific dependencies

  useEffect(() => {
    if (!task) return;

    const timeout = setTimeout(() => {
      const hasNonCompletionChanges =
        details !== (task.details ?? "") ||
        importance !== (task.importance ?? 1) ||
        deadline !== (task.deadline ?? "") ||
        completionTime !== (task.completion_time ?? 1) ||
        uniqueDaysRequired !== (task.unique_days_required ?? 1);

      if (hasNonCompletionChanges) {
        const updateData: Partial<OrgNode> = {
          id: task.id,
          details,
          importance: task.type === "task" ? importance : undefined,
          deadline: task.type === "task" ? deadline : undefined,
          completion_time: task.type === "task" ? completionTime : undefined,
          unique_days_required:
            task.type === "task" ? uniqueDaysRequired : undefined,
        };

        console.log("🔄 Updating task fields (non-completion):", updateData);
        editNodeMutation.mutate(updateData);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    details,
    importance,
    deadline,
    completionTime,
    uniqueDaysRequired,
    task,
    editNodeMutation,
  ]); // Removed isCompleted from dependencies

  // Rest of your component remains the same...
  if (!task) return null;

  const handleDelete = () => {
    deleteNodeMutation.mutate(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center z-50 pt-20">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative max-h-[calc(90vh-5rem)] overflow-y-auto"
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h3 className="text-2xl font-bold mb-4">{task.name}</h3>

        {task.type === "task" && (
          <>
            {/* Completion Section */}
            <div
              className={`mb-6 p-4 rounded-lg border ${
                isCompleted
                  ? "bg-green-50 border-green-300"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <label className="font-semibold text-gray-700 flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                    className="mr-2 w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                  />
                  <span className={isCompleted ? "text-green-700" : ""}>
                    {isCompleted ? "Task Completed" : "Mark as Completed"}
                  </span>
                </label>
                {completedAt && (
                  <span className="text-sm text-gray-500">
                    {new Date(completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {isCompleted && (
                <div className="mt-3">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Completion Notes (optional):
                  </label>
                  <textarea
                    className="w-full text-sm text-black p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={3}
                    placeholder="Add any notes about completing this task..."
                    value={completionComment}
                    onChange={(e) => setCompletionComment(e.target.value)}
                  />
                  {completedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Completed on {new Date(completedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">
                Importance (1-10):
              </label>
              <select
                className="w-full text-black p-2 border rounded"
                value={importance}
                onChange={(e) => {
                  const newImportance = Number(e.target.value);
                  setImportance(newImportance);
                }}
                disabled={isCompleted}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">
                Deadline:
              </label>
              <input
                className="w-full text-black p-2 border rounded"
                type="date"
                value={formatDateForInput(deadline)}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={isCompleted}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">
                Estimated Completion Time (hours):
              </label>
              <input
                className="w-full text-black p-2 border rounded"
                type="number"
                min="0.5"
                step="0.5"
                value={completionTime}
                onChange={(e) => {
                  const newCompletionTime = Number(e.target.value);
                  setCompletionTime(newCompletionTime);
                }}
                disabled={isCompleted}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">
                Unique Days Required:
              </label>
              <input
                className="w-full text-black p-2 border rounded"
                type="number"
                min="0.5"
                step="0.5"
                value={uniqueDaysRequired}
                onChange={(e) => {
                  const newUniqueDaysRequired = Number(e.target.value);
                  setUniqueDaysRequired(newUniqueDaysRequired);
                }}
                disabled={isCompleted}
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of separate days needed to complete this task
              </p>
            </div>

            {/* Show calculated urgency level */}
            {!isCompleted && (
              <div className="mb-4 p-3 bg-gray-100 rounded">
                <label className="block mb-1 font-semibold text-gray-700">
                  Calculated Urgency Level:
                </label>
                <div className="text-lg font-bold text-blue-600">
                  Level {currentUrgencyLevel}
                </div>
                {deadline && completionTime && uniqueDaysRequired && (
                  <p className="text-xs text-gray-600 mt-1">
                    Based on deadline, completion time, and unique days required
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <label className="block mb-2 font-semibold text-gray-700">
          Details:
        </label>
        <textarea
          className="w-full text-black p-2 border rounded mb-4"
          rows={4}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          disabled={task.type === "task" && isCompleted}
        />

        {task.type === "task" && (
          <RecurrenceDisplay task={task} className="mb-4" />
        )}

        {!isCompleted && (
          <button
            className="mt-6 bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
            onClick={handleDelete}
          >
            Delete {task.type === "task" ? "Task" : "Category"}
          </button>
        )}
      </div>
    </div>
  );
}
