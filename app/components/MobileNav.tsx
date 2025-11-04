import DarkModeToggle from "./ui/DarkModeToggle";
import QuickAddButton from "./tasks/QuickAddButton";
import TasksDueTodayButton from "./tasks/TasksDueTodayButton";
import { useAuth } from "../context/AuthContext";

export default function MobileNav({
  onOpenTasksDueToday,
  onOpenQuickAdd,
  onOpenTimeReport,
  onOpenHamburger,
}) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Hamburger Menu */}
        <button
          onClick={onOpenHamburger}
          className="rounded p-2 text-gray-300 transition-colors hover:text-white"
          aria-label="Open navigation menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Right: Action buttons */}
        <div className="flex items-center space-x-2">
          <DarkModeToggle />

          <TasksDueTodayButton onClick={onOpenTasksDueToday} />
          <button onClick={onOpenTimeReport}>⏱️</button>

          <QuickAddButton onClick={onOpenQuickAdd} />

          {/* User avatar and sign out */}
          {user && (
            <>
              {/* User avatar - shows first letter of email */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {user.email?.charAt(0).toUpperCase() || "U"}
              </div>

              {/* Sign Out button */}
              <button
                onClick={handleSignOut}
                className="rounded-lg px-2 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
