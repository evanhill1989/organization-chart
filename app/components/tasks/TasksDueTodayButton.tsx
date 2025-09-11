type Props = {
  onClick: () => void;
};

export default function TasksDueTodayButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
      title="Tasks Due Today"
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
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span className="hidden sm:inline text-sm">Today</span>
    </button>
  );
}
