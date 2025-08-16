import { useState } from "react";

import OrgChartTab from "./OrgChartTab";
import { householdTree } from "./data/householdTree";
import { financesTree } from "./data/financesTree";
import { cleoTree } from "./data/cleoTree";
import { jobTree } from "./data/jobTree";
import { socialTree } from "./data/socialTree";

import { orphansTree } from "./data/orphansTree";

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
        <button
          onClick={() => setActiveTab("Orphans")}
          className={`px-6 py-3 text-lg font-medium transition-colors duration-200 border-b-2 outline-2 outline-green-500 ${
            activeTab === "Orphans"
              ? "border-white text-white bg-gray-800"
              : "border-transparent text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          Orphans
        </button>
        <button
          onClick={() => setActiveTab("Social")}
          className={`px-6 py-3 text-lg font-medium transition-colors duration-200 border-b-2 outline-2 outline-green-500 ${
            activeTab === "Social"
              ? "border-white text-white bg-gray-800"
              : "border-transparent text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          Social
        </button>
      </nav>
      <main className="flex-1 flex items-center justify-center outline-2 outline-purple-500">
        {activeTab === "Household" && (
          <OrgChartTab tree={householdTree} tabName="Household" />
        )}
        {activeTab === "Finances" && (
          <OrgChartTab tree={financesTree} tabName="Finances" />
        )}
        {activeTab === "Cleo" && <OrgChartTab tree={cleoTree} tabName="Cleo" />}
        {activeTab === "Job" && <OrgChartTab tree={jobTree} tabName="Job" />}
        {activeTab === "Orphans" && (
          <OrgChartTab tree={orphansTree} tabName="Orphans" />
        )}
        {activeTab === "Social" && (
          <OrgChartTab tree={socialTree} tabName="Social" />
        )}
      </main>
    </div>
  );
}

export default App;
