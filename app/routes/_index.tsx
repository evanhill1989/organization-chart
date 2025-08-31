// app/routes/_index.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Register the MotionPathPlugin
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { gsap } from "gsap";

gsap.registerPlugin(MotionPathPlugin);

const queryClient = new QueryClient();

export default function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) {
      return JSON.parse(stored);
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen w-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
        <nav className="flex justify-between items-center bg-gray-900 dark:bg-gray-800 sticky top-0 z-10 px-4">
          <div className="flex space-x-6">
            <Link
              to="/org-chart"
              className="px-6 py-3 text-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              Org Chart
            </Link>
            <Link
              to="/journal"
              className="px-6 py-3 text-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              Journal
            </Link>
          </div>

          <button
            onClick={toggleDarkMode}
            className="text-gray-300 hover:text-white transition-colors"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </nav>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              Welcome to Your Dashboard
            </h1>
            <div className="grid grid-cols-2 gap-8 max-w-md">
              <Link
                to="/org-chart"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Org Chart
              </Link>
              <Link
                to="/journal"
                className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Journal
              </Link>
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}
