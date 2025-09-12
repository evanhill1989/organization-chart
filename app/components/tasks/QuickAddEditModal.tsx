import { useState, useEffect } from "react";

import type { OrgNodeRow } from "../../types/orgChart";
import { useAddOrgNode } from "../../hooks/useAddOrgNode";


import TaskForm from "./TaskForm";

import { supabase } from "../../lib/data/supabaseClient";

interface QuickAddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FlatNode {
  id: number;
  name: string;
  type: string;
  root_category: string;
  path: string;
}

type ActionMode = "add" | "edit";

export default function QuickAddEditModal({
  isOpen,
  onClose,
}: QuickAddEditModalProps) {
  // Main state
  const [actionMode, setActionMode] = useState<ActionMode>("add");
  const [allNodes, setAllNodes] = useState<FlatNode[]>([]);
  const [allTasks, setAllTasks] = useState<FlatNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add mode state
  const [selectedParent, setSelectedParent] = useState<number | "">("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit mode state
  const [selectedTask, setSelectedTask] = useState<number | "new" | "">("");
  const [taskForEditing, setTaskForEditing] = useState<OrgNodeRow | null>(null);

  // Get selected parent node for add form
  const selectedParentNode = selectedParent
    ? allNodes.find((n) => n.id === selectedParent)
    : null;

  // Get the mutation hook for adding nodes
  const addNodeMutation = useAddOrgNode(
    selectedParentNode?.root_category || "",
  );

  // Helper to build node path for display
  const buildNodePath = (node: OrgNodeRow, allNodes: OrgNodeRow[]): string => {
    const parts = [node.name];
    let currentNode = node;

    while (currentNode.parent_id) {
      const parent = allNodes.find((n) => n.id === currentNode.parent_id);
      if (parent) {
        parts.unshift(parent.name);
        currentNode = parent;
      } else {
        break;
      }
    }

    return parts.join(" > ");
  };

  // Fetch all nodes and tasks
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: nodes, error: nodesError } = await supabase
        .from("org_nodes")
        .select("*")
        .order("root_category, name");

      if (nodesError) throw nodesError;

      const typedNodes = nodes as OrgNodeRow[];

      // Build flat list of categories for parent selection
      const categories = typedNodes
        .filter((node) => node.type === "category")
        .map((node) => ({
          id: node.id,
          name: node.name,
          type: node.type,
          root_category: node.root_category,
          path: buildNodePath(node, typedNodes),
        }));

      // Build flat list of tasks for editing
      const tasks = typedNodes
        .filter((node) => node.type === "task")
        .map((node) => ({
          id: node.id,
          name: node.name,
          type: node.type,
          root_category: node.root_category,
          path: buildNodePath(node, typedNodes),
        }));

      setAllNodes(categories);
      setAllTasks(tasks);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load task for editing
  const loadTaskForEditing = async (taskId: number) => {
    try {
      const { data: task, error } = await supabase
        .from("org_nodes")
        .select("*")
        .eq("id", taskId)
        .single();

      if (error) throw error;

      setTaskForEditing(task);
    } catch (err) {
      console.error("Error loading task:", err);
      setError("Failed to load task data");
    }
  };

  // Handle action mode change
  const handleActionModeChange = (mode: ActionMode) => {
    setActionMode(mode);
    setSelectedParent("");
    setSelectedTask("");
    setShowAddForm(false);
    setTaskForEditing(null);
  };

  // Handle parent selection for add mode
  const handleParentSelection = (parentId: number | "") => {
    setSelectedParent(parentId);
    setShowAddForm(!!parentId); // Show add form when parent is selected
  };

  // Handle task selection for edit mode
  const handleTaskSelection = async (taskId: number | "new" | "") => {
    setSelectedTask(taskId);

    if (taskId === "new") {
      // Show parent selection for new task
      setShowAddForm(false);
      setTaskForEditing(null);
    } else if (typeof taskId === "number") {
      // Load existing task for editing
      await loadTaskForEditing(taskId);
    } else {
      // Clear selection
      setTaskForEditing(null);
      setShowAddForm(false);
    }
  };

  // Handle successful add
  const handleAddSuccess = (newNode: {
    name: string;
    type: "category" | "task";
    details?: string;
    importance?: number;
    deadline?: string;
    completion_time?: number;
    unique_days_required?: number;
  }) => {
    if (!selectedParentNode) return;

    const mutationData = {
      ...newNode,
      parent_id: selectedParent as number,
      tab_name: selectedParentNode.root_category,
      root_category: selectedParentNode.root_category,
    };

    addNodeMutation.mutate(mutationData, {
      onSuccess: () => {
        setShowAddForm(false);
        setSelectedParent("");
        fetchData(); // Refresh data
      },
    });
  };

  const handleEditSuccess = () => {
    setTaskForEditing(null);
    setSelectedTask("");
    fetchData(); // Refresh data
    onClose(); // ✅ Close the main modal too
  };
  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Don't render if closed
  if (!isOpen) {
    return null;
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-[60] overflow-y-auto bg-black">
      <div className="flex min-h-screen items-start justify-center px-4 py-6">
        <div className="mx-auto w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-600">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Quick Task Manager
            </h2>
            <button
              onClick={onClose}
              className="text-2xl font-bold text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Mode Selection */}
          <div className="border-b border-gray-200 p-6 dark:border-gray-600">
            <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
              <button
                type="button"
                onClick={() => handleActionModeChange("add")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  actionMode === "add"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                }`}
              >
                Add Task
              </button>
              <button
                type="button"
                onClick={() => handleActionModeChange("edit")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  actionMode === "edit"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                }`}
              >
                Edit Task
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="border-l-4 border-red-400 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Content */}
          {!isLoading && (
            <div className="space-y-4 p-6">
              {/* ADD MODE */}
              {actionMode === "add" && (
                <>
                  {/* Parent Selection */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Add to Category *
                    </label>
                    <select
                      value={selectedParent}
                      onChange={(e) =>
                        handleParentSelection(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="">Select a category...</option>
                      {allNodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.path}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Instructions */}
                  {!selectedParent && (
                    <p className="text-sm text-gray-500 italic dark:text-gray-400">
                      Select a category above to add a new task
                    </p>
                  )}
                </>
              )}

              {/* EDIT MODE */}
              {actionMode === "edit" && (
                <>
                  {/* Task Selection */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Task *
                    </label>
                    <select
                      value={selectedTask}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "new") {
                          handleTaskSelection("new");
                        } else if (value === "") {
                          handleTaskSelection("");
                        } else {
                          handleTaskSelection(Number(value));
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="">Choose an option...</option>
                      <option value="new">Create New Task</option>
                      <optgroup label="Existing Tasks">
                        {allTasks.map((task) => (
                          <option key={task.id} value={task.id}>
                            {task.path}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Parent Selection for new task in edit mode */}
                  {selectedTask === "new" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Add to Category *
                      </label>
                      <select
                        value={selectedParent}
                        onChange={(e) =>
                          handleParentSelection(
                            e.target.value ? Number(e.target.value) : "",
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="">Select a category...</option>
                        {allNodes.map((node) => (
                          <option key={node.id} value={node.id}>
                            {node.path}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Instructions */}
                  {!selectedTask && (
                    <p className="text-sm text-gray-500 italic dark:text-gray-400">
                      Select a task above to edit, or create a new one
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Form Modal - Reuse existing AddNodeForm */}
      {showAddForm && selectedParentNode && (
        <TaskForm
          parentId={selectedParent as number}
          parentName={selectedParentNode.name}
          rootCategory={selectedParentNode.root_category}
          tabName={selectedParentNode.root_category}
          onCancel={() => {
            setShowAddForm(false);
            setSelectedParent("");
          }}
        />
      )}

      {/* Edit Form Modal - Reuse existing TaskDetailsModal */}
      {taskForEditing && (
        <TaskForm task={taskForEditing} onCancel={handleEditSuccess} />
      )}
    </div>
  );
}
