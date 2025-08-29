import { useState, useEffect } from "react";
import { supabase } from "../lib/db/supabaseClient";
import type { OrgNodeRow } from "../types/orgChart";

import TaskDetailsModal from "./TaskDetailsModal";
import AddNodeForm from "../AddNodeForm";

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
  console.log("QuickAddEditModal rendered with isOpen:", isOpen);

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
  const [taskForEditing, setTaskForEditing] = useState<any>(null);

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
  const handleAddSuccess = () => {
    setShowAddForm(false);
    setSelectedParent("");
    fetchData(); // Refresh data
  };

  // Handle successful edit
  const handleEditSuccess = () => {
    setTaskForEditing(null);
    setSelectedTask("");
    fetchData(); // Refresh data
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Don't render if closed
  if (!isOpen) {
    console.log("QuickAddEditModal not rendering because isOpen is false");
    return null;
  }

  console.log("QuickAddEditModal rendering modal content");

  // Get selected parent node for add form
  const selectedParentNode = selectedParent
    ? allNodes.find((n) => n.id === selectedParent)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] overflow-y-auto">
      <div className="min-h-screen px-4 py-6 flex items-start justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Quick Task Manager
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Mode Selection */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleActionModeChange("add")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  actionMode === "add"
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                Add Task
              </button>
              <button
                type="button"
                onClick={() => handleActionModeChange("edit")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  actionMode === "edit"
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                Edit Task
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Content */}
          {!isLoading && (
            <div className="p-6 space-y-4">
              {/* ADD MODE */}
              {actionMode === "add" && (
                <>
                  {/* Parent Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Add to Category *
                    </label>
                    <select
                      value={selectedParent}
                      onChange={(e) =>
                        handleParentSelection(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Add to Category *
                      </label>
                      <select
                        value={selectedParent}
                        onChange={(e) =>
                          handleParentSelection(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
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
        <AddNodeForm
          parent_id={selectedParent as number}
          tab_name={selectedParentNode.root_category}
          onAdd={handleAddSuccess}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Form Modal - Reuse existing TaskDetailsModal */}
      {taskForEditing && (
        <TaskDetailsModal task={taskForEditing} onClose={handleEditSuccess} />
      )}
    </div>
  );
}
