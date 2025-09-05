export default function LoadingState() {
  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center space-x-2 text-gray-600">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span>Loading tasks...</span>
      </div>
    </div>
  );
}
