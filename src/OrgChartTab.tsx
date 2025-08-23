import { useState, useEffect } from "react";
import type { OrgNode } from "./types/orgChart";
import AddNodeForm from "./AddNodeForm";
import OrgChartNode from "./OrgChartNode";
import { useAddOrgNode } from "./hooks/useAddOrgNode";
import { useDeleteOrgNode } from "./hooks/useDeleteOrgNode";
import { useEditOrgNode } from "./hooks/useEditOrgNode";

type OrgChartTabProps = {
  tree: OrgNode;
  tabName: string;
};

export default function OrgChartTab({ tree, tabName }: OrgChartTabProps) {
  const [modalTask, setModalTask] = useState<OrgNode | null>(null);
  const [details, setDetails] = useState(modalTask?.details ?? "");
  const [urgency, setUrgency] = useState(modalTask?.urgency ?? 1);
  const addNodeMutation = useAddOrgNode(tabName);
  const editNodeMutation = useEditOrgNode(tabName);
  const deleteNodeMutation = useDeleteOrgNode(tabName);

  const handleAddNode = (newNode: {
    name: string;
    type: "category" | "task";
    details?: string;
    urgency?: number;
  }) => {
    const mutationData = {
      ...newNode,
      parent_id: tree.id,
      tab_name: tabName,
      root_category: tabName,
    };

    addNodeMutation.mutate(mutationData);
  };

  useEffect(() => {
    setDetails(modalTask?.details ?? "");
    setUrgency(modalTask?.urgency ?? 1);
  }, [modalTask]);

  useEffect(() => {
    if (!modalTask) return;
    const timeout = setTimeout(() => {
      if (details !== modalTask.details || urgency !== modalTask.urgency) {
        editNodeMutation.mutate({
          id: modalTask.id,
          details,
          urgency: modalTask.type === "task" ? urgency : undefined,
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeout);
  }, [details, urgency, modalTask, editNodeMutation]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    [`/${tabName}`]: true,
  });

  const toggleOpen = (path: string) => {
    setOpenMap((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-center mb-8">{tabName}</h2>
      <div className="grid gap-4 w-full auto-cols-min grid-flow-col">
        {/* Render all children of the top_category as siblings */}
        {tree.children?.map((child) => (
          <OrgChartNode
            key={child.name}
            node={child}
            onTaskClick={setModalTask}
            openMap={openMap}
            toggleOpen={toggleOpen}
            path={`/${tabName}/${child.name}`}
          />
        ))}

        {/* "+" button as a sibling */}
        <button
          className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-blue-700"
          onClick={() => setShowAddModal(true)}
          title="Add Node"
          type="button"
        >
          +
        </button>
      </div>

      {/* Modal for AddNodeForm */}
      {showAddModal && (
        <AddNodeForm
          parent_id={tree.id}
          tab_name={tabName}
          onAdd={handleAddNode}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Modal for task details */}
      {modalTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              onClick={() => setModalTask(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4">{modalTask.name}</h3>

            {modalTask.type === "task" && (
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-gray-700">
                  Urgency (1-10):
                </label>
                <select
                  className="w-full text-black p-2 border rounded"
                  value={urgency}
                  onChange={(e) => {
                    const newUrgency = Number(e.target.value);
                    setUrgency(newUrgency);
                    editNodeMutation.mutate({
                      id: modalTask.id,
                      urgency: newUrgency,
                    });
                    setModalTask({ ...modalTask, urgency: newUrgency });
                  }}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <label className="block mb-2 font-semibold text-gray-700">
              Details:
            </label>
            <textarea
              className="w-full text-black p-2 border rounded mb-4"
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                editNodeMutation.mutate({
                  id: modalTask.id,
                  details: e.target.value,
                });
                setModalTask({ ...modalTask, details: e.target.value });
              }}
            />

            <button
              className="mt-6 bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
              onClick={() => {
                deleteNodeMutation.mutate(modalTask.id);
                setModalTask(null);
              }}
            >
              Delete Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
