import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Menu, Users, StickyNote, CheckSquare, Folder, BarChart, Settings, BrainCircuit } from 'lucide-react';

const Navigation = ({ isMobileMenuOpen, setIsMobileMenuOpen, onOpenSettings }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null; // Don't show nav on login page

  const navSections = [
    {
      title: 'Workspace',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Notes', icon: StickyNote, path: '/notes' },
        { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
        { name: 'Routines', icon: Folder, path: '/routines' },
      ]
    },
    {
      title: 'Collaboration',
      items: [
        { name: 'Group', icon: Users, path: '/flatmanager' },
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { name: 'Reports', icon: BarChart, path: '/reports', premium: true },
        { name: 'AI Mentor', icon: BrainCircuit, path: '/mentor', premium: true },
      ]
    }
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

        <div className="flex-1 px-4 py-2 space-y-6 overflow-y-auto hide-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                        ? item.premium 
                          ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                          : 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                        : item.premium
                          ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      <item.icon
                        className={`w-4.5 h-4.5 mr-3 transition-colors ${isActive
                          ? 'text-white dark:text-inherit'
                          : item.premium
                            ? 'text-indigo-500'
                            : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                          }`}
                      />
                      <span className="flex-1">{item.name}</span>
                      {item.premium && !isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
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
