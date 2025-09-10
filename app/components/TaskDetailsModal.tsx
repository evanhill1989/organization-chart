import { useState, useEffect, useRef, useCallback } from "react";
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

      // Reset recurring instance flag when new task loads
      hasCreatedRecurringInstanceRef.current = false;
    }
  }, [task]);

  // Single, unified save function
  const forceSaveChanges = useCallback(async () => {
    if (!task) return;

    // Check if ANY field has changed
    const hasChanges =
      details !== (task.details ?? "") ||
      importance !== (task.importance ?? 1) ||
      deadline !== (task.deadline ?? "") ||
      completionTime !== (task.completion_time ?? 1) ||
      uniqueDaysRequired !== (task.unique_days_required ?? 1) ||
      isCompleted !== (task.is_completed ?? false) ||
      completionComment !== (task.completion_comment ?? "");

    if (!hasChanges) return; // Nothing to save

    // Prevent multiple simultaneous executions
    if (isProcessingCompletionRef.current) {
      console.log("🔄 Already processing save, skipping...");
      return;
    }

    isProcessingCompletionRef.current = true;

    try {
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
      };

      // Handle completed_at timestamp
      if (isCompleted && !task.is_completed) {
        updateData.completed_at = new Date().toISOString();
      } else if (!isCompleted && task.is_completed) {
        updateData.completed_at = undefined;
      }

      console.log("🔄 Saving all task changes:", updateData);

      // Save the changes
      await editNodeMutation.mutateAsync(updateData);

      // Handle recurring task creation if completion status changed to true
      if (
        isCompleted &&
        !task.is_completed &&
        !hasCreatedRecurringInstanceRef.current &&
        task.recurrence_type !== "none" &&
        task.recurrence_type
      ) {
        console.log(
          "🔄 Task completed with recurrence, creating next instance...",
        );
        hasCreatedRecurringInstanceRef.current = true;

        try {
          const updatedTask = {
            ...task,
            ...updateData,
            is_completed: true,
            completed_at: updateData.completed_at,
            completion_comment: updateData.completion_comment,
          };

          const nextInstance = await createRecurringInstance(updatedTask);
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
    } catch (error) {
      console.error("❌ Error saving task changes:", error);
    } finally {
      isProcessingCompletionRef.current = false;
    }
  }, [
    task,
    details,
    importance,
    deadline,
    completionTime,
    uniqueDaysRequired,
    isCompleted,
    completionComment,
    editNodeMutation,
  ]);

  // Single debounced save effect for ALL changes
  useEffect(() => {
    if (!task) return;

    const timeout = setTimeout(forceSaveChanges, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Enhanced close handler
  const handleClose = useCallback(() => {
    forceSaveChanges();
    onClose();
  }, [onClose]);

  // Force save on unmount (backup)
  useEffect(() => {
    return () => {
      forceSaveChanges();
      // Reset processing flag if component unmounts
      isProcessingCompletionRef.current = false;
    };
  }, []);

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

        {task.type === "task" && (
          <RecurrenceDisplay task={task} className="mb-4" />
        )}

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
