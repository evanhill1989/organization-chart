import DarkModeToggle from "./ui/DarkModeToggle";
import QuickAddButton from "./tasks/QuickAddButton";
import TasksDueTodayButton from "./tasks/TasksDueTodayButton";

export default function MobileNav({
  onOpenTasksDueToday,
  onOpenQuickAdd,
  onOpenTimeReport,
  onOpenHamburger,
}) {
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
        </div>
      </div>
    </>
  );
}
