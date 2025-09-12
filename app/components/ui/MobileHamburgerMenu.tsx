// app/components/ui/MobileHamburgerMenu.tsx
import { Link } from "react-router";
import TabNavigationList from "./TabNavigationList";

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
      <div className="bg-opacity-50 fixed inset-0 bg-black" onClick={onClose} />

      {/* Menu Panel */}
      <div className="fixed top-0 left-0 h-full w-80 transform bg-gray-900 shadow-xl transition-transform dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-white">Navigation</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-white"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          <Link
            to="/"
            className="mb-2 block rounded px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            onClick={onClose}
          >
            ← Home
          </Link>

          <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="mb-3 text-sm font-medium tracking-wide text-gray-400 uppercase">
              Categories
            </h3>

            <TabNavigationList
              activeTab={activeTab}
              variant="mobile"
              onTabClick={onClose}
              className="space-y-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
