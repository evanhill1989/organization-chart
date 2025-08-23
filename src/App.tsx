import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import OrgChartTab from "./OrgChartTab";

import type { OrgNode } from "./types/orgChart";
import { fetchOrgTree } from "./lib/fetchOrgTree";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const TABS = [
  "Household",
  "Finances",
  "Cleo",
  "Job",
  "Social",
  "Personal",
  "Orphans",
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(
    () =>
      (localStorage.getItem("activeTab") as (typeof TABS)[number]) ||
      "Household"
  );

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // React Query fetch for the active tab
  const {
    data: tree,
    isLoading,
    error,
    // isPlaceholderData,
  } = useQuery<OrgNode>({
    queryKey: ["orgTree", activeTab],
    queryFn: () => fetchOrgTree(activeTab),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="min-h-screen w-screen flex flex-col">
      <nav className="flex justify-center items-center bg-gray-900 sticky top-0 z-10">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors duration-200 ${
              activeTab === tab
                ? "border-white text-white bg-gray-800"
                : "border-transparent text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        {isLoading && <div>Loading {activeTab} tree...</div>}
        {error && <div>Error loading {activeTab} tree</div>}
        {tree && <OrgChartTab tree={tree} tabName={activeTab} />}
      </main>
    </div>
  );
}
