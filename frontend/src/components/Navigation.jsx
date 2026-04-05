import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Menu, Users, StickyNote, CheckSquare, Folder, BarChart, Settings } from 'lucide-react';

const Navigation = ({ isMobileMenuOpen, setIsMobileMenuOpen, onOpenSettings }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null; // Don't show nav on login page

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Notes', icon: StickyNote, path: '/notes' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Routines', icon: Folder, path: '/routines' },
    { name: 'Group', icon: Users, path: '/flatmanager' },
    { name: 'Reports', icon: BarChart, path: '/reports' },
  ];

  const currentPath = location.pathname;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300 ease-in-out flex flex-col sm:relative sm:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}`}>

        <div className="p-6 flex items-center justify-between sm:justify-start">
          <div className="flex items-center">
            {/* Hexagon Logo approximation */}
            <img src="/logo.png" className="w-8 h-8 dark:invert-0 invert mr-2" />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">OmniFlow</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="sm:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto hide-scrollbar">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${isActive
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <item.icon
                  className={`w-5 h-5 mr-3 transition-colors ${isActive
                    ? 'text-white dark:text-black'
                    : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                    }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-50 space-y-1 dark:border-gray-800">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenSettings();
            }}
            className="group w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
          >
            <Settings className="w-5 h-5 mr-3 text-gray-400 transition-colors group-hover:text-gray-900 dark:group-hover:text-gray-100" />
            Settings
          </button>
        </div>
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/20 backdrop-blur-sm sm:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;
