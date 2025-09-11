// src/components/TaskForm.tsx
import { useState, useEffect } from "react";
import { useDeleteTask, useSaveTask } from "../../hooks/useTasks";
import type { Task } from "../../hooks/useTasks";

interface TaskFormProps {
  task?: Task; // undefined = creating new
  onCancel: () => void;
}

export default function TaskForm({ task, onCancel }: TaskFormProps) {
  const [name, setName] = useState(task?.name ?? "");
  const [details, setDetails] = useState(task?.details ?? "");
  const [importance, setImportance] = useState(task?.importance ?? 1);
  const [deadline, setDeadline] = useState(task?.deadline ?? "");
  const [rootCategory, setRootCategory] = useState(task?.root_category ?? "");

  const saveTask = useSaveTask();
  const deleteTask = useDeleteTask();

  // Sync when editing task changes
  useEffect(() => {
    if (task) {
      setName(task.name);
      setDetails(task.details ?? "");
      setImportance(task.importance ?? 1);
      setDeadline(task.deadline ?? "");
      setRootCategory(task.root_category ?? "");
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveTask.mutate({
      id: task?.id,
      name,
      details,
      importance,
      deadline,
      root_category: rootCategory,
    });
    onCancel(); // close modal after save
  };

  const handleDelete = () => {
    if (task?.id) {
      deleteTask.mutate(task.id);
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg bg-white p-6 text-black shadow-md"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          className="mt-1 block w-full rounded border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Details
        </label>
        <textarea
          className="mt-1 block w-full rounded border p-2"
          rows={3}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Importance (1-10)
        </label>
        <input
          type="number"
          min={1}
          max={10}
          className="mt-1 block w-full rounded border p-2"
          value={importance}
          onChange={(e) => setImportance(Number(e.target.value))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Deadline
        </label>
        <input
          type="date"
          className="mt-1 block w-full rounded border p-2"
          value={deadline ? deadline.split("T")[0] : ""}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Root Category
        </label>
        <input
          className="mt-1 block w-full rounded border p-2"
          value={rootCategory}
          onChange={(e) => setRootCategory(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-between">
        {task?.id && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Delete
          </button>
        )}
        <div className="ml-auto space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveTask.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </form>
  );
}
