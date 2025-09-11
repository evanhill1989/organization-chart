//components/TaskDetailsModal.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { OrgNode, OrgNodeRow, RecurrenceType } from "../../types/orgChart";
import { useEditOrgNode } from "../../hooks/useEditOrgNode";
import { useDeleteOrgNode } from "../../hooks/useDeleteOrgNode";
import { calculateUrgencyLevel } from "../../lib/urgencyUtils";
import RecurrenceConfig from "../RecurrenceConfig";
import { createRecurringInstance } from "../../lib/createRecurringInstance";

interface TaskDetailsModalProps {
  task: OrgNodeRow | null;
  onClose: () => void;
}

type RecurrenceConfigType = {
  recurrence_type: RecurrenceType;
  recurrence_interval?: number;
  recurrence_day_of_week?: number;
  recurrence_day_of_month?: number;
  recurrence_end_date?: string;
  is_recurring_template?: boolean;
};

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

  // Recurrence configuration state
  const [recurrenceConfig, setRecurrenceConfig] =
    useState<RecurrenceConfigType>({
      recurrence_type: "none",
      recurrence_interval: undefined,
      recurrence_day_of_week: undefined,
      recurrence_day_of_month: undefined,
      recurrence_end_date: undefined,
      is_recurring_template: false,
    });

  const editNodeMutation = useEditOrgNode(task?.root_category || "");
  const deleteNodeMutation = useDeleteOrgNode(task?.root_category || "");

  // Ref for modal GSAP animation
  const modalRef = useRef<HTMLDivElement>(null);

  // Track if we've created a recurring instance
  const hasCreatedRecurringInstanceRef = useRef(false);
  const isProcessingCompletionRef = useRef(false);

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

      // Initialize recurrence configuration
      setRecurrenceConfig({
        recurrence_type: task.recurrence_type || "none",
        recurrence_interval: task.recurrence_interval,
        recurrence_day_of_week: task.recurrence_day_of_week,
        recurrence_day_of_month: task.recurrence_day_of_month,
        recurrence_end_date: task.recurrence_end_date,
        is_recurring_template: task.is_recurring_template || false,
      });

      // Reset recurring instance flag when new task loads
      hasCreatedRecurringInstanceRef.current = false;
    }
  }, [task]);

  // Single, unified save function
  const forceSaveChanges = useCallback(() => {
    if (!task) return;

    // Prevent multiple simultaneous executions
    if (isProcessingCompletionRef.current) {
      console.log("🔄 Already processing save, skipping...");
      return;
    }

    isProcessingCompletionRef.current = true;

    // Build complete update object with ALL current values
    const updateData: Partial<OrgNode> = {
      id: task.id,
      details,
      importance: task.type === "task" ? importance : undefined,
      deadline: task.type === "task" ? deadline : undefined,
      completion_time: task.type === "task" ? completionTime : undefined,
      unique_days_required:
        task.type === "task" ? uniqueDaysRequired : undefined,
      is_completed: isCompleted,
      completion_comment: completionComment,

      // Add recurrence fields
      recurrence_type: recurrenceConfig.recurrence_type,
      recurrence_interval: recurrenceConfig.recurrence_interval,
      recurrence_day_of_week: recurrenceConfig.recurrence_day_of_week,
      recurrence_day_of_month: recurrenceConfig.recurrence_day_of_month,
      recurrence_end_date: recurrenceConfig.recurrence_end_date,
      is_recurring_template: recurrenceConfig.is_recurring_template,
    };

    // Handle completed_at timestamp
    if (isCompleted && !task.is_completed) {
      updateData.completed_at = new Date().toISOString();
    } else if (!isCompleted && task.is_completed) {
      updateData.completed_at = undefined;
    }

    console.log("🔄 Saving all task changes:", updateData);

    // Save the changes
    editNodeMutation.mutate(updateData, {
      onSuccess: async (updatedTask) => {
        // Handle recurring task creation if completion status changed to true
        console.log(updatedTask, "updatedTask inside TaskDetailsModal");
        if (
          isCompleted &&
          !task.is_completed &&
          !hasCreatedRecurringInstanceRef.current &&
          recurrenceConfig.recurrence_type !== "none" &&
          recurrenceConfig.recurrence_type
        ) {
          console.log(
            "🔄 Task completed with recurrence, creating next instance...",
          );
          hasCreatedRecurringInstanceRef.current = true;

          try {
            const completedTaskData = {
              ...task,
              is_completed: true,
              completed_at: updateData.completed_at,
              completion_comment: updateData.completion_comment,
              // Use current recurrence config
              recurrence_type: recurrenceConfig.recurrence_type,
              recurrence_interval: recurrenceConfig.recurrence_interval,
              recurrence_day_of_week: recurrenceConfig.recurrence_day_of_week,
              recurrence_day_of_month: recurrenceConfig.recurrence_day_of_month,
              recurrence_end_date: recurrenceConfig.recurrence_end_date,
              is_recurring_template: recurrenceConfig.is_recurring_template,
            };

            const nextInstance =
              await createRecurringInstance(completedTaskData);
            if (nextInstance) {
              console.log(
                "✅ Successfully created recurring instance:",
                nextInstance.name,
              );
            }
          } catch (error) {
            console.error("❌ Failed to create recurring instance:", error);
            hasCreatedRecurringInstanceRef.current = false;
          }
        }
      },
      onError: (error) => {
        console.error("❌ Error saving task changes:", error);
      },
      onSettled: () => {
        isProcessingCompletionRef.current = false;
      },
    });
  }, []); // Empty dependency array to prevent loops

  // Individual debounced effects for different field groups
  useEffect(() => {
    if (!task) return;

    const hasNonCompletionChanges =
      details !== (task.details ?? "") ||
      importance !== (task.importance ?? 1) ||
      deadline !== (task.deadline ?? "") ||
      completionTime !== (task.completion_time ?? 1) ||
      uniqueDaysRequired !== (task.unique_days_required ?? 1) ||
      // Add recurrence change detection
      recurrenceConfig.recurrence_type !== (task.recurrence_type || "none") ||
      recurrenceConfig.recurrence_interval !== task.recurrence_interval ||
      recurrenceConfig.recurrence_day_of_week !== task.recurrence_day_of_week ||
      recurrenceConfig.recurrence_day_of_month !==
        task.recurrence_day_of_month ||
      recurrenceConfig.recurrence_end_date !== task.recurrence_end_date ||
      recurrenceConfig.is_recurring_template !==
        (task.is_recurring_template || false);

    if (!hasNonCompletionChanges) return;

    const timeout = setTimeout(forceSaveChanges, 1000);
    return () => clearTimeout(timeout);
  }, [
    details,
    importance,
    deadline,
    completionTime,
    uniqueDaysRequired,
    recurrenceConfig,
    task,
    forceSaveChanges,
  ]);

  // Separate effect for completion changes
  useEffect(() => {
    if (!task) return;

    const hasCompletionChanges =
      isCompleted !== (task.is_completed ?? false) ||
      completionComment !== (task.completion_comment ?? "");

    if (!hasCompletionChanges) return;

    const timeout = setTimeout(forceSaveChanges, 1000);
    return () => clearTimeout(timeout);
  }, [isCompleted, completionComment, task, forceSaveChanges]);

  // Enhanced close handler
  const handleClose = useCallback(() => {
    forceSaveChanges();
    onClose();
  }, [forceSaveChanges, onClose]);

  // Force save on unmount (backup)
  useEffect(() => {
    return () => {
      forceSaveChanges();
      // Reset processing flag if component unmounts
      isProcessingCompletionRef.current = false;
    };
  }, [forceSaveChanges]);

  if (!task) return null;

  const handleDelete = () => {
    deleteNodeMutation.mutate(task.id);
    onClose();
  };

  return (
    <div className="bg-opacity-40 fixed inset-0 z-50 flex items-start justify-center bg-black pt-20">
      <div
        ref={modalRef}
        className="relative max-h-[calc(90vh-5rem)] w-full max-w-md overflow-y-auto rounded-lg bg-white p-8 shadow-lg"
      >
        <button
          className="absolute top-2 right-2 text-2xl font-bold text-gray-500 hover:text-gray-800"
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h3 className="mb-4 text-2xl font-bold">{task.name}</h3>

        {task.type === "task" && (
          <>
            {/* Completion Section */}
            <div
              className={`mb-6 rounded-lg border p-4 ${
                isCompleted
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <label className="flex cursor-pointer items-center font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                    className="mr-2 h-5 w-5 cursor-pointer rounded text-green-600 focus:ring-green-500"
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Completion Notes (optional):
                  </label>
                  <textarea
                    className="w-full rounded border p-2 text-sm text-black focus:border-green-500 focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Add any notes about completing this task..."
                    value={completionComment}
                    onChange={(e) => setCompletionComment(e.target.value)}
                  />
                  {completedAt && (
                    <p className="mt-1 text-xs text-gray-500">
                      Completed on {new Date(completedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-2 block font-semibold text-gray-700">
                Importance (1-10):
              </label>
              <select
                className="w-full rounded border p-2 text-black"
                value={importance}
                onChange={(e) => setImportance(Number(e.target.value))}
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
              <label className="mb-2 block font-semibold text-gray-700">
                Deadline:
              </label>
              <input
                className="w-full rounded border p-2 text-black"
                type="date"
                value={formatDateForInput(deadline)}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={isCompleted}
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block font-semibold text-gray-700">
                Estimated Completion Time (hours):
              </label>
              <input
                className="w-full rounded border p-2 text-black"
                type="number"
                min="0.5"
                step="0.5"
                value={completionTime}
                onChange={(e) => setCompletionTime(Number(e.target.value))}
                disabled={isCompleted}
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block font-semibold text-gray-700">
                Unique Days Required:
              </label>
              <input
                className="w-full rounded border p-2 text-black"
                type="number"
                min="0.5"
                step="0.5"
                value={uniqueDaysRequired}
                onChange={(e) => setUniqueDaysRequired(Number(e.target.value))}
                disabled={isCompleted}
              />
              <p className="mt-1 text-xs text-gray-500">
                Number of separate days needed to complete this task
              </p>
            </div>

            {/* Show calculated urgency level */}
            {!isCompleted && (
              <div className="mb-4 rounded bg-gray-100 p-3">
                <label className="mb-1 block font-semibold text-gray-700">
                  Calculated Urgency Level:
                </label>
                <div className="text-lg font-bold text-blue-600">
                  Level {currentUrgencyLevel}
                </div>
                {deadline && completionTime && uniqueDaysRequired && (
                  <p className="mt-1 text-xs text-gray-600">
                    Based on deadline, completion time, and unique days required
                  </p>
                )}
              </div>
            )}

            {/* Editable Recurrence Configuration */}
            <RecurrenceConfig
              initialConfig={{
                type: recurrenceConfig.recurrence_type,
                interval: recurrenceConfig.recurrence_interval || 1,
                dayOfWeek: recurrenceConfig.recurrence_day_of_week,
                dayOfMonth: recurrenceConfig.recurrence_day_of_month,
                endDate: recurrenceConfig.recurrence_end_date,
              }}
              onChange={setRecurrenceConfig}
              disabled={isCompleted}
              className="mb-4"
            />
          </>
        )}

        <label className="mb-2 block font-semibold text-gray-700">
          Details:
        </label>
        <textarea
          className="mb-4 w-full rounded border p-2 text-black"
          rows={4}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          disabled={task.type === "task" && isCompleted}
        />

        {!isCompleted && (
          <button
            className="mt-6 rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
            onClick={handleDelete}
          >
            Delete {task.type === "task" ? "Task" : "Category"}
          </button>
        )}
      </div>
    </div>
  );
}
