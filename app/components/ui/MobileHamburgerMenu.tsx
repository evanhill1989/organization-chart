import { Link } from "react-router";

const TABS = [
  "Household",
  "Finances",
  "Cleo",
  "Job",
  "Social",
  "Personal",
  "Orphans",
] as const;

export default function MobileHamburgerMenu({
  isOpen,
  onClose,
  activeTab,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Menu Panel */}
      <div className="fixed top-0 left-0 h-full w-80 bg-gray-900 dark:bg-gray-800 shadow-xl transform transition-transform">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Navigation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          <Link
            to="/"
            className="block py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors mb-2"
            onClick={onClose}
          >
            ← Home
          </Link>

          <div className="border-t border-gray-700 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {TABS.map((tab) => (
                <Link
                  key={tab}
                  to={`/org-chart/${tab}`}
                  onClick={onClose}
                  className={`block py-3 px-4 rounded transition-colors ${
                    activeTab === tab
                      ? "bg-gray-700 text-white border-l-4 border-blue-500"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {tab}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
