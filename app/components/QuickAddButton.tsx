// components/QuickAddButton.tsx
// if you have a className combiner, else just inline

import { cn } from "../lib/utils";

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
        "text-gray-300 hover:text-white transition-colors flex items-center space-x-1 p-2 rounded",
        !showLabel && "justify-center", // keeps it centered for icon-only
        className
      )}
      title="Quick Add Task"
    >
      <svg
        className="w-5 h-5"
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
      {showLabel && <span className="hidden sm:inline text-sm">Quick Add</span>}
    </button>
  );
}
