import { socialTree } from "./data/socialTree";
import type { OrgNode } from "./data/socialTree";
import { useState } from "react";

type OrgChartNodeProps = {
  node: OrgNode;
  level?: number;
  onTaskClick: (node: OrgNode) => void;
  openMap: Record<string, boolean>;
  toggleOpen: (path: string) => void;
  path: string;
};

function OrgChartNode({
  node,
  level = 0,
  onTaskClick,
  openMap,
  toggleOpen,
  path,
}: OrgChartNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isTask = node.type === "task";
  const isOpen = openMap[path] || false;
  return (
    <div
      className={`flex flex-col items-center w-full ${
        level === 0 ? "" : "mt-4"
      }`}
    >
      <div className="bg-white rounded-lg shadow p-4 min-w-[120px] text-center outline outline-gray-400">
        {isTask ? (
          <button
            className="text-lg text-blue-600 font-semibold underline hover:text-blue-800 focus:outline-none"
            onClick={() => onTaskClick(node)}
          >
            {node.name}
          </button>
        ) : (
          <button
            className="text-lg text-black font-semibold w-full text-center focus:outline-none"
            onClick={() => toggleOpen(path)}
            type="button"
          >
            <span className="flex items-center justify-center gap-2">
              {node.name}
              {hasChildren && (
                <span className="ml-1 text-gray-400">{isOpen ? "▼" : "▶"}</span>
              )}
            </span>
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <div
          className={`grid gap-4 mt-4 w-full ${
            level === 0
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {node.children!.map((child) => (
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
        </div>
      )}
    </div>
  );
}

function Social() {
  const [modalTask, setModalTask] = useState<OrgNode | null>(null);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    "/Social": true,
  });

  const toggleOpen = (path: string) => {
    setOpenMap((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-center mb-8">Social</h2>
      <OrgChartNode
        node={socialTree}
        onTaskClick={setModalTask}
        openMap={openMap}
        toggleOpen={toggleOpen}
        path="/Social"
      />

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

export default Social;
