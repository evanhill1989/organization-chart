// app/routes/_index.tsx

import { Link, useNavigate } from "react-router";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Register the MotionPathPlugin
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { gsap } from "gsap";
import DarkModeToggle from "../components/ui/DarkModeToggle";
import { useAuth } from "../context/AuthContext";

gsap.registerPlugin(MotionPathPlugin);

const queryClient = new QueryClient();

export default function Dashboard() {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen w-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors">
          <div className="text-gray-900 dark:text-gray-100">Loading...</div>
        </div>
      </QueryClientProvider>
    );
  }

  // Show landing page
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen w-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
        <nav className="flex justify-between items-center bg-gray-900 dark:bg-gray-800 sticky top-0 z-10 px-4">
          <div className="flex space-x-6">
            <Link
              to="/"
              className="px-6 py-3 text-lg font-medium text-white"
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  to="/org-chart"
                  className="px-6 py-3 text-lg font-medium text-white hover:text-blue-400 transition-colors"
                >
                  Org Chart
                </Link>
                <Link
                  to="/journal"
                  className="px-6 py-3 text-lg font-medium text-white hover:text-blue-400 transition-colors"
                >
                  Journal
                </Link>
                <Link
                  to="/food-planning"
                  className="px-6 py-3 text-lg font-medium text-white hover:text-blue-400 transition-colors"
                >
                  Food Planning
                </Link>
              </>
            )}
          </div>

          <DarkModeToggle />
        </nav>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-2xl">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Welcome to Your Organization Chart
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Manage your tasks, track your progress, and stay organized with our powerful task management system.
            </p>

            {/* Auth buttons for unauthenticated users */}
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors min-w-[150px]"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors min-w-[150px]"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Feature links for authenticated users */}
            {user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/org-chart"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors min-w-[150px]"
                >
                  Org Chart
                </Link>
                <Link
                  to="/journal"
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors min-w-[150px]"
                >
                  Journal
                </Link>
                <Link
                  to="/food-planning"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors min-w-[150px]"
                >
                  Food Planning
                </Link>
              </div>
            )}

            {/* Features section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Task Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Organize tasks by categories, set deadlines, and track urgency levels.
                </p>
              </div>
              <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Recurring Tasks
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Set up recurring tasks with flexible scheduling options.
                </p>
              </div>
              <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Visual Organization
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  See your work organized hierarchically with interactive visualizations.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}
