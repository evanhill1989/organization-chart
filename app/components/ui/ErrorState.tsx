interface ErrorStateProps {
  error: string;
  onClick: () => void;
}

export default function ErrorState({ error, onClick }: ErrorStateProps) {
  return (
    <div className="text-center py-8 text-red-600">
      <p className="mt-2">Error: {error}</p>
      <button
        onClick={() => onClick()}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
}
