import { useState } from "react";

import Household from "./Household";
import Finances from "./Finances";
import Cleo from "./Cleo";
import Job from "./Job";

function App() {
  const [activeTab, setActiveTab] = useState("Household");

  return (
    <div className="min-h-screen w-screen flex flex-col border relative outline-4 outline-red-500">
      <nav className="flex justify-center items-center bg-gray-900 sticky top-0 z-10 outline-2 outline-blue-500">
        <button
          onClick={() => setActiveTab("Household")}
          className={`px-6 py-3 text-lg font-medium transition-colors duration-200 border-b-2 outline-2 outline-green-500 ${
            activeTab === "Household"
              ? "border-white text-white bg-gray-800"
              : "border-transparent text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          Household
        </button>
        <button
          onClick={() => setActiveTab("Finances")}
          className={`px-6 py-3 text-lg font-medium transition-colors duration-200 border-b-2 outline-2 outline-green-500 ${
            activeTab === "Finances"
              ? "border-white text-white bg-gray-800"
              : "border-transparent text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          Finances
        </button>
        <button
          onClick={() => setActiveTab("Cleo")}
          className={`px-6 py-3 text-lg font-medium transition-colors duration-200 border-b-2 outline-2 outline-green-500 ${
            activeTab === "Cleo"
              ? "border-white text-white bg-gray-800"
              : "border-transparent text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          Cleo
        </button>
        <button
          onClick={() => setActiveTab("Job")}
          className={`px-6 py-3 text-lg font-medium transition-colors duration-200 border-b-2 outline-2 outline-green-500 ${
            activeTab === "Job"
              ? "border-white text-white bg-gray-800"
              : "border-transparent text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          Job
        </button>
      </nav>
      <main className="flex-1 flex items-center justify-center outline-2 outline-purple-500">
        {activeTab === "Household" && <Household />}
        {activeTab === "Finances" && <Finances />}
        {activeTab === "Cleo" && <Cleo />}
        {activeTab === "Job" && <Job />}
      </main>
    </div>
  );
}

export default App;
