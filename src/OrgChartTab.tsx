import { useState } from "react";
import type { OrgNode } from "./types/orgChart";
import AddNodeForm from "./AddNodeForm";
import { useAddOrgNode } from "./hooks/useAddOrgNode";

function OrgChartNode({
  node,
  level = 0,
  onTaskClick,
  openMap,
  toggleOpen,
  path,
}: {
  node: OrgNode;
  level?: number;
  onTaskClick: (node: OrgNode) => void;
  openMap: Record<string, boolean>;
  toggleOpen: (path: string) => void;
  path: string;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isTask = node.type === "task";
  const isOpen = openMap[path] || false;
  const addNodeMutation = useAddOrgNode(node.tab_name ?? "");
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddNode = (newNode: {
    name: string;
    type: "category" | "task";
    details?: string;
  }) => {
    addNodeMutation.mutate({
      ...newNode,
      parent_id: node.id,
      tab_name: newNode.name,
      root_category: node.root_category,
    });
  };

  return (
    <div
      className={`flex flex-col items-center w-full ${
        level === 0 ? "" : "mt-4"
      }`}
    >
      <div className="bg-white rounded-lg shadow min-w-[120px] text-center outline outline-gray-400 relative">
        {isTask ? (
          <button
            className="text-lg text-white font-semibold underline hover:text-blue-200 focus:outline-none bg-blue-600"
            onClick={() => onTaskClick(node)}
          >
            {node.name}
          </button>
        ) : (
          <button
            className="text-lg text-white font-semibold w-full text-center focus:outline-none bg-gray-800"
            onClick={() => toggleOpen(path)}
            type="button"
          >
            <span className="flex items-center justify-center gap-2">
              {node.name}
              <span className="ml-1 text-gray-400">{isOpen ? "▼" : "▶"}</span>
            </span>
          </button>
        )}
      </div>
      {/* Always render the children grid when expanded, even if empty */}
      {!isTask && isOpen && (
        <div
          className={`grid gap-4 mt-4 w-full ${
            level === 0
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {node.children?.map((child) => (
            <OrgChartNode
              key={child.name}
              node={child}
              level={level + 1}
              onTaskClick={onTaskClick}
              openMap={openMap}
              toggleOpen={toggleOpen}
              path={`${path}/${child.name}`}
            />
          ))}
          {/* "+" button as a sibling to children */}
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-blue-700"
              onClick={() => setShowAddModal(true)}
              title="Add Node"
              type="button"
            >
              +
            </button>
          </div>
        </div>
      )}
      {/* Modal for AddNodeForm */}
      {showAddModal && (
        <AddNodeForm
          parent_id={node.id}
          tab_name={node.tab_name ?? ""}
          onAdd={handleAddNode}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

type OrgChartTabProps = {
  tree: OrgNode;
  tabName: string;
};

export default function OrgChartTab({ tree, tabName }: OrgChartTabProps) {
  const [modalTask, setModalTask] = useState<OrgNode | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    [`/${tabName}`]: true,
  });

  const toggleOpen = (path: string) => {
    setOpenMap((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // Handler for adding a node at the top level
  const addNodeMutation = useAddOrgNode(tabName);
  const handleAddNode = (newNode: {
    name: string;
    type: "category" | "task";
    details?: string;
  }) => {
    addNodeMutation.mutate({
      ...newNode,
      parent_id: tree.id,
      tab_name: newNode.name,
      root_category: tabName, // <-- use tabName here
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-center mb-8">{tabName}</h2>
      <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
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
        <div className="flex items-center justify-center">
          <button
            className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-blue-700"
            onClick={() => setShowAddModal(true)}
            title="Add Node"
            type="button"
          >
            +
          </button>
        </div>
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
            <p className="text-gray-700">{modalTask.details}</p>
          </div>
        </div>
      )}
    </div>
  );
}
