import { useState } from "react";

type AddNodeFormProps = {
  parent_id?: number;
  tab_name: string;
  onAdd: (node: {
    name: string;
    type: "category" | "task";
    details?: string;
  }) => void;
  onClose: () => void;
};

export default function AddNodeForm({
  parent_id,
  tab_name,
  onAdd,
  onClose,
}: AddNodeFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"category" | "task">("task");
  const [details, setDetails] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        className="bg-gray-800 rounded-lg shadow-lg min-w-[320px] p-6 flex flex-col items-center relative"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            onAdd({
              name: name.trim(),
              type,
              details: details.trim() || undefined,
            });
            setName("");
            setDetails("");
            onClose();
          }
        }}
      >
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4 text-white">Add New Node</h3>
        <input
          className="mb-2 px-2 py-1 rounded w-full text-black"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select
          className="mb-2 px-2 py-1 rounded w-full"
          value={type}
          onChange={(e) => setType(e.target.value as "category" | "task")}
        >
          <option value="category">Category</option>
          <option value="task">Task</option>
        </select>
        <input
          className="mb-2 px-2 py-1 rounded w-full text-black"
          type="text"
          placeholder="Details (optional)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded font-semibold hover:bg-blue-700 mt-2"
          type="submit"
        >
          Add
        </button>
      </form>
    </div>
  );
}
