// components/QuickAddButton.tsx
// if you have a className combiner, else just inline

import { cn } from "../../lib/utils";

interface QuickAddButtonProps {
  onClick: () => void;
  showLabel?: boolean; // toggles whether to render the "Quick Add" text
  className?: string; // optional extra classes
}

export default function QuickAddButton({
  onClick,
  showLabel = false,
  className,
}: QuickAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center space-x-1 rounded p-2 text-gray-300 transition-colors hover:text-white",
        !showLabel && "justify-center", // keeps it centered for icon-only
        className,
      )}
      title="Quick Add Task"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      {showLabel && <span className="hidden text-sm sm:inline">Quick Add</span>}
    </button>
  );
}
